# AidFlow Frontend

A modern Vue 3 frontend with Tailwind CSS for the blockchain-powered NGO donation platform.

## 🚀 Features

- **Vue 3 Composition API** - Modern reactive framework
- **Tailwind CSS** - Utility-first styling
- **Freighter Wallet** - Stellar wallet integration
- **Pinia** - State management
- **Vue Router** - SPA navigation
- **Stellar SDK** - Blockchain interaction
- **Responsive Design** - Mobile-first approach

## 📋 Prerequisites

- Node.js 18+ and npm
- Freighter Wallet browser extension
- Backend API running (see `/backend`)

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_STELLAR_NETWORK=TESTNET
VITE_CONTRACT_ID=your_contract_id_here
```

### 3. Install Freighter Wallet

1. Visit [freighter.app](https://www.freighter.app/)
2. Install browser extension
3. Create or import wallet
4. Switch to TESTNET network
5. Fund account from [Stellar Laboratory](https://laboratory.stellar.org/#account-creator)

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

## 📦 Project Structure

```
frontend/
├── src/
│   ├── assets/
│   │   └── main.css              # Tailwind + custom styles
│   ├── components/
│   │   ├── Navbar.vue            # Navigation + wallet
│   │   └── Footer.vue            # Footer component
│   ├── router/
│   │   └── index.js              # Route definitions
│   ├── services/
│   │   ├── api.js                # Backend API calls
│   │   └── stellar.js            # Blockchain interaction
│   ├── stores/
│   │   ├── wallet.js             # Wallet state (Pinia)
│   │   └── campaign.js           # Campaign state (Pinia)
│   ├── views/
│   │   ├── HomeView.vue          # Landing page
│   │   ├── CampaignsView.vue     # Browse campaigns
│   │   ├── CampaignDetailView.vue # Campaign details + donate
│   │   ├── CreateCampaignView.vue # Create campaign
│   │   ├── OrganizationsView.vue  # NGO directory
│   │   ├── MyDonationsView.vue    # User's donations
│   │   └── AboutView.vue          # About page
│   ├── App.vue                    # Root component
│   └── main.js                    # Entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎯 Available Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomeView | Landing page with hero & stats |
| `/campaigns` | CampaignsView | Browse all campaigns |
| `/campaigns/:id` | CampaignDetailView | View & donate to campaign |
| `/create-campaign` | CreateCampaignView | Create new campaign |
| `/organizations` | OrganizationsView | Browse NGOs |
| `/my-donations` | MyDonationsView | User's donation history |
| `/about` | AboutView | Platform information |

## 💼 State Management

### Wallet Store (`stores/wallet.js`)

```javascript
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()

// State
walletStore.isConnected       // boolean
walletStore.publicKey          // string | null
walletStore.network            // 'TESTNET' | 'PUBLIC'
walletStore.shortAddress       // '1234...5678'

// Actions
await walletStore.connectWallet()
walletStore.disconnectWallet()
await walletStore.signTransaction(xdr)
```

### Campaign Store (`stores/campaign.js`)

```javascript
import { useCampaignStore } from '@/stores/campaign'

const campaignStore = useCampaignStore()

// State
campaignStore.campaigns        // array
campaignStore.currentCampaign  // object | null
campaignStore.loading          // boolean
campaignStore.error            // string | null

// Actions
await campaignStore.fetchCampaigns({ status: 'active' })
await campaignStore.fetchCampaign(id)
await campaignStore.createCampaign(data)
```

## 🔌 Services

### API Service (`services/api.js`)

```javascript
import api from '@/services/api'

// Organizations
await api.organizations.list()
await api.organizations.getById(id)
await api.organizations.create(data)

// Campaigns
await api.campaigns.list({ status: 'active', org_id: uuid })
await api.campaigns.getById(id)
await api.campaigns.create(data)

// Donations
await api.donations.create(data)
await api.donations.listByCampaign(campaignId)

// Disbursements
await api.disbursements.create(data)
await api.disbursements.approve(id, data)
await api.disbursements.execute(id, data)

// Audit
await api.audit.getCampaignHistory(campaignId)
```

### Stellar Service (`services/stellar.js`)

```javascript
import stellarService from '@/services/stellar'

// Account operations
const account = await stellarService.getAccount(publicKey)
const balance = await stellarService.getBalance(publicKey)

// Transactions
const result = await stellarService.submitDonation(
  donorPublicKey,
  amount,
  campaignId
)

// Contract invocation
await stellarService.invokeContract(publicKey, 'donate', [params])

// Helpers
const xlm = stellarService.stroopsToXLM(1000000) // '0.1000000'
const stroops = stellarService.xlmToStroops(1.5) // 15000000
```

## 🎨 Styling

### Tailwind Utilities

Custom classes defined in `assets/main.css`:

```html
<!-- Buttons -->
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-success">Success</button>
<button class="btn-danger">Danger</button>

<!-- Input -->
<input class="input-field" type="text" />

<!-- Badges -->
<span class="badge badge-success">Active</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-danger">Closed</span>
<span class="badge badge-info">Info</span>

<!-- Progress Bar -->
<div class="progress-bar">
  <div class="progress-fill" :style="{ width: '60%' }"></div>
</div>

<!-- Loading -->
<div class="w-8 h-8 spinner"></div>

<!-- Card -->
<div class="campaign-card">
  <!-- content -->
</div>

<!-- Stats -->
<div class="stats-card">
  <!-- stats -->
</div>
```

## 🔐 Wallet Integration

### Connect Wallet

```vue
<script setup>
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()

const connectWallet = async () => {
  try {
    await walletStore.connectWallet()
    // Wallet connected!
  } catch (error) {
    alert(error.message)
  }
}
</script>

<template>
  <button v-if="!walletStore.isConnected" @click="connectWallet">
    Connect Wallet
  </button>
  <div v-else>
    Connected: {{ walletStore.shortAddress }}
  </div>
</template>
```

### Sign Transaction

```vue
<script setup>
import { useWalletStore } from '@/stores/wallet'
import stellarService from '@/services/stellar'

const walletStore = useWalletStore()

const donate = async (amount) => {
  try {
    const result = await stellarService.submitDonation(
      walletStore.publicKey,
      amount,
      campaignId
    )
    console.log('Transaction hash:', result.hash)
  } catch (error) {
    console.error('Donation failed:', error)
  }
}
</script>
```

## 📱 Responsive Design

All components are responsive:

```html
<!-- Mobile: Stack vertically -->
<!-- Tablet: 2 columns -->
<!-- Desktop: Grid layout -->

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards -->
</div>
```

## 🧪 Testing

```bash
# Run unit tests (when implemented)
npm run test:unit

# Run e2e tests (when implemented)
npm run test:e2e

# Lint code
npm run lint
```

## 🏗️ Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

Output in `dist/` directory.

## 🚢 Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Docker

```bash
docker build -t aidflow-frontend .
docker run -p 8080:80 aidflow-frontend
```

## 🔧 Development

### Hot Module Replacement

Vite provides instant HMR - changes reflect immediately.

### Vue DevTools

Install [Vue DevTools](https://devtools.vuejs.org/) for debugging.

### Tailwind IntelliSense

Install VS Code extension: **Tailwind CSS IntelliSense**

## 📚 Key Concepts

### Composition API

All components use `<script setup>`:

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)

onMounted(() => {
  console.log('Component mounted')
})
</script>
```

### Pinia Stores

Composition API style stores:

```javascript
export const useStore = defineStore('name', () => {
  const state = ref(value)
  const getter = computed(() => state.value * 2)
  const action = () => { state.value++ }
  
  return { state, getter, action }
})
```

## 🐛 Troubleshooting

### Freighter Not Detected

1. Ensure Freighter extension is installed
2. Refresh the page
3. Check browser console for errors

### Cannot Connect to Backend

1. Verify backend is running on `localhost:5000`
2. Check `VITE_API_URL` in `.env`
3. Check CORS settings in backend

### Transaction Signing Fails

1. Ensure wallet has sufficient balance
2. Check network (TESTNET vs PUBLIC)
3. Verify contract ID is correct

### Styling Not Applied

1. Ensure Tailwind is properly configured
2. Run `npm run dev` again
3. Clear browser cache

## 🔗 Resources

- [Vue 3 Docs](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Freighter Wallet](https://www.freighter.app/)
- [Stellar SDK](https://stellar.github.io/js-stellar-sdk/)
- [Pinia Docs](https://pinia.vuejs.org/)
- [Vite Docs](https://vitejs.dev/)

## 📝 License

MIT License - See LICENSE file

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

**Built with ❤️ using Vue 3, Tailwind CSS, and Stellar**
