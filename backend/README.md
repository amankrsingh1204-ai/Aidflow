# AidFlow Backend

A high-performance Rust REST API built with Axum for managing blockchain-powered NGO donation campaigns on the Stellar network.

## 🚀 Features

- **Axum Framework**: Modern async web framework for Rust
- **SQLx + PostgreSQL**: Type-safe async database operations
- **Stellar Integration**: Smart contract interaction via Soroban
- **Complete CRUD APIs**: Organizations, Campaigns, Donations, Disbursements
- **Audit Trail**: Full transaction history tracking
- **Multi-Signature**: Disbursement approval workflow
- **Type Safety**: Leveraging Rust's type system for reliability

## 📋 Prerequisites

- Rust 1.70 or higher
- PostgreSQL 14 or higher
- Cargo and cargo-watch (optional, for development)
- SQLx CLI (for migrations)

## 🛠️ Installation

### 1. Clone and Navigate
```bash
cd backend
```

### 2. Install SQLx CLI
```bash
cargo install sqlx-cli --no-default-features --features postgres
```

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/aidflow
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
CONTRACT_ID=your_contract_id_here
PORT=5000
RUST_LOG=info
```

### 4. Setup Database
```bash
# Create database
sqlx database create

# Run migrations
sqlx migrate run
```

### 5. Build and Run
```bash
# Development mode
cargo run

# Production build
cargo build --release
./target/release/aidflow-backend
```

## 📦 Project Structure

```
backend/
├── migrations/           # SQLx database migrations
│   └── 20250101000000_initial.sql
├── src/
│   ├── routes/          # API route handlers
│   │   ├── organization.rs
│   │   ├── campaign.rs
│   │   ├── donation.rs
│   │   ├── disbursement.rs
│   │   ├── audit.rs
│   │   └── mod.rs
│   ├── services/        # Business logic layer
│   │   ├── stellar_service.rs
│   │   └── mod.rs
│   ├── config.rs        # Configuration management
│   ├── error.rs         # Error types and handling
│   ├── models.rs        # Data models and DTOs
│   └── main.rs          # Application entry point
├── Cargo.toml
├── Dockerfile
├── .env.example
├── API_DOCUMENTATION.md
└── README.md
```

## 🔌 API Endpoints

### Organizations
- `POST /api/organizations` - Create NGO
- `GET /api/organizations` - List all NGOs
- `GET /api/organizations/:id` - Get NGO details
- `PATCH /api/organizations/:id` - Update NGO
- `GET /api/organizations/wallet/:address` - Get by wallet

### Campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns` - List campaigns (filterable)
- `GET /api/campaigns/:id` - Get campaign details
- `PATCH /api/campaigns/:id` - Update campaign

### Donations
- `POST /api/donations` - Record donation
- `GET /api/donations/:campaign_id` - Get campaign donations

### Disbursements
- `POST /api/disbursements` - Create disbursement
- `GET /api/disbursements/:id` - Get disbursement
- `POST /api/disbursements/:id/approve` - Approve disbursement
- `POST /api/disbursements/:id/execute` - Execute disbursement
- `GET /api/disbursements/campaign/:id` - List campaign disbursements

### Audit
- `GET /api/audit/:campaign_id` - Full transaction history

### Health
- `GET /health` - Health check

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API specs.

## 🗄️ Database Schema

### Key Tables
- **organizations**: NGO/charity information
- **campaigns**: Fundraising campaigns
- **donations**: Donor contributions
- **disbursements**: Fund distributions
- **audit_logs**: Complete activity tracking

All tables include timestamps and proper foreign key relationships.

## 🔐 Security Features

- Input validation on all endpoints
- Type-safe database queries (SQLx compile-time checks)
- CORS configuration
- Error handling without sensitive data exposure
- Multi-signature approval for disbursements

## 🧪 Testing

```bash
# Run all tests
cargo test

# Run with logging
RUST_LOG=debug cargo test -- --nocapture

# Run specific test
cargo test test_name
```

## 📊 Logging

The application uses `tracing` for structured logging:

```bash
# Set log level via environment
RUST_LOG=debug cargo run

# Available levels: error, warn, info, debug, trace
```

## 🐳 Docker

Build and run with Docker:

```bash
# Build image
docker build -t aidflow-backend .

# Run container
docker run -p 5000:5000 --env-file .env aidflow-backend
```

## 🔧 Development

### Watch Mode
```bash
cargo install cargo-watch
cargo watch -x run
```

### Code Quality
```bash
# Format code
cargo fmt

# Lint code
cargo clippy

# Check without building
cargo check
```

## 🌐 Stellar Integration

The backend communicates with Soroban smart contracts:

1. **Campaign Creation**: Invokes `create_campaign` on-chain
2. **Donations**: Calls `donate` to record on blockchain
3. **Disbursements**: Executes `disburse` for fund transfers
4. **Campaign Status**: Syncs with `close_campaign`

Mock implementations are provided in `services/stellar_service.rs`. Replace with actual Stellar SDK calls for production.

## 📈 Performance

- Async/await throughout for high concurrency
- Connection pooling for database efficiency
- Compiled binary with zero-cost abstractions
- Minimal memory footprint

## 🤝 Contributing

1. Ensure code passes `cargo fmt` and `cargo clippy`
2. Add tests for new features
3. Update API documentation
4. Test migrations with `sqlx migrate run`

## 📝 License

MIT License - See LICENSE file for details

## 🔗 Related

- [Smart Contract](../contracts/donation-contract/)
- [Frontend](../frontend/)
- [Documentation](../docs/)

---

**Built with ❤️ using Rust + Axum + PostgreSQL + Stellar**
