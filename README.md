# AidFlow - Complete Rust-Based Blockchain Platform

## 🦀 Technology Stack

- **Smart Contracts**: Rust + Soroban SDK (Stellar)
- **Backend**: Rust + Axum
- **Frontend**: Vue 3 + Tailwind CSS
- **Database**: PostgreSQL
- **Blockchain**: Stellar Network
- **Wallet**: Freighter Integration

## 📁 Project Structure

```
AidFlow/
├── contracts/                # Soroban smart contracts (Rust)
│   └── donation-contract/
│       ├── src/
│       │   ├── lib.rs       # Main contract logic
│       │   └── test.rs      # Contract tests
│       └── Cargo.toml
├── backend/                  # Axum REST API (Rust)
│   ├── src/
│   │   ├── main.rs
│   │   ├── config.rs
│   │   ├── error.rs
│   │   ├── models.rs
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   └── middleware/
│   ├── migrations/          # Database migrations
│   └── Cargo.toml
├── frontend/                 # Vue 3 + Tailwind
│   ├── src/
│   │   ├── components/      # Navbar, Footer
│   │   ├── views/           # Page components
│   │   ├── stores/          # Pinia stores
│   │   ├── services/        # API & blockchain services
│   │   └── router/
│   ├── package.json
│   └── vite.config.js
├── database/                 # PostgreSQL schemas
│   └── schema.sql
├── Cargo.toml               # Workspace configuration
└── docker-compose.yml       # Docker setup
```

## 🚀 Quick Start

### Prerequisites

- Rust 1.75+ with Cargo
- Node.js 20+
- PostgreSQL 14+
- Stellar CLI (for contract deployment)
- Docker & Docker Compose (optional)

### Setup with Docker

```powershell
# Copy environment files
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env

# Start all services
docker-compose up
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

### Manual Setup

#### 1. Database Setup

```powershell
# Create database
psql -U postgres -c "CREATE DATABASE aidflow;"

# Run migrations
psql -U postgres -d aidflow -f database/schema.sql
```

#### 2. Backend Setup

```powershell
cd backend

# Copy and configure environment
Copy-Item .env.example .env
# Edit .env with your configuration

# Run migrations
sqlx migrate run

# Start backend
cargo run
```

Backend runs on http://localhost:5000

#### 3. Frontend Setup

```powershell
cd frontend

# Install dependencies
npm install

# Copy and configure environment
Copy-Item .env.example .env

# Start development server
npm run dev
```

Frontend runs on http://localhost:3000

#### 4. Smart Contract Deployment

```powershell
cd contracts/donation-contract

# Build contract
stellar contract build

# Deploy to testnet
stellar contract deploy `
  --wasm target/wasm32-unknown-unknown/release/donation_contract.wasm `
  --source-account YOUR_ACCOUNT `
  --network testnet `
  --alias donation_contract

# Initialize contract
stellar contract invoke `
  --id CONTRACT_ID `
  --source-account YOUR_ACCOUNT `
  --network testnet `
  -- initialize `
  --admin YOUR_PUBLIC_KEY
```

## 🔑 Key Features

### Smart Contract Functions

- `initialize(admin)` - Set up contract
- `create_campaign(ngo, title, description, target)` - Create campaign
- `donate(campaign_id, donor, amount, token, message)` - Record donation
- `propose_disbursement(campaign_id, recipient, amount, description)` - Propose payout
- `approve_disbursement(disbursement_id, approver)` - Multi-sig approval
- `execute_disbursement(disbursement_id)` - Execute payout
- `get_campaign(campaign_id)` - Retrieve campaign data

### API Endpoints

**Campaigns**
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign details
- `DELETE /api/campaigns/:id` - Close campaign
- `GET /api/campaigns/:id/stats` - Campaign statistics

**Donations**
- `POST /api/donations` - Record donation
- `GET /api/donations/campaign/:id` - Get campaign donations

**Disbursements**
- `POST /api/disbursements` - Create disbursement
- `POST /api/disbursements/:id/approve` - Approve disbursement
- `POST /api/disbursements/:id/execute` - Execute disbursement

**Auth**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

**Stellar**
- `GET /api/stellar/account/:address` - Get account info
- `GET /api/stellar/transaction/:hash` - Get transaction details

**Audit**
- `GET /api/audit` - List audit logs
- `GET /api/audit/entity/:type/:id` - Get entity audit trail

### Frontend Pages

- **Home** - Landing page with features
- **Campaign List** - Browse all campaigns
- **Campaign Detail** - View & donate to campaigns
- **Create Campaign** - NGOs create new campaigns
- **Donation Tracking** - Track donation history
- **Disbursement Manager** - Manage payouts (NGO)
- **Audit Dashboard** - Complete transparency trail
- **Login/Register** - User authentication

### Wallet Integration

- **Freighter Wallet** integration for transaction signing
- Connect/disconnect wallet
- Sign transactions on-chain
- View account balances
- Transaction confirmation

## 🛠️ Development

### Run Tests

```powershell
# Contract tests
cd contracts/donation-contract
cargo test

# Backend tests
cd backend
cargo test
```

### Build for Production

```powershell
# Backend
cd backend
cargo build --release

# Frontend
cd frontend
npm run build

# Smart Contract
cd contracts/donation-contract
stellar contract build
```

### Database Migrations

```powershell
cd backend

# Create new migration
sqlx migrate add migration_name

# Run migrations
sqlx migrate run

# Revert last migration
sqlx migrate revert
```

## 🔒 Security Features

- Multi-signature disbursements (2-of-3 or configurable)
- JWT authentication
- Password hashing with bcrypt
- SQL injection protection via SQLx
- CORS configuration
- Input validation
- Rate limiting (recommended for production)

## 🌐 Deployment

### Environment Variables

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `STELLAR_NETWORK` - testnet or mainnet
- `STELLAR_HORIZON_URL` - Horizon API endpoint
- `CONTRACT_ID` - Deployed contract ID
- `PLATFORM_SECRET_KEY` - Stellar secret key
- `JWT_SECRET` - JWT signing secret

**Frontend:**
- `VITE_API_URL` - Backend API URL
- `VITE_STELLAR_HORIZON` - Stellar Horizon URL
- `VITE_STELLAR_NETWORK` - TESTNET or PUBLIC

### Production Deployment

1. **Deploy Smart Contract to Mainnet**
2. **Set up PostgreSQL** (managed service recommended)
3. **Deploy Backend** (Fly.io, Railway, AWS)
4. **Deploy Frontend** (Vercel, Netlify, Cloudflare Pages)
5. **Configure DNS** and SSL certificates
6. **Set production environment variables**
7. **Run database migrations**

## 📚 Documentation

- `docs/API.md` - Complete API reference
- `docs/SMART_CONTRACT.md` - Contract documentation
- `docs/DEPLOYMENT.md` - Production deployment guide
- `docs/COMPLIANCE.md` - Regulatory compliance
- `docs/QUICK_START.md` - 5-minute setup guide

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 💬 Support

- **Email**: amankrsingh1204@gmail.com
- **Issues**: GitHub Issues
- **Discord**: (Coming soon)

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Soroban smart contract
- ✅ Axum REST API
- ✅ Vue 3 frontend
- ✅ Freighter wallet integration
- ✅ PostgreSQL database
- ✅ Docker deployment

### Phase 2
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Recurring donations
- [ ] Multi-chain support
- [ ] KYC/AML integration
- [ ] Fiat on-ramp

### Phase 3
- [ ] DAO governance
- [ ] Impact NFTs
- [ ] Grant management
- [ ] Compliance automation
- [ ] Global NGO marketplace

---

**Built with 🦀 Rust + Soroban on Stellar**
