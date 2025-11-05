use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json, Router,
    routing::{get, post},
};
use serde_json::json;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    error::AppError,
    models::{CreateDonationRequest, Donation, DonationQueryParams},
    services::stellar_service,
    AppState,
};

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", post(create_donation))
        .route("/:campaign_id", get(get_campaign_donations))
}

/// Record a donation and trigger on-chain donate
async fn create_donation(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateDonationRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Verify campaign exists and is active
    let campaign = sqlx::query!(
        r#"
        SELECT c.id, c.contract_campaign_id, c.status, c.goal_amount, c.raised_amount
        FROM campaigns c
        WHERE c.id = $1
        "#,
        payload.campaign_id
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Campaign not found".to_string()))?;

    if campaign.status != "active" {
        return Err(AppError::BadRequest(
            "Campaign is not active".to_string(),
        ));
    }

    // Process donation on blockchain
    if let Some(contract_campaign_id) = campaign.contract_campaign_id {
        stellar_service::process_donation_on_chain(
            &state.config,
            contract_campaign_id as u32,
            &payload.donor_address,
            payload.amount,
        )
        .await?;
    }

    // Insert donation into database
    let donation = sqlx::query_as::<_, Donation>(
        r#"
        INSERT INTO donations (campaign_id, donor_address, amount, tx_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        "#,
    )
    .bind(payload.campaign_id)
    .bind(&payload.donor_address)
    .bind(payload.amount)
    .bind(&payload.tx_hash)
    .fetch_one(&state.db)
    .await?;

    // Update campaign raised amount
    let new_raised = campaign.raised_amount + payload.amount;
    let _ = sqlx::query!(
        r#"
        UPDATE campaigns
        SET raised_amount = $1, updated_at = NOW()
        WHERE id = $2
        "#,
        new_raised,
        payload.campaign_id
    )
    .execute(&state.db)
    .await;

    // Check if goal reached
    let status = if new_raised >= campaign.goal_amount {
        "completed"
    } else {
        "active"
    };
    let _ = sqlx::query!(
        "UPDATE campaigns SET status = $1 WHERE id = $2",
        status,
        payload.campaign_id
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
    .bind("donation")
    .bind(donation.id)
    .bind("created")
    .bind(&payload.donor_address)
    .bind(json!({
        "campaign_id": payload.campaign_id,
        "amount": payload.amount,
        "tx_hash": &payload.tx_hash
    }))
    .execute(&state.db)
    .await;

    Ok((StatusCode::CREATED, Json(donation)))
}

/// Get donation list for a campaign
async fn get_campaign_donations(
    State(state): State<Arc<AppState>>,
    Path(campaign_id): Path<Uuid>,
    Query(params): Query<DonationQueryParams>,
) -> Result<impl IntoResponse, AppError> {
    let limit = params.limit.unwrap_or(100);
    let offset = params.offset.unwrap_or(0);

    let mut query = format!(
        r#"
        SELECT * FROM donations
        WHERE campaign_id = '{}'
        "#,
        campaign_id
    );

    if let Some(donor_address) = params.donor_address {
        query.push_str(&format!(" AND donor_address = '{}'", donor_address));
    }

    query.push_str(&format!(
        " ORDER BY timestamp DESC LIMIT {} OFFSET {}",
        limit, offset
    ));

    let donations = sqlx::query_as::<_, Donation>(&query)
        .fetch_all(&state.db)
        .await?;

    // Get total count
    let total = sqlx::query!(
        "SELECT COUNT(*) as count FROM donations WHERE campaign_id = $1",
        campaign_id
    )
    .fetch_one(&state.db)
    .await?;

    let response = json!({
        "donations": donations,
        "total": total.count.unwrap_or(0),
        "limit": limit,
        "offset": offset
    });

    Ok(Json(response))
}
