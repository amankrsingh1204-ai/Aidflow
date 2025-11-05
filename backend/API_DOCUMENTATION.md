# AidFlow Backend API Documentation

## Overview
The AidFlow Backend is a Rust-based REST API built with Axum that interfaces with a Soroban smart contract on Stellar blockchain and a PostgreSQL database to manage NGO donation campaigns.

## Technology Stack
- **Framework**: Axum (async web framework)
- **Database**: PostgreSQL with SQLx (async ORM)
- **Blockchain**: Stellar Soroban smart contracts
- **Runtime**: Tokio
- **Configuration**: dotenvy

## Base URL
```
http://localhost:5000/api
```

---

## Organizations (NGOs)

### Create Organization
**POST** `/api/organizations`

Create a new NGO/organization.

**Request Body:**
```json
{
  "name": "Red Cross International",
  "wallet_address": "GCZJ...",
  "email": "contact@redcross.org",
  "description": "Global humanitarian organization"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Red Cross International",
  "wallet_address": "GCZJ...",
  "verified": false,
  "email": "contact@redcross.org",
  "description": "Global humanitarian organization",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### List Organizations
**GET** `/api/organizations`

Get all registered organizations.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Red Cross",
    "wallet_address": "GCZJ...",
    "verified": true,
    ...
  }
]
```

### Get Organization
**GET** `/api/organizations/:id`

Get organization by ID.

**Response:** `200 OK`

### Get Organization by Wallet
**GET** `/api/organizations/wallet/:wallet_address`

Get organization by Stellar wallet address.

### Update Organization
**PATCH** `/api/organizations/:id`

Update organization details.

**Request Body:**
```json
{
  "name": "Updated Name",
  "verified": true
}
```

---

## Campaigns

### Create Campaign
**POST** `/api/campaigns`

Create a new fundraising campaign (both off-chain and on-chain).

**Request Body:**
```json
{
  "name": "Disaster Relief Fund 2025",
  "org_id": "uuid",
  "goal_amount": 1000000,
  "deadline": "2025-12-31T23:59:59Z",
  "description": "Emergency relief for disaster victims"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Disaster Relief Fund 2025",
  "org_id": "uuid",
  "goal_amount": 1000000,
  "raised_amount": 0,
  "deadline": "2025-12-31T23:59:59Z",
  "status": "active",
  "description": "Emergency relief...",
  "contract_campaign_id": 1,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### List Campaigns
**GET** `/api/campaigns?org_id=uuid&status=active&limit=50&offset=0`

Get all campaigns with optional filters.

**Query Parameters:**
- `org_id` (optional): Filter by organization
- `status` (optional): Filter by status (active, closed, completed, expired)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Campaign Name",
    "org_id": "uuid",
    "goal_amount": 1000000,
    "raised_amount": 250000,
    "deadline": "2025-12-31T23:59:59Z",
    "status": "active",
    "description": "...",
    "contract_campaign_id": 1,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z",
    "org_name": "Red Cross",
    "org_wallet_address": "GCZJ...",
    "org_verified": true
  }
]
```

### Get Campaign
**GET** `/api/campaigns/:id`

Get detailed information about a specific campaign.

**Response:** `200 OK`

### Update Campaign
**PATCH** `/api/campaigns/:id`

Update campaign status or raised amount.

**Request Body:**
```json
{
  "status": "closed",
  "raised_amount": 1000000
}
```

---

## Donations

### Create Donation
**POST** `/api/donations`

Record a donation and trigger on-chain processing.

**Request Body:**
```json
{
  "campaign_id": "uuid",
  "donor_address": "GCZJ...",
  "amount": 50000,
  "tx_hash": "abc123..."
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "campaign_id": "uuid",
  "donor_address": "GCZJ...",
  "amount": 50000,
  "tx_hash": "abc123...",
  "timestamp": "2025-01-01T12:00:00Z"
}
```

### Get Campaign Donations
**GET** `/api/donations/:campaign_id?donor_address=GCZJ...&limit=100&offset=0`

Get all donations for a campaign.

**Query Parameters:**
- `donor_address` (optional): Filter by donor
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "donations": [...],
  "total": 150,
  "limit": 100,
  "offset": 0
}
```

---

## Disbursements

### Create Disbursement
**POST** `/api/disbursements`

Create a new disbursement request.

**Request Body:**
```json
{
  "campaign_id": "uuid",
  "recipient_address": "GCZJ...",
  "amount": 100000
}
```

**Response:** `201 Created`

### Get Disbursement
**GET** `/api/disbursements/:id`

Get disbursement details.

### Approve Disbursement
**POST** `/api/disbursements/:id/approve`

Approve a disbursement with multi-signature logic.

**Request Body:**
```json
{
  "approver_addresses": ["GCZJ...", "GDEF..."]
}
```

**Response:** `200 OK`

### Execute Disbursement
**POST** `/api/disbursements/:id/execute`

Execute an approved disbursement on-chain.

**Request Body:**
```json
{
  "tx_hash": "def456..."
}
```

**Response:** `200 OK`

### Get Campaign Disbursements
**GET** `/api/disbursements/campaign/:campaign_id`

Get all disbursements for a campaign.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "campaign_id": "uuid",
    "recipient_address": "GCZJ...",
    "amount": 100000,
    "status": "executed",
    "approved_by": "GCZJ...,GDEF...",
    "tx_hash": "def456...",
    "created_at": "2025-01-01T00:00:00Z",
    "executed_at": "2025-01-02T00:00:00Z"
  }
]
```

---

## Audit & Analytics

### Get Campaign Audit
**GET** `/api/audit/:campaign_id`

Get complete transaction history for a campaign (merged on/off-chain data).

**Response:** `200 OK`
```json
{
  "campaign": {
    "id": "uuid",
    "name": "Campaign Name",
    ...
  },
  "donations": [
    {
      "id": "uuid",
      "donor_address": "GCZJ...",
      "amount": 50000,
      ...
    }
  ],
  "disbursements": [
    {
      "id": "uuid",
      "recipient_address": "GCZJ...",
      "amount": 100000,
      ...
    }
  ],
  "audit_logs": [
    {
      "id": "uuid",
      "entity_type": "campaign",
      "entity_id": "uuid",
      "action": "created",
      "actor_address": "GCZJ...",
      "details": {...},
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

## Health Check

### Health Check
**GET** `/health`

Check if the API is running.

**Response:** `200 OK`
```
OK
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message description"
}
```

**Status Codes:**
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Database Schema

### Organizations
```sql
- id (UUID, PK)
- name (VARCHAR)
- wallet_address (VARCHAR, UNIQUE)
- verified (BOOLEAN)
- email (VARCHAR)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Campaigns
```sql
- id (UUID, PK)
- name (VARCHAR)
- org_id (UUID, FK -> organizations)
- goal_amount (BIGINT)
- raised_amount (BIGINT)
- deadline (TIMESTAMP)
- status (VARCHAR: active/closed/completed/expired)
- description (TEXT)
- contract_campaign_id (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Donations
```sql
- id (UUID, PK)
- campaign_id (UUID, FK -> campaigns)
- donor_address (VARCHAR)
- amount (BIGINT)
- tx_hash (VARCHAR, UNIQUE)
- timestamp (TIMESTAMP)
```

### Disbursements
```sql
- id (UUID, PK)
- campaign_id (UUID, FK -> campaigns)
- recipient_address (VARCHAR)
- amount (BIGINT)
- status (VARCHAR: pending/approved/executed/rejected)
- approved_by (TEXT)
- tx_hash (VARCHAR)
- created_at (TIMESTAMP)
- executed_at (TIMESTAMP)
```

### Audit Logs
```sql
- id (UUID, PK)
- entity_type (VARCHAR)
- entity_id (UUID)
- action (VARCHAR)
- actor_address (VARCHAR)
- details (JSONB)
- created_at (TIMESTAMP)
```

---

## Running the Backend

### Prerequisites
- Rust 1.70+ with Cargo
- PostgreSQL 14+
- Stellar Testnet account (for blockchain interaction)

### Setup

1. **Install dependencies:**
```bash
cd backend
cargo build
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database and Stellar credentials
```

3. **Run database migrations:**
```bash
cargo install sqlx-cli
sqlx database create
sqlx migrate run
```

4. **Start the server:**
```bash
cargo run
# Server will start on http://localhost:5000
```

### Development
```bash
# Watch mode with auto-reload
cargo watch -x run

# Run tests
cargo test

# Check code
cargo clippy
```

---

## Integration with Smart Contract

The backend integrates with the Soroban smart contract for:

1. **Campaign Creation**: Calls `create_campaign` on-chain
2. **Donations**: Calls `donate` to record on blockchain
3. **Disbursements**: Calls `disburse` to transfer funds
4. **Campaign Closure**: Calls `close_campaign` when campaign ends

All on-chain operations are logged in the audit trail for complete transparency.
