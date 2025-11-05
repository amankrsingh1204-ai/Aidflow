use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json, Router,
    routing::{get, post, patch},
};
use serde_json::json;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    error::AppError,
    models::{
        ApproveDisbursementRequest, CreateDisbursementRequest, 
        Disbursement, ExecuteDisbursementRequest,
    },
    services::stellar_service,
    AppState,
};

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", post(create_disbursement))
        .route("/:id", get(get_disbursement))
        .route("/:id/approve", post(approve_disbursement))
        .route("/:id/execute", post(execute_disbursement))
        .route("/campaign/:campaign_id", get(get_campaign_disbursements))
}

/// Create a new disbursement request
async fn create_disbursement(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateDisbursementRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Verify campaign exists
    let campaign = sqlx::query!(
        r#"
        SELECT c.id, c.raised_amount, c.contract_campaign_id, o.wallet_address
        FROM campaigns c
        INNER JOIN organizations o ON c.org_id = o.id
        WHERE c.id = $1
        "#,
        payload.campaign_id
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Campaign not found".to_string()))?;

    // Check if sufficient funds
    if payload.amount > campaign.raised_amount {
        return Err(AppError::BadRequest(
            "Insufficient funds in campaign".to_string(),
        ));
    }

    // Insert disbursement
    let disbursement = sqlx::query_as::<_, Disbursement>(
        r#"
        INSERT INTO disbursements (campaign_id, recipient_address, amount, status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING *
        "#,
    )
    .bind(payload.campaign_id)
    .bind(&payload.recipient_address)
    .bind(payload.amount)
    .fetch_one(&state.db)
    .await?;

    // Log audit
    let _ = sqlx::query(
        r#"
        INSERT INTO audit_logs (entity_type, entity_id, action, actor_address, details)
        VALUES ($1, $2, $3, $4, $5)
        "#,
    )
    .bind("disbursement")
    .bind(disbursement.id)
    .bind("created")
    .bind(&campaign.wallet_address.unwrap_or_default())
    .bind(json!({
        "campaign_id": payload.campaign_id,
        "recipient_address": &payload.recipient_address,
        "amount": payload.amount
    }))
    .execute(&state.db)
    .await;

    Ok((StatusCode::CREATED, Json(disbursement)))
}

/// Get disbursement by ID
async fn get_disbursement(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let disbursement = sqlx::query_as::<_, Disbursement>(
        "SELECT * FROM disbursements WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Disbursement not found".to_string()))?;

    Ok(Json(disbursement))
}

/// Approve a disbursement (multi-signature logic)
async fn approve_disbursement(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(payload): Json<ApproveDisbursementRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Get disbursement
    let disbursement = sqlx::query_as::<_, Disbursement>(
        "SELECT * FROM disbursements WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Disbursement not found".to_string()))?;

    if disbursement.status != "pending" {
        return Err(AppError::BadRequest(
            "Disbursement is not in pending status".to_string(),
        ));
    }

    // Update approved_by with approver addresses
    let approved_by = payload.approver_addresses.join(",");
    
    let updated = sqlx::query_as::<_, Disbursement>(
        r#"
        UPDATE disbursements
        SET approved_by = $1, status = 'approved'
        WHERE id = $2
        RETURNING *
        "#,
    )
    .bind(&approved_by)
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    // Log audit
    for approver in &payload.approver_addresses {
        let _ = sqlx::query(
            r#"
            INSERT INTO audit_logs (entity_type, entity_id, action, actor_address, details)
            VALUES ($1, $2, $3, $4, $5)
            "#,
        )
        .bind("disbursement")
        .bind(id)
        .bind("approved")
        .bind(approver)
        .bind(json!({"approver": approver}))
        .execute(&state.db)
        .await;
    }

    Ok(Json(updated))
}

/// Execute an approved disbursement on-chain
async fn execute_disbursement(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(payload): Json<ExecuteDisbursementRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Get disbursement
    let disbursement = sqlx::query!(
        r#"
        SELECT d.*, c.contract_campaign_id
        FROM disbursements d
        INNER JOIN campaigns c ON d.campaign_id = c.id
        WHERE d.id = $1
        "#,
        id
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Disbursement not found".to_string()))?;

    if disbursement.status != "approved" {
        return Err(AppError::BadRequest(
            "Disbursement must be approved first".to_string(),
        ));
    }

    // Execute disbursement on blockchain
    if let Some(contract_campaign_id) = disbursement.contract_campaign_id {
        stellar_service::execute_disbursement_on_chain(
            &state.config,
            contract_campaign_id as u32,
            &disbursement.recipient_address,
            disbursement.amount,
        )
        .await?;
    }

    // Update disbursement status and tx_hash
    let updated = sqlx::query_as::<_, Disbursement>(
        r#"
        UPDATE disbursements
        SET status = 'executed', tx_hash = $1, executed_at = NOW()
        WHERE id = $2
        RETURNING *
        "#,
    )
    .bind(&payload.tx_hash)
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    // Update campaign raised amount (decrease)
    let _ = sqlx::query!(
        r#"
        UPDATE campaigns
        SET raised_amount = raised_amount - $1
        WHERE id = $2
        "#,
        disbursement.amount,
        disbursement.campaign_id
    )
    .execute(&state.db)
    .await;

    // Log audit
    let _ = sqlx::query(
        r#"
        INSERT INTO audit_logs (entity_type, entity_id, action, actor_address, details)
        VALUES ($1, $2, $3, $4, $5)
        "#,
    )
    .bind("disbursement")
    .bind(id)
    .bind("executed")
    .bind(&disbursement.recipient_address)
    .bind(json!({
        "tx_hash": &payload.tx_hash,
        "amount": disbursement.amount
    }))
    .execute(&state.db)
    .await;

    Ok(Json(updated))
}

/// Get all disbursements for a campaign
async fn get_campaign_disbursements(
    State(state): State<Arc<AppState>>,
    Path(campaign_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let disbursements = sqlx::query_as::<_, Disbursement>(
        "SELECT * FROM disbursements WHERE campaign_id = $1 ORDER BY created_at DESC"
    )
    .bind(campaign_id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(disbursements))
}
