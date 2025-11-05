# AidFlow Backend - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites Check
```bash
# Check Rust version (need 1.70+)
rustc --version

# Check PostgreSQL (need 14+)
psql --version

# Check Cargo
cargo --version
```

### Step 1: Setup Database

```bash
# Start PostgreSQL (if not running)
# Windows: Start PostgreSQL service
# Linux/Mac: sudo service postgresql start

# Create database
psql -U postgres
CREATE DATABASE aidflow;
\q
```

### Step 2: Configure Environment

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your settings
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/aidflow
# PORT=5000
# STELLAR_NETWORK=testnet
# CONTRACT_ID=
```

### Step 3: Install SQLx CLI

```bash
cargo install sqlx-cli --no-default-features --features postgres
```

### Step 4: Run Migrations

```bash
# This creates all tables
sqlx migrate run
```

You should see:
```
Applied 20250101000000/migrate initial (15.2ms)
```

### Step 5: Start the Server

```bash
cargo run
```

You should see:
```
✅ Connected to PostgreSQL database
✅ Database migrations completed
🚀 AidFlow Backend listening on 0.0.0.0:5000
```

### Step 6: Test the API

Open a new terminal and test:

```bash
# Health check
curl http://localhost:5000/health
# Expected: OK

# API root
curl http://localhost:5000/
# Expected: AidFlow API v1.0 - Blockchain-Powered NGO Donation Platform
```

## 📝 Quick API Test

### Create an Organization
```bash
curl -X POST http://localhost:5000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Red Cross",
    "wallet_address": "GCZJM35NKGVK47BB4SPBDV25477PZYIYPVVG453LPYFNXLS3FGHDXOCM",
    "email": "contact@redcross.org",
    "description": "International humanitarian organization"
  }'
```

### List Organizations
```bash
curl http://localhost:5000/api/organizations
```

### Create a Campaign
```bash
# Replace {org_id} with the UUID from the previous response
curl -X POST http://localhost:5000/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Disaster Relief 2025",
    "org_id": "{org_id}",
    "goal_amount": 1000000,
    "deadline": "2025-12-31T23:59:59Z",
    "description": "Emergency disaster relief fund"
  }'
```

### List Campaigns
```bash
curl http://localhost:5000/api/campaigns
```

### Record a Donation
```bash
# Replace {campaign_id} with UUID from campaign creation
curl -X POST http://localhost:5000/api/donations \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "{campaign_id}",
    "donor_address": "GCZJM35NKGVK47BB4SPBDV25477PZYIYPVVG453LPYFNXLS3FGHDXOCM",
    "amount": 50000,
    "tx_hash": "abc123def456"
  }'
```

### Get Campaign Donations
```bash
curl http://localhost:5000/api/donations/{campaign_id}
```

### Get Audit Trail
```bash
curl http://localhost:5000/api/audit/{campaign_id}
```

## 🔧 Development Mode

For auto-reload during development:

```bash
# Install cargo-watch
cargo install cargo-watch

# Run with auto-reload
cargo watch -x run
```

## 📊 View Database

```bash
# Connect to database
psql -U postgres -d aidflow

# List tables
\dt

# View organizations
SELECT * FROM organizations;

# View campaigns
SELECT * FROM campaigns;

# View donations
SELECT * FROM donations;

# Exit
\q
```

## 🐛 Troubleshooting

### Error: "Failed to connect to database"
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Test connection: `psql -U postgres -d aidflow`

### Error: "Failed to run migrations"
- Ensure database exists: `createdb aidflow`
- Check user permissions
- Try: `sqlx database reset` (warning: deletes all data)

### Error: "port 5000 already in use"
- Change PORT in .env
- Or kill existing process: `lsof -ti:5000 | xargs kill -9` (Mac/Linux)

### Compilation errors
- Update Rust: `rustup update`
- Clean build: `cargo clean && cargo build`

## 📚 Next Steps

1. **Read API Docs**: See `API_DOCUMENTATION.md` for all endpoints
2. **Deploy Smart Contract**: Build and deploy the Soroban contract
3. **Update Stellar Service**: Replace mock calls with real stellar-sdk
4. **Build Frontend**: Connect Vue.js frontend to the API
5. **Add Tests**: Write integration tests

## 🎯 API Endpoint Summary

```
Organizations:  POST/GET/PATCH /api/organizations
Campaigns:      POST/GET/PATCH /api/campaigns
Donations:      POST/GET /api/donations
Disbursements:  POST/GET /api/disbursements
Audit:          GET /api/audit/:campaign_id
Health:         GET /health
```

## 💡 Tips

- Use `RUST_LOG=debug cargo run` for detailed logs
- Add `?limit=10&offset=0` for pagination
- Check `audit_logs` table for all activity
- Use UUID from response for related requests

## 🎉 You're All Set!

Your AidFlow backend is now running and ready to accept requests.

For production deployment, see:
- `Dockerfile` for containerization
- `README.md` for full documentation
- `IMPLEMENTATION_SUMMARY.md` for architecture details
