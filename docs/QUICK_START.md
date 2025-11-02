# AidFlow - Quick Start Guide

## Installation

### 1. Install Dependencies

#### Backend
```powershell
cd backend
npm install
```

#### Frontend
```powershell
cd frontend
npm install
```

### 2. Setup Database

```powershell
# Create database
createdb aidflow -U postgres

# Run migrations
psql -U postgres -d aidflow -f database\schema.sql
```

### 3. Configure Environment

```powershell
cd backend
copy .env.example .env
```

Edit `.env` with your Stellar credentials:
```
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

### 4. Run Application

#### Terminal 1 - Backend
```powershell
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```powershell
cd frontend
npm start
```

Visit: http://localhost:3000

## Quick Demo

1. **Create Campaign** → Generates Stellar wallet
2. **Send Donation** → Using Stellar Laboratory
3. **Record Donation** → Appears in campaign
4. **View Audit Trail** → Complete transparency
5. **Create Disbursement** → Request payment
6. **Approve & Execute** → Multi-sig payment
7. **Track on Blockchain** → View on Horizon

## Next Steps

- Read [API Documentation](./API.md)
- Follow [Demo Guide](./DEMO_GUIDE.md)
- Explore Stellar at https://stellar.org

## Support

For issues or questions, check the README.md or open an issue.
