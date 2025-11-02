# AidFlow Soroban Smart Contract

## 🎯 Contract Deployed Successfully!

### Contract Details
- **Contract ID**: `CA6MF44ZV77OY32L74VSGDE24LV4TTSHLXBXEVIY5ZQO7DRIDQR2S3S5`
- **Network**: Stellar Testnet
- **Deployer**: alice (`GDMXVDYOEGIYXJKTH33UXAE3DKCOO5WMFGPNBWNQZKPBV2L3VC25J27G`)
- **Wasm Hash**: `bb01b65b941761e3bce7f99f7a48eed5749db05f681490851f055d50f58dcbb2`

### 🔗 Explorer Links
- **Contract**: https://stellar.expert/explorer/testnet/contract/CA6MF44ZV77OY32L74VSGDE24LV4TTSHLXBXEVIY5ZQO7DRIDQR2S3S5
- **Deploy Transaction**: https://stellar.expert/explorer/testnet/tx/71d072ea67082556be16572bc31f6780b282281aef20d1241df79c8a6065169e

---

## 📋 Contract Functions

### 1. initialize
Initialize the contract with an admin address.
```bash
stellar contract invoke \
  --id CA6MF44ZV77OY32L74VSGDE24LV4TTSHLXBXEVIY5ZQO7DRIDQR2S3S5 \
  --source-account alice \
  --network testnet \
  -- initialize \
  --admin GDMXVDYOEGIYXJKTH33UXAE3DKCOO5WMFGPNBWNQZKPBV2L3VC25J27G
```

### 2. create_campaign
Create a new fundraising campaign.
```bash
stellar contract invoke \
  --id CA6MF44ZV77OY32L74VSGDE24LV4TTSHLXBXEVIY5ZQO7DRIDQR2S3S5 \
  --source-account alice \
  --network testnet \
  -- create_campaign \
  --name "Campaign Name" \
  --ngo_address GDMXVDYOEGIYXJKTH33UXAE3DKCOO5WMFGPNBWNQZKPBV2L3VC25J27G \
  --goal_amount 1000000000
```

### 3. get_campaign
Get campaign details by ID.
```bash
stellar contract invoke \
  --id CA6MF44ZV77OY32L74VSGDE24LV4TTSHLXBXEVIY5ZQO7DRIDQR2S3S5 \
  --source-account alice \
  --network testnet \
  -- get_campaign \
  --campaign_id 1
```

### 4. donate
Make a donation to a campaign.
```bash
stellar contract invoke \
  --id CA6MF44ZV77OY32L74VSGDE24LV4TTSHLXBXEVIY5ZQO7DRIDQR2S3S5 \
  --source-account alice \
  --network testnet \
  -- donate \
  --campaign_id 1 \
  --donor GDMXVDYOEGIYXJKTH33UXAE3DKCOO5WMFGPNBWNQZKPBV2L3VC25J27G \
  --token_address <USDC_TOKEN_ADDRESS> \
  --amount 100000000
```

### 5. close_campaign
Close/deactivate a campaign (only campaign owner).
```bash
stellar contract invoke \
  --id CA6MF44ZV77OY32L74VSGDE24LV4TTSHLXBXEVIY5ZQO7DRIDQR2S3S5 \
  --source-account alice \
  --network testnet \
  -- close_campaign \
  --campaign_id 1 \
  --ngo_address GDMXVDYOEGIYXJKTH33UXAE3DKCOO5WMFGPNBWNQZKPBV2L3VC25J27G
```

### 6. get_campaigns_count
Get total number of campaigns.
```bash
stellar contract invoke \
  --id CA6MF44ZV77OY32L74VSGDE24LV4TTSHLXBXEVIY5ZQO7DRIDQR2S3S5 \
  --source-account alice \
  --network testnet \
  -- get_campaigns_count
```

### 7. get_donations_count
Get total number of donations.
```bash
stellar contract invoke \
  --id CA6MF44ZV77OY32L74VSGDE24LV4TTSHLXBXEVIY5ZQO7DRIDQR2S3S5 \
  --source-account alice \
  --network testnet \
  -- get_donations_count
```

---

## 🧪 Test Campaign Created

**Campaign ID**: 1
**Details**:
```json
{
  "id": 1,
  "name": "Test Campaign",
  "ngo_address": "GDMXVDYOEGIYXJKTH33UXAE3DKCOO5WMFGPNBWNQZKPBV2L3VC25J27G",
  "goal_amount": "1000000000",
  "raised_amount": "0",
  "active": true
}
```

---

## 🔧 Contract Features

### Data Structures

**Campaign**:
- `id`: Unique campaign identifier
- `name`: Campaign name
- `ngo_address`: NGO's Stellar address
- `goal_amount`: Fundraising goal in stroops
- `raised_amount`: Amount raised so far
- `active`: Campaign status

**Donation**:
- `campaign_id`: Associated campaign
- `donor`: Donor's Stellar address
- `amount`: Donation amount in stroops
- `timestamp`: Ledger timestamp

### Security Features
- ✅ Authorization checks (require_auth)
- ✅ Campaign ownership validation
- ✅ Active campaign verification
- ✅ Token transfer via Stellar token contract

---

## 💡 Integration with AidFlow Backend

To integrate this smart contract with your Node.js backend:

### 1. Install Stellar SDK Contract Support
```bash
npm install @stellar/stellar-sdk
```

### 2. Add Contract Service (backend/src/services/contract.service.js)
```javascript
const { Contract, SorobanRpc } = require('@stellar/stellar-sdk');

const CONTRACT_ID = 'CA6MF44ZV77OY32L74VSGDE24LV4TTSHLXBXEVIY5ZQO7DRIDQR2S3S5';
const RPC_URL = 'https://soroban-testnet.stellar.org';

const server = new SorobanRpc.Server(RPC_URL);
const contract = new Contract(CONTRACT_ID);

// Create campaign via smart contract
async function createContractCampaign(name, ngoAddress, goalAmount) {
  // Implementation here
}

// Get campaign from smart contract
async function getContractCampaign(campaignId) {
  // Implementation here
}

module.exports = {
  createContractCampaign,
  getContractCampaign,
};
```

### 3. Update .env
```bash
SOROBAN_CONTRACT_ID=CA6MF44ZV77OY32L74VSGDE24LV4TTSHLXBXEVIY5ZQO7DRIDQR2S3S5
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

---

## 📁 Contract Source Code

Location: `C:\AidFlow\donation_contract\contracts\hello-world\src\lib.rs`

The contract is written in Rust using the Soroban SDK and includes:
- Campaign management
- Donation tracking
- Token transfers
- Authorization checks
- Persistent storage

---

## 🚀 Next Steps

1. **Integrate with Frontend**: Update React components to call contract functions
2. **Add Token Support**: Configure USDC or other stablecoin addresses
3. **Enhance Contract**: Add features like:
   - Campaign milestones
   - Withdrawal approvals
   - Refund mechanisms
   - Donor rewards
4. **Deploy to Mainnet**: When ready, deploy to Stellar mainnet

---

## 📚 Resources

- [Soroban Documentation](https://developers.stellar.org/docs/build/smart-contracts)
- [Stellar SDK](https://github.com/stellar/js-stellar-sdk)
- [Contract Explorer](https://stellar.expert/explorer/testnet/contract/CA6MF44ZV77OY32L74VSGDE24LV4TTSHLXBXEVIY5ZQO7DRIDQR2S3S5)

---

**Status**: ✅ Contract deployed and tested successfully on Stellar Testnet!
