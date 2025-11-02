# AidFlow Demo Guide

## Overview
This guide walks you through a complete demo of the AidFlow platform, demonstrating the full lifecycle from campaign creation to transparent fund disbursement.

## Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ running
- Stellar account on testnet

## Setup Instructions

### 1. Database Setup
```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE aidflow;

# Exit psql
\q

# Run schema
psql -U postgres -d aidflow -f database\schema.sql
```

### 2. Backend Setup
```powershell
cd backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env with your settings
notepad .env

# Start backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup
```powershell
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
```

The frontend will open at `http://localhost:3000`

## Demo Scenario

### Step 1: Create a Campaign

1. Navigate to http://localhost:3000
2. Click "Create Campaign"
3. Fill in the form:
   - **Title**: "Emergency Medical Relief for Rural Areas"
   - **Description**: "Providing medical supplies and equipment to underserved rural communities"
   - **Category**: Healthcare
   - **Target Amount**: 10000 USDC
   - **Asset Type**: USDC
4. Click "Create Campaign"
5. **IMPORTANT**: Copy and save the Stellar secret key displayed (you'll need it for disbursements)
6. Note the campaign ID from the URL

### Step 2: Fund the Campaign (Simulate Donations)

You have two options:

#### Option A: Use Stellar Laboratory (Recommended)
1. Go to https://laboratory.stellar.org/
2. Select "Testnet" network
3. Navigate to "Transaction Builder"
4. Source Account: Your testnet account (get testnet XLM from friendbot)
5. Add Operation: "Payment"
   - Destination: Campaign stellar account (from campaign details)
   - Asset: Native (XLM) or Custom (USDC)
   - Amount: 100
6. Sign and submit transaction
7. Copy the transaction hash

#### Option B: Use Backend API
```powershell
# In a new terminal, test donation endpoint
curl -X POST http://localhost:5000/api/donations `
  -H "Content-Type: application/json" `
  -d '{
    \"campaignId\": \"YOUR_CAMPAIGN_ID\",
    \"donorEmail\": \"donor@example.com\",
    \"donorName\": \"John Doe\",
    \"amount\": 100,
    \"assetCode\": \"XLM\",
    \"stellarTransactionId\": \"YOUR_TX_HASH\",
    \"sourceAccount\": \"DONOR_STELLAR_ADDRESS\",
    \"isAnonymous\": false
  }'
```

### Step 3: View Donation on Blockchain

1. In campaign details, click the donation
2. Click "View on Horizon" link
3. Verify transaction details on Stellar Horizon
4. Show transaction details:
   - Source account
   - Destination account (campaign wallet)
   - Amount
   - Timestamp
   - Ledger number

### Step 4: View Audit Trail

1. From campaign page, click "View Audit Trail"
2. Explore the audit dashboard:
   - **Overview Tab**: Balance chart, transparency metrics
   - **Donations Tab**: All donations with transaction IDs
   - **Flow Chart Tab**: Visual flow of funds
3. Click any transaction to view on Horizon
4. Show transparency score (should be 100%)

### Step 5: Create Disbursement Request

1. Navigate to `/disbursements/CAMPAIGN_ID`
2. Click "Create Disbursement"
3. Fill in:
   - **Recipient Address**: Stellar address of recipient (create one at https://laboratory.stellar.org/)
   - **Amount**: 500
   - **Purpose**: "Medical supplies for clinic A"
   - **Notes**: "First aid kits, bandages, antibiotics"
4. Click "Create Request"
5. Request appears in "Pending" status

### Step 6: Approve Disbursement (Multi-Sig)

1. Click "Approve" on the pending disbursement
2. In a production environment, this would require actual signatures from multiple authorized signers
3. Once approvals reach threshold (2 of 3), status changes to "Approved"

### Step 7: Execute Disbursement

This requires the campaign's secret key (saved in Step 1):

```powershell
# Execute disbursement via API
curl -X POST http://localhost:5000/api/disbursements/DISBURSEMENT_ID/execute `
  -H "Content-Type: application/json" `
  -d '{
    \"signerSecrets\": [\"CAMPAIGN_SECRET_KEY\", \"SIGNER2_SECRET\"]
  }'
```

### Step 8: View Disbursement on Blockchain

1. Refresh disbursement page
2. Status should show "Completed"
3. Click "View Transaction" to see on Stellar Horizon
4. Verify:
   - Source: Campaign wallet
   - Destination: Recipient address
   - Amount: 500
   - Memo: Includes disbursement purpose

### Step 9: Track Donation Impact

1. Go to any donation detail page
2. Click "Track Impact"
3. See how donor's contribution was used
4. View related disbursements funded by donation pool
5. Show proportional allocation

### Step 10: Final Audit Review

1. Return to audit dashboard
2. Show complete transaction history:
   - All inflows (donations)
   - All outflows (disbursements)
   - Current balance
3. Show balance over time chart
4. Calculate and display metrics:
   - Total raised
   - Total disbursed
   - Fund utilization rate
   - Average donation
   - Number of beneficiaries

## Key Demo Talking Points

### 1. **Complete Transparency**
- Every transaction has a Stellar transaction ID
- Anyone can verify on Stellar Horizon
- No hidden transactions
- Immutable blockchain records

### 2. **Speed & Cost**
- Stellar transactions settle in 3-5 seconds
- Fees < $0.00001 per transaction
- 99.9%+ of funds go to recipients, not fees

### 3. **Security**
- Multi-signature wallet protection
- Multiple approvers required for disbursements
- Time-locked large transfers
- On-chain audit trail

### 4. **Donor Confidence**
- Track donation from source to impact
- Real-time balance visibility
- Transparent fund allocation
- Verifiable beneficiary payments

### 5. **NGO Benefits**
- Build trust with transparency
- Reduce administrative overhead
- Lower transaction costs
- Global reach (cross-border payments)
- Instant settlement

## Troubleshooting

### Database Connection Issues
```powershell
# Check PostgreSQL is running
Get-Service -Name postgresql*

# Verify connection string in .env
```

### Stellar Network Issues
- Ensure you're using testnet
- Verify Horizon URL is correct
- Check account is funded on testnet
- Use Stellar Laboratory to test transactions

### Port Conflicts
```powershell
# Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## Advanced Demo Features

### 1. Multiple Donors
- Create several donations from different accounts
- Show donor diversity in audit dashboard

### 2. Campaign Milestones
- Set funding milestones
- Show progress toward goals
- Conditional disbursements

### 3. Compliance Features
- Show KYC verification flow (UI only in MVP)
- Demonstrate transaction limits
- Geographic restrictions

### 4. Analytics
- Export transaction data
- Generate reports
- Visualize impact metrics

## Production Considerations

When presenting production roadmap:
1. **Authentication**: JWT-based auth for NGOs
2. **KYC Integration**: Chainalysis or similar
3. **Email Notifications**: Donor receipts, disbursement alerts
4. **Mobile App**: Mobile-first donor experience
5. **Anchor Integration**: Fiat on/off ramps
6. **Tax Receipts**: Automated tax documentation
7. **Recurring Donations**: Subscription-based giving
8. **Multi-Currency**: Support multiple stablecoins
9. **Smart Contracts**: Automated conditional payouts
10. **Insurance**: Fund protection mechanisms

## Winning Strategy

Emphasize:
1. **Real-world problem**: Lack of trust in charitable giving
2. **Blockchain solution**: Stellar's speed, cost, and transparency
3. **Social impact**: Empowering NGOs and building donor confidence
4. **Complete MVP**: Full end-to-end implementation
5. **Scalability**: Can serve thousands of NGOs
6. **Compliance-ready**: Built with regulatory considerations

## Questions & Answers

**Q: How do you handle fiat conversion?**
A: Integration with Stellar anchors for USDC/fiat on/off ramps

**Q: What about recipient privacy?**
A: Recipient addresses can be pseudonymous; personal data off-chain

**Q: How do you verify NGOs?**
A: Multi-tier verification: docs, track record, references, pilot program

**Q: Can donors get tax receipts?**
A: Yes, automated tax receipt generation with transaction verification

**Q: What if secret keys are lost?**
A: Social recovery via multi-sig signers, account recovery procedures

**Q: How do you prevent fraud?**
A: Multi-sig approvals, transaction limits, manual review, compliance APIs
