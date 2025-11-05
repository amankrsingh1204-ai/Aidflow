<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="py-20 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center">
          <h1 class="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Transparent Charity,<br />Powered by Blockchain
          </h1>
          <p class="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Donate to NGO campaigns with complete transparency. Every transaction recorded on the Stellar blockchain.
          </p>
          <div class="flex flex-col sm:flex-row gap-6 justify-center">
            <router-link
              to="/campaigns"
              class="btn-secondary text-lg px-8 py-4"
            >
              Browse Campaigns
            </router-link>
            <button
              v-if="!walletStore.isConnected"
              @click="connectWallet"
              class="btn-primary text-lg px-8 py-4"
            >
              Connect Wallet
            </button>
            <router-link
              v-else
              to="/create-campaign"
              class="btn-success text-lg px-8 py-4"
            >
              Create Campaign
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="stats-card">
            <div class="text-5xl font-bold text-gradient mb-2">{{ stats.totalCampaigns }}</div>
            <div class="text-white">Active Campaigns</div>
          </div>
          <div class="stats-card">
            <div class="text-5xl font-bold text-gradient mb-2">{{ stats.totalDonations }}</div>
            <div class="text-white">Total Donations</div>
          </div>
          <div class="stats-card">
            <div class="text-4xl font-bold text-purple-600 mb-2">{{ stats.totalOrganizations }}</div>
            <div class="text-white">NGOs Registered</div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-white">1. Connect Wallet</h3>
            <p class="text-white">Connect your Freighter wallet to get started</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-white">2. Browse Campaigns</h3>
            <p class="text-white">Explore verified NGO campaigns</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-white">3. Donate</h3>
            <p class="text-white">Make secure donations via Stellar</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-white">4. Track Impact</h3>
            <p class="text-white">Monitor all transactions on blockchain</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Campaigns -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-white">Featured Campaigns</h2>
          <router-link to="/campaigns" class="text-purple-400 hover:text-purple-300 font-semibold">
            View All →
          </router-link>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="i in 3" :key="i" class="campaign-card p-6">
            <div class="skeleton h-48 mb-4"></div>
            <div class="skeleton h-6 w-3/4 mb-2"></div>
            <div class="skeleton h-4 w-1/2"></div>
          </div>
        </div>

        <!-- Campaigns Grid -->
        <div v-else-if="featuredCampaigns.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="campaign in featuredCampaigns" :key="campaign.id" class="campaign-card">
            <img 
              :src="campaign.image || 'https://via.placeholder.com/400x200?text=Campaign'"
              alt="Campaign"
              class="w-full h-48 object-cover"
            />
            <div class="p-6">
              <div class="flex items-center justify-between mb-2">
                <span class="badge badge-success">{{ campaign.status }}</span>
                <span class="text-sm text-white">{{ campaign.category }}</span>
              </div>
              <h3 class="text-xl font-semibold mb-2 text-white">{{ campaign.name }}</h3>
              <p class="text-white mb-4 line-clamp-2">{{ campaign.description }}</p>
              
              <!-- Progress -->
              <div class="mb-4">
                <div class="flex justify-between text-sm mb-2">
                  <span class="font-semibold text-white">{{ formatAmount(campaign.current_amount || 0) }} XLM</span>
                  <span class="text-white">{{ campaign.progress }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: campaign.progress + '%' }"></div>
                </div>
                <div class="text-sm text-white mt-1">
                  Goal: {{ formatAmount(campaign.goal_amount) }} XLM
                </div>
              </div>

              <router-link
                :to="`/campaigns/${campaign.id}`"
                class="block w-full text-center px-4 py-2 btn-primary"
              >
                View Campaign
              </router-link>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <p class="text-white text-lg mb-6">No campaigns available yet</p>
        </div>
      </div>
    </section>

    <!-- Why Blockchain -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">Why Blockchain?</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center p-6">
            <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-white">Transparency</h3>
            <p class="text-white">Every transaction is recorded on the blockchain and publicly verifiable</p>
          </div>

          <div class="text-center p-6">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-white">Security</h3>
            <p class="text-white">Stellar blockchain ensures secure and immutable transaction records</p>
          </div>

          <div class="text-center p-6">
            <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-white">Fast & Low Cost</h3>
            <p class="text-white">Stellar's network offers near-instant settlements with minimal fees</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-blue-600 text-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
        <p class="text-xl text-blue-100 mb-8">
          Join thousands of donors supporting verified NGO campaigns with blockchain transparency
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/campaigns"
            class="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
          >
            Start Donating
          </router-link>
          <router-link
            to="/organizations"
            class="px-8 py-4 bg-blue-500 text-white rounded-lg font-semibold text-lg hover:bg-blue-400 transition-colors border-2 border-white"
          >
            For NGOs
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useWalletStore } from '../stores/wallet'
import { useCampaignStore } from '../stores/campaign'

const walletStore = useWalletStore()
const campaignStore = useCampaignStore()

const loading = ref(false)
const campaigns = ref([])
const stats = ref({
  totalCampaigns: 0,
  totalDonations: 0,
  totalOrganizations: 0
})

const featuredCampaigns = computed(() => {
  return campaigns.value.slice(0, 3).map(campaign => ({
    ...campaign,
    progress: Math.min(100, Math.round((campaign.current_amount / campaign.goal_amount) * 100))
  }))
})

const connectWallet = async () => {
  try {
    await walletStore.connectWallet()
  } catch (error) {
    alert(error.message || 'Failed to connect wallet')
  }
}

const formatAmount = (amount) => {
  return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

const loadData = async () => {
  loading.value = true
  try {
    // Load campaigns from localStorage
    const mockCampaigns = JSON.parse(localStorage.getItem('mockCampaigns') || '[]')
    campaigns.value = mockCampaigns.filter(c => c.status === 'Active')
    
    // Update stats
    stats.value.totalCampaigns = campaigns.value.length
    stats.value.totalDonations = campaigns.value.reduce((sum, c) => sum + (c.current_amount || 0), 0)
    stats.value.totalOrganizations = 0 // Will be updated later
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
