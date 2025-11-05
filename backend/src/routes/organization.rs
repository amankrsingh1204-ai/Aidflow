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
    models::{CreateOrganizationRequest, Organization, UpdateOrganizationRequest},
    AppState,
};

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", post(create_organization))
        .route("/", get(list_organizations))
        .route("/:id", get(get_organization))
        .route("/:id", patch(update_organization))
        .route("/wallet/:wallet_address", get(get_organization_by_wallet))
}

/// Create a new organization (NGO)
async fn create_organization(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateOrganizationRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Check if wallet address already exists
    let existing = sqlx::query_as::<_, Organization>(
        "SELECT * FROM organizations WHERE wallet_address = $1"
    )
    .bind(&payload.wallet_address)
    .fetch_optional(&state.db)
    .await?;

    if existing.is_some() {
        return Err(AppError::BadRequest(
            "Organization with this wallet address already exists".to_string(),
        ));
    }

    // Insert organization
    let org = sqlx::query_as::<_, Organization>(
        r#"
        INSERT INTO organizations (name, wallet_address, email, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        "#,
    )
    .bind(&payload.name)
    .bind(&payload.wallet_address)
    .bind(&payload.email)
    .bind(&payload.description)
    .fetch_one(&state.db)
    .await?;

    // Log audit
    let _ = sqlx::query(
        r#"
        INSERT INTO audit_logs (entity_type, entity_id, action, actor_address, details)
        VALUES ($1, $2, $3, $4, $5)
        "#,
    )
    .bind("organization")
    .bind(org.id)
    .bind("created")
    .bind(&payload.wallet_address)
    .bind(json!({"name": &payload.name}))
    .execute(&state.db)
    .await;

    Ok((StatusCode::CREATED, Json(org)))
}

/// List all organizations with optional filtering
async fn list_organizations(
    State(state): State<Arc<AppState>>,
) -> Result<impl IntoResponse, AppError> {
    let orgs = sqlx::query_as::<_, Organization>(
        "SELECT * FROM organizations ORDER BY created_at DESC"
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(orgs))
}

/// Get organization by ID
async fn get_organization(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let org = sqlx::query_as::<_, Organization>(
        "SELECT * FROM organizations WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Organization not found".to_string()))?;

    Ok(Json(org))
}

/// Get organization by wallet address
async fn get_organization_by_wallet(
    State(state): State<Arc<AppState>>,
    Path(wallet_address): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let org = sqlx::query_as::<_, Organization>(
        "SELECT * FROM organizations WHERE wallet_address = $1"
    )
    .bind(wallet_address)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Organization not found".to_string()))?;

    Ok(Json(org))
}

/// Update organization
async fn update_organization(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateOrganizationRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Get existing organization
    let mut org = sqlx::query_as::<_, Organization>(
        "SELECT * FROM organizations WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Organization not found".to_string()))?;

    // Update fields if provided
    if let Some(name) = payload.name {
        org.name = name;
    }
    if let Some(email) = payload.email {
        org.email = Some(email);
    }
    if let Some(description) = payload.description {
        org.description = Some(description);
    }
    if let Some(verified) = payload.verified {
        org.verified = verified;
    }

    // Update in database
    let updated_org = sqlx::query_as::<_, Organization>(
        r#"
        UPDATE organizations
        SET name = $1, email = $2, description = $3, verified = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *
        "#,
    )
    .bind(&org.name)
    .bind(&org.email)
    .bind(&org.description)
    .bind(org.verified)
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    // Log audit
    let _ = sqlx::query(
        r#"
        INSERT INTO audit_logs (entity_type, entity_id, action, actor_address, details)
        VALUES ($1, $2, $3, $4, $5)
        "#,
    )
    .bind("organization")
    .bind(id)
    .bind("updated")
    .bind(&org.wallet_address)
    .bind(json!({"verified": org.verified}))
    .execute(&state.db)
    .await;

    Ok(Json(updated_org))
}
