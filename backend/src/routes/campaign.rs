use axum::{use axum::{

    extract::{Path, Query, State},    extract::{Path, State},

    http::StatusCode,    routing::{get, post},

    response::IntoResponse,    Json, Router,

    Json, Router,};

    routing::{get, post, patch},use sqlx::PgPool;

};use uuid::Uuid;

use serde_json::json;

use std::sync::Arc;use crate::{

use uuid::Uuid;    error::Result,

    models::{Campaign, CreateCampaignRequest},

use crate::{};

    error::AppError,

    models::{pub fn routes(pool: PgPool) -> Router {

        Campaign, CampaignQueryParams, CampaignWithOrg,     Router::new()

        CreateCampaignRequest, UpdateCampaignRequest,        .route("/", get(list_campaigns).post(create_campaign))

    },        .route("/:id", get(get_campaign).delete(close_campaign))

    services::stellar_service,        .route("/:id/stats", get(get_campaign_stats))

    AppState,        .with_state(pool)

};}



pub fn routes() -> Router<Arc<AppState>> {async fn create_campaign(

    Router::new()    State(pool): State<PgPool>,

        .route("/", post(create_campaign))    Json(payload): Json<CreateCampaignRequest>,

        .route("/", get(list_campaigns))) -> Result<Json<Campaign>> {

        .route("/:id", get(get_campaign))    let campaign = sqlx::query_as::<_, Campaign>(

        .route("/:id", patch(update_campaign))        r#"

}        INSERT INTO campaigns (ngo_address, title, description, target_amount, raised_amount, is_active)

        VALUES ($1, $2, $3, $4, '0', true)

/// Create a new campaign (off-chain + on-chain)        RETURNING *

async fn create_campaign(        "#,

    State(state): State<Arc<AppState>>,    )

    Json(payload): Json<CreateCampaignRequest>,    .bind(&payload.ngo_address)

) -> Result<impl IntoResponse, AppError> {    .bind(&payload.title)

    // Verify organization exists    .bind(&payload.description)

    let org = sqlx::query!(    .bind(&payload.target_amount)

        "SELECT wallet_address FROM organizations WHERE id = $1",    .fetch_one(&pool)

        payload.org_id    .await?;

    )

    .fetch_optional(&state.db)    Ok(Json(campaign))

    .await?}

    .ok_or_else(|| AppError::NotFound("Organization not found".to_string()))?;

async fn list_campaigns(State(pool): State<PgPool>) -> Result<Json<Vec<Campaign>>> {

    // Create campaign on blockchain    let campaigns = sqlx::query_as::<_, Campaign>(

    let contract_campaign_id = stellar_service::create_campaign_on_chain(        "SELECT * FROM campaigns ORDER BY created_at DESC"

        &state.config,    )

        &org.wallet_address,    .fetch_all(&pool)

        &payload.name,    .await?;

        payload.goal_amount,

        payload.deadline.timestamp() as u64,    Ok(Json(campaigns))

    )}

    .await?;

async fn get_campaign(

    // Insert campaign into database    State(pool): State<PgPool>,

    let campaign = sqlx::query_as::<_, Campaign>(    Path(id): Path<Uuid>,

        r#") -> Result<Json<Campaign>> {

        INSERT INTO campaigns (name, org_id, goal_amount, deadline, description, contract_campaign_id, status)    let campaign = sqlx::query_as::<_, Campaign>(

        VALUES ($1, $2, $3, $4, $5, $6, 'active')        "SELECT * FROM campaigns WHERE id = $1"

        RETURNING *    )

        "#,    .bind(id)

    )    .fetch_optional(&pool)

    .bind(&payload.name)    .await?

    .bind(payload.org_id)    .ok_or_else(|| crate::error::AppError::NotFound("Campaign not found".to_string()))?;

    .bind(payload.goal_amount)

    .bind(payload.deadline)    Ok(Json(campaign))

    .bind(&payload.description)}

    .bind(contract_campaign_id)

    .fetch_one(&state.db)async fn close_campaign(

    .await?;    State(pool): State<PgPool>,

    Path(id): Path<Uuid>,

    // Log audit) -> Result<Json<Campaign>> {

    let _ = sqlx::query(    let campaign = sqlx::query_as::<_, Campaign>(

        r#"        "UPDATE campaigns SET is_active = false WHERE id = $1 RETURNING *"

        INSERT INTO audit_logs (entity_type, entity_id, action, actor_address, details)    )

        VALUES ($1, $2, $3, $4, $5)    .bind(id)

        "#,    .fetch_optional(&pool)

    )    .await?

    .bind("campaign")    .ok_or_else(|| crate::error::AppError::NotFound("Campaign not found".to_string()))?;

    .bind(campaign.id)

    .bind("created")    Ok(Json(campaign))

    .bind(&org.wallet_address)}

    .bind(json!({

        "name": &payload.name,#[derive(serde::Serialize)]

        "goal_amount": payload.goal_amount,struct CampaignStats {

        "contract_campaign_id": contract_campaign_id    total_donations: i64,

    }))    unique_donors: i64,

    .execute(&state.db)    average_donation: String,

    .await;    progress_percentage: f64,

}

    Ok((StatusCode::CREATED, Json(campaign)))

}async fn get_campaign_stats(

    State(pool): State<PgPool>,

/// List campaigns with optional filtering    Path(id): Path<Uuid>,

async fn list_campaigns() -> Result<Json<CampaignStats>> {

    State(state): State<Arc<AppState>>,    let stats = sqlx::query!(

    Query(params): Query<CampaignQueryParams>,        r#"

) -> Result<impl IntoResponse, AppError> {        SELECT 

    let limit = params.limit.unwrap_or(50);            COUNT(d.id) as "total_donations!",

    let offset = params.offset.unwrap_or(0);            COUNT(DISTINCT d.donor_address) as "unique_donors!",

            COALESCE(AVG(d.amount::numeric), 0) as "average_donation!",

    let mut query = String::from(            c.target_amount,

        r#"            c.raised_amount

        SELECT         FROM campaigns c

            c.*,        LEFT JOIN donations d ON d.campaign_id = c.id

            o.name as org_name,        WHERE c.id = $1

            o.wallet_address as org_wallet_address,        GROUP BY c.id, c.target_amount, c.raised_amount

            o.verified as org_verified        "#,

        FROM campaigns c        id

        INNER JOIN organizations o ON c.org_id = o.id    )

        WHERE 1=1    .fetch_optional(&pool)

        "#,    .await?

    );    .ok_or_else(|| crate::error::AppError::NotFound("Campaign not found".to_string()))?;



    let mut bindings: Vec<String> = Vec::new();    let target: f64 = stats.target_amount.parse().unwrap_or(1.0);

    let raised: f64 = stats.raised_amount.parse().unwrap_or(0.0);

    if let Some(org_id) = params.org_id {    let progress_percentage = (raised / target) * 100.0;

        bindings.push(format!("AND c.org_id = '{}'", org_id));

    }    Ok(Json(CampaignStats {

        total_donations: stats.total_donations,

    if let Some(status) = params.status {        unique_donors: stats.unique_donors,

        bindings.push(format!("AND c.status = '{}'", status));        average_donation: format!("{:.2}", stats.average_donation),

    }        progress_percentage,

    }))

    for binding in bindings {}

        query.push_str(&format!(" {}", binding));
    }

    query.push_str(&format!(
        " ORDER BY c.created_at DESC LIMIT {} OFFSET {}",
        limit, offset
    ));

    let campaigns = sqlx::query_as::<_, CampaignWithOrg>(&query)
        .fetch_all(&state.db)
        .await?;

    Ok(Json(campaigns))
}

/// Get campaign details by ID
async fn get_campaign(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let campaign = sqlx::query_as::<_, CampaignWithOrg>(
        r#"
        SELECT 
            c.*,
            o.name as org_name,
            o.wallet_address as org_wallet_address,
            o.verified as org_verified
        FROM campaigns c
        INNER JOIN organizations o ON c.org_id = o.id
        WHERE c.id = $1
        "#,
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Campaign not found".to_string()))?;

    Ok(Json(campaign))
}

/// Update campaign status or raised amount
async fn update_campaign(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateCampaignRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Get existing campaign
    let mut campaign = sqlx::query_as::<_, Campaign>(
        "SELECT * FROM campaigns WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Campaign not found".to_string()))?;

    // Update fields if provided
    if let Some(status) = payload.status {
        campaign.status = status;
    }
    if let Some(raised_amount) = payload.raised_amount {
        campaign.raised_amount = raised_amount;
    }

    // Update in database
    let updated_campaign = sqlx::query_as::<_, Campaign>(
        r#"
        UPDATE campaigns
        SET status = $1, raised_amount = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
        "#,
    )
    .bind(&campaign.status)
    .bind(campaign.raised_amount)
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(updated_campaign))
}
