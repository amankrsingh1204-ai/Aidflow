use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};

// ===========================
// Organization Models
// ===========================

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Organization {
    pub id: Uuid,
    pub name: String,
    pub wallet_address: String,
    pub verified: bool,
    pub email: Option<String>,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateOrganizationRequest {
    pub name: String,
    pub wallet_address: String,
    pub email: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateOrganizationRequest {
    pub name: Option<String>,
    pub email: Option<String>,
    pub description: Option<String>,
    pub verified: Option<bool>,
}

// ===========================
// Campaign Models
// ===========================

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Campaign {
    pub id: Uuid,
    pub name: String,
    pub org_id: Uuid,
    pub goal_amount: i64,
    pub raised_amount: i64,
    pub deadline: DateTime<Utc>,
    pub status: String,
    pub description: Option<String>,
    pub contract_campaign_id: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct CampaignWithOrg {
    // Campaign fields
    pub id: Uuid,
    pub name: String,
    pub org_id: Uuid,
    pub goal_amount: i64,
    pub raised_amount: i64,
    pub deadline: DateTime<Utc>,
    pub status: String,
    pub description: Option<String>,
    pub contract_campaign_id: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    // Organization fields
    pub org_name: String,
    pub org_wallet_address: String,
    pub org_verified: bool,
}

#[derive(Debug, Deserialize)]
pub struct CreateCampaignRequest {
    pub name: String,
    pub org_id: Uuid,
    pub goal_amount: i64,
    pub deadline: DateTime<Utc>,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCampaignRequest {
    pub status: Option<String>,
    pub raised_amount: Option<i64>,
}

// ===========================
// Donation Models
// ===========================

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Donation {
    pub id: Uuid,
    pub campaign_id: Uuid,
    pub donor_address: String,
    pub amount: i64,
    pub tx_hash: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDonationRequest {
    pub campaign_id: Uuid,
    pub donor_address: String,
    pub amount: i64,
    pub tx_hash: String,
}

// ===========================
// Disbursement Models
// ===========================

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Disbursement {
    pub id: Uuid,
    pub campaign_id: Uuid,
    pub recipient_address: String,
    pub amount: i64,
    pub status: String,
    pub approved_by: Option<String>,
    pub tx_hash: Option<String>,
    pub created_at: DateTime<Utc>,
    pub executed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDisbursementRequest {
    pub campaign_id: Uuid,
    pub recipient_address: String,
    pub amount: i64,
}

#[derive(Debug, Deserialize)]
pub struct ApproveDisbursementRequest {
    pub approver_addresses: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct ExecuteDisbursementRequest {
    pub tx_hash: String,
}

// ===========================
// Audit Models
// ===========================

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct AuditLog {
    pub id: Uuid,
    pub entity_type: String,
    pub entity_id: Uuid,
    pub action: String,
    pub actor_address: String,
    pub details: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct AuditResponse {
    pub campaign: Campaign,
    pub donations: Vec<Donation>,
    pub disbursements: Vec<Disbursement>,
    pub audit_logs: Vec<AuditLog>,
}

// ===========================
// Query Parameters
// ===========================

#[derive(Debug, Deserialize)]
pub struct CampaignQueryParams {
    pub org_id: Option<Uuid>,
    pub status: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct DonationQueryParams {
    pub donor_address: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}
