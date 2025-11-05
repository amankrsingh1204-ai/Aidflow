# AidFlow Backend Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT APPLICATIONS                          │
│                  (Frontend, Mobile Apps, Third-party)                 │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                │ HTTP/REST
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                         AXUM WEB SERVER                               │
│                         (Port 5000)                                   │
├───────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    CORS MIDDLEWARE                           │    │
│  │              (Allow cross-origin requests)                   │    │
│  └─────────────────────────────────────────────────────────────┘    │
├───────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      ROUTER LAYER                            │    │
│  │  ┌───────────────┬──────────────┬──────────────────────┐    │    │
│  │  │ /api/orgs     │ /api/campaigns│  /api/donations      │    │    │
│  │  │               │               │                      │    │    │
│  │  │ /api/disburse │ /api/audit    │  /health             │    │    │
│  │  └───────────────┴──────────────┴──────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐    ┌──────────────────┐    ┌────────────────┐
│   ROUTES      │    │    SERVICES      │    │    MODELS      │
│               │    │                  │    │                │
│ organization  │───▶│ stellar_service  │    │  Organization  │
│  .rs          │    │     .rs          │    │   Campaign     │
│               │    │                  │    │   Donation     │
│ campaign.rs   │───▶│ • create_campaign│    │  Disbursement  │
│               │    │ • process_donation│   │   AuditLog     │
│ donation.rs   │───▶│ • execute_disburse│   │                │
│               │    │ • get_campaign    │    │  DTOs & Query  │
│ disbursement  │───▶│ • close_campaign  │    │   Params       │
│  .rs          │    │                  │    │                │
│               │    └──────────┬───────┘    └────────────────┘
│ audit.rs      │               │
│               │               │
└───────┬───────┘               │
        │                       │
        │                       │
        │              ┌────────▼────────┐
        │              │  STELLAR SOROBAN│
        │              │  SMART CONTRACT │
        │              │                 │
        │              │ • Campaign CRUD │
        │              │ • Donations     │
        │              │ • Disbursements │
        │              │ • On-chain state│
        │              └─────────────────┘
        │
        │
        ▼
┌─────────────────────────────────────────────────┐
│          POSTGRESQL DATABASE                    │
│          (SQLx Connection Pool)                 │
├─────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐  │
│  │         ORGANIZATIONS TABLE               │  │
│  │  id, name, wallet_address, verified      │  │
│  └──────────────────┬───────────────────────┘  │
│                     │ (1:N)                     │
│  ┌──────────────────▼───────────────────────┐  │
│  │          CAMPAIGNS TABLE                  │  │
│  │  id, org_id, goal, raised, deadline      │  │
│  └──────────┬────────────────┬──────────────┘  │
│             │ (1:N)          │ (1:N)            │
│  ┌──────────▼──────┐  ┌─────▼────────────┐    │
│  │  DONATIONS TABLE│  │ DISBURSEMENTS    │    │
│  │  id, campaign_id│  │  TABLE           │    │
│  │  donor, amount  │  │  id, campaign_id │    │
│  │  tx_hash        │  │  recipient       │    │
│  └─────────────────┘  │  amount, status  │    │
│                       └──────────────────┘    │
│  ┌──────────────────────────────────────────┐  │
│  │         AUDIT_LOGS TABLE                  │  │
│  │  id, entity_type, entity_id, action      │  │
│  │  actor_address, details (JSONB)          │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    CONFIGURATION                             │
├──────────────────────────────────────────────────────────────┤
│  • DATABASE_URL    → PostgreSQL connection                   │
│  • PORT            → Server listen port                      │
│  • STELLAR_NETWORK → testnet/mainnet                         │
│  • STELLAR_HORIZON → Horizon API URL                         │
│  • CONTRACT_ID     → Deployed contract address               │
│  • RUST_LOG        → Logging level                           │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING                            │
├──────────────────────────────────────────────────────────────┤
│  AppError::Database      → 500 Internal Server Error         │
│  AppError::NotFound      → 404 Not Found                     │
│  AppError::BadRequest    → 400 Bad Request                   │
│  AppError::Unauthorized  → 401 Unauthorized                  │
│  AppError::Stellar       → 400 Bad Request                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                 DATA FLOW EXAMPLE                            │
│              (Create Campaign Flow)                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. POST /api/campaigns                                      │
│     ↓                                                        │
│  2. routes/campaign.rs::create_campaign()                    │
│     ↓                                                        │
│  3. Validate organization exists (DB query)                  │
│     ↓                                                        │
│  4. stellar_service::create_campaign_on_chain()              │
│     ↓                                                        │
│  5. Insert campaign to DB (with contract_campaign_id)        │
│     ↓                                                        │
│  6. Create audit log entry                                   │
│     ↓                                                        │
│  7. Return 201 Created + Campaign JSON                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                 SECURITY FEATURES                            │
├──────────────────────────────────────────────────────────────┤
│  ✓ Type-safe database queries (SQLx compile-time checks)    │
│  ✓ Input validation on all endpoints                        │
│  ✓ Multi-signature approval for disbursements               │
│  ✓ Transaction hash verification                            │
│  ✓ Balance validation before disbursement                   │
│  ✓ Audit trail for all state changes                        │
│  ✓ CORS configuration for frontend access                   │
│  ✓ Proper HTTP status codes and error messages              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│               ASYNC/PERFORMANCE                              │
├──────────────────────────────────────────────────────────────┤
│  • Tokio async runtime                                       │
│  • SQLx connection pooling (10 connections)                  │
│  • Non-blocking I/O throughout                               │
│  • Efficient database indexes                                │
│  • Streaming responses for large datasets                    │
│  • Zero-cost abstractions (Rust)                             │
└──────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. **Main Application** (`main.rs`)
- Initializes Tokio runtime
- Configures tracing/logging
- Sets up database pool
- Runs migrations
- Builds router with all routes
- Starts Axum server

### 2. **Routes** (`routes/*.rs`)
- **organization.rs**: NGO management endpoints
- **campaign.rs**: Campaign CRUD + blockchain interaction
- **donation.rs**: Donation processing + on-chain recording
- **disbursement.rs**: Multi-sig disbursement workflow
- **audit.rs**: Transaction history aggregation

### 3. **Services** (`services/*.rs`)
- **stellar_service.rs**: Blockchain integration layer
  - Abstracts smart contract calls
  - Mock implementations for development
  - Production: Replace with stellar-sdk calls

### 4. **Models** (`models.rs`)
- Database entities (Organizations, Campaigns, etc.)
- Request DTOs (CreateCampaignRequest, etc.)
- Query parameters for filtering
- Response structures

### 5. **Configuration** (`config.rs`)
- Environment variable management
- Database URL, Stellar config, server settings
- Type-safe config struct

### 6. **Error Handling** (`error.rs`)
- Custom AppError enum
- Automatic HTTP response conversion
- Consistent error format

## Request Flow

```
Client Request
    ↓
Axum Router
    ↓
Route Handler (validate input)
    ↓
Service Layer (business logic)
    ↓
Database / Blockchain
    ↓
Response Construction
    ↓
JSON Response to Client
```

## Database Relationships

```
Organizations (1) ──────→ (N) Campaigns
                              ├─→ (N) Donations
                              └─→ (N) Disbursements

All entities ──────→ (N) Audit Logs
```

## Deployment Architecture

```
┌─────────────────┐
│   Docker        │
│   Container     │
│  ┌───────────┐  │
│  │  Backend  │  │───┐
│  │  Binary   │  │   │
│  └───────────┘  │   │
└─────────────────┘   │
                      │
┌─────────────────┐   │    ┌─────────────────┐
│   PostgreSQL    │◄──┴───▶│  Stellar        │
│   Database      │         │  Testnet        │
└─────────────────┘         └─────────────────┘
```

## Scalability Considerations

- **Horizontal Scaling**: Multiple backend instances behind load balancer
- **Database**: Connection pooling prevents exhaustion
- **Caching**: Can add Redis for frequently accessed data
- **Read Replicas**: For heavy read workloads
- **Blockchain**: Batching for multiple transactions
