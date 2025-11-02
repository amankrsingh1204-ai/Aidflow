# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### Campaigns

#### GET /campaigns
Get all campaigns

**Query Parameters:**
- `status` (optional): Filter by status (active, completed, draft, paused, cancelled)
- `category` (optional): Filter by category
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Campaign Title",
    "description": "Description",
    "targetAmount": "10000.0000000",
    "raisedAmount": "5000.0000000",
    "assetCode": "USDC",
    "stellarAccount": "GXXXXXX...",
    "status": "active",
    ...
  }
]
```

#### GET /campaigns/:id
Get campaign by ID

**Response:**
```json
{
  "id": "uuid",
  "title": "Campaign Title",
  "stellarBalance": [...],
  ...
}
```

#### POST /campaigns
Create new campaign

**Request Body:**
```json
{
  "ngoId": "uuid",
  "title": "Campaign Title",
  "description": "Detailed description",
  "category": "health",
  "targetAmount": 10000,
  "assetCode": "USDC",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "signerKeys": ["GXXXXXX...", "GXXXXXX..."]
}
```

**Response:**
```json
{
  "campaign": {...},
  "stellarSecretKey": "SXXXXXX..." // Store securely!
}
```

#### GET /campaigns/:id/stats
Get campaign statistics

**Response:**
```json
{
  "campaignId": "uuid",
  "totalRaised": "5000.0000000",
  "targetAmount": "10000.0000000",
  "donationCount": 25,
  "percentageReached": "50.00",
  "recentPayments": [...]
}
```

### Donations

#### GET /donations
Get all donations

**Query Parameters:**
- `campaignId` (optional): Filter by campaign
- `donorId` (optional): Filter by donor
- `limit`, `offset`: Pagination

#### POST /donations
Record a donation (after Stellar transaction)

**Request Body:**
```json
{
  "campaignId": "uuid",
  "donorEmail": "donor@example.com",
  "donorName": "John Doe",
  "amount": 100,
  "assetCode": "USDC",
  "stellarTransactionId": "stellar_tx_hash",
  "sourceAccount": "GXXXXXX...",
  "isAnonymous": false,
  "message": "Good luck!"
}
```

#### GET /donations/verify/:transactionId
Verify donation on blockchain

**Response:**
```json
{
  "verified": true,
  "transaction": {...},
  "horizonUrl": "https://..."
}
```

### Disbursements

#### POST /disbursements
Create disbursement request

**Request Body:**
```json
{
  "campaignId": "uuid",
  "recipientId": "GXXXXXX...",
  "amount": 500,
  "purpose": "Medical supplies",
  "requestedBy": "uuid",
  "notes": "Additional notes"
}
```

#### POST /disbursements/:id/approve
Approve a disbursement

**Request Body:**
```json
{
  "approverId": "uuid",
  "signature": "stellar_signature"
}
```

#### POST /disbursements/:id/execute
Execute approved disbursement

**Request Body:**
```json
{
  "signerSecrets": ["SXXXXXX...", "SXXXXXX..."]
}
```

**Response:**
```json
{
  "disbursement": {...},
  "transaction": {
    "transactionId": "stellar_tx_hash",
    ...
  },
  "horizonUrl": "https://..."
}
```

### Audit

#### GET /audit/campaign/:campaignId
Get complete audit trail for campaign

**Response:**
```json
{
  "campaign": {...},
  "summary": {
    "totalReceived": "10000.00",
    "totalDisbursed": "5000.00",
    "currentBalance": "5000.00",
    "donationCount": 50,
    "disbursementCount": 10
  },
  "donations": [...],
  "disbursements": [...],
  "flowChart": {
    "inflows": [...],
    "outflows": [...]
  }
}
```

#### GET /audit/donation/:donationId/track
Track donation flow

#### GET /audit/campaign/:campaignId/transparency
Get transparency score

**Response:**
```json
{
  "campaignId": "uuid",
  "transparencyScore": 100,
  "metrics": {
    "allDonationsVerifiable": true,
    "allDisbursementsVerifiable": true,
    ...
  },
  "rating": "Excellent"
}
```

### Stellar

#### POST /stellar/account/create
Create new Stellar account

**Response:**
```json
{
  "publicKey": "GXXXXXX...",
  "secretKey": "SXXXXXX..."
}
```

#### GET /stellar/account/:publicKey
Get account details

#### GET /stellar/account/:publicKey/payments
Get account payment history

#### GET /stellar/transaction/:txId
Get transaction details

#### POST /stellar/validate-address
Validate Stellar address

**Request Body:**
```json
{
  "address": "GXXXXXX..."
}
```

**Response:**
```json
{
  "address": "GXXXXXX...",
  "isValid": true
}
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message description"
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## Authentication

> Note: Authentication is not implemented in this MVP. In production, add JWT-based auth to protect endpoints.
