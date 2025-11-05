use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json, Router,
    routing::get,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    error::AppError,
    models::{AuditLog, AuditResponse, Campaign, Disbursement, Donation},
    AppState,
};

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/:campaign_id", get(get_campaign_audit))
}

/// Get full transaction history for a campaign (merged on/off-chain)
async fn get_campaign_audit(
    State(state): State<Arc<AppState>>,
    Path(campaign_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    // Get campaign details
    let campaign = sqlx::query_as::<_, Campaign>(
        "SELECT * FROM campaigns WHERE id = $1"
    )
    .bind(campaign_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Campaign not found".to_string()))?;

    // Get all donations for this campaign
    let donations = sqlx::query_as::<_, Donation>(
        "SELECT * FROM donations WHERE campaign_id = $1 ORDER BY timestamp DESC"
    )
    .bind(campaign_id)
    .fetch_all(&state.db)
    .await?;

    // Get all disbursements for this campaign
    let disbursements = sqlx::query_as::<_, Disbursement>(
        "SELECT * FROM disbursements WHERE campaign_id = $1 ORDER BY created_at DESC"
    )
    .bind(campaign_id)
    .fetch_all(&state.db)
    .await?;

    // Get all audit logs for this campaign
    let audit_logs = sqlx::query_as::<_, AuditLog>(
        r#"
        SELECT * FROM audit_logs
        WHERE (entity_type = 'campaign' AND entity_id = $1)
        OR (entity_type = 'donation' AND entity_id IN (
            SELECT id FROM donations WHERE campaign_id = $1
        ))
        OR (entity_type = 'disbursement' AND entity_id IN (
            SELECT id FROM disbursements WHERE campaign_id = $1
        ))
        ORDER BY created_at DESC
        "#
    )
    .bind(campaign_id)
    .fetch_all(&state.db)
    .await?;

    // Compile complete audit response
    let response = AuditResponse {
        campaign,
        donations,
        disbursements,
        audit_logs,
    };

    Ok(Json(response))
}
