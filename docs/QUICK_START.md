# AidFlow - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Option 1: Docker (Recommended)

```powershell
# Clone repository
git clone https://github.com/your-username/aidflow.git
cd AidFlow

# Copy environment files
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env

# Start everything
docker-compose up
```

**Access the app:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: localhost:5432

### Option 2: Manual Setup

#### 1. Install Prerequisites

```powershell
# Check Rust
cargo --version

# Check Node.js
node --version

# Check PostgreSQL
psql --version

# Install Stellar CLI
cargo install --locked stellar-cli --features opt
```

#### 2. Setup Database

```powershell
# Create database
psql -U postgres -c "CREATE DATABASE aidflow;"

# Load schema
psql -U postgres -d aidflow -f database/schema.sql
```

#### 3. Start Backend

```powershell
cd backend
Copy-Item .env.example .env
# Edit .env with your settings
cargo run
```

#### 4. Start Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

## 🔑 First Steps

1. **Open http://localhost:3000**
2. **Click "Sign Up"** to create an account
3. **Choose "NGO"** if creating campaigns, or **"Donor"** if donating
4. **Connect Freighter Wallet** (install from https://freighter.app)
5. **Create a Campaign** (NGO) or **Browse Campaigns** (Donor)
6. **Make a Donation** using XLM

## 📖 What to Try

### As an NGO:
1. Create a campaign with title, description, and target
2. Share campaign link with donors
3. Track incoming donations in real-time
4. Create disbursements to recipients
5. View audit trail of all transactions

### As a Donor:
1. Browse active campaigns
2. Connect Freighter wallet
3. Donate to a campaign (requires testnet XLM)
4. Track your donation on Stellar Explorer
5. View impact on campaign progress

## 🎓 Get Testnet XLM

1. Install Freighter wallet extension
2. Create testnet account
3. Get free testnet XLM: https://laboratory.stellar.org/#account-creator?network=test
4. Use XLM to make test donations

## 🐛 Common Issues

**Backend won't start:**
- Check PostgreSQL is running
- Verify DATABASE_URL in backend/.env
- Run migrations: `cd backend && sqlx migrate run`

**Frontend can't connect:**
- Check backend is running on port 5000
- Verify VITE_API_URL in frontend/.env

**Wallet won't connect:**
- Install Freighter from https://freighter.app
- Switch to Testnet in Freighter settings
- Refresh page after installing

## 📚 Next Steps

- Read full README for detailed docs
- Deploy smart contract to testnet
- Explore API endpoints at http://localhost:5000
- Check `docs/` folder for guides

## 💡 Tips

- Use Chrome/Brave for best Freighter support
- Keep testnet for development
- Test all flows before mainnet deployment
- Monitor Stellar Explorer for transactions

---

**Need Help?** Open an issue or email amankrsingh1204@gmail.com
