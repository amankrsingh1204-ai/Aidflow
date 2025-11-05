<template>
  <div class="my-donations-view py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-bold mb-8">My Donations</h1>

      <div v-if="!walletStore.isConnected" class="text-center py-20">
        <p class="text-gray-600 mb-6 text-lg">Please connect your wallet to view your donations</p>
        <button @click="connectWallet" class="btn-primary">Connect Wallet</button>
      </div>

      <div v-else>
        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="stats-card">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ donations.length }}</div>
            <div class="text-gray-600">Total Donations</div>
          </div>
          <div class="stats-card">
            <div class="text-3xl font-bold text-green-600 mb-2">{{ totalDonated }} XLM</div>
            <div class="text-gray-600">Total Donated</div>
          </div>
          <div class="stats-card">
            <div class="text-3xl font-bold text-purple-600 mb-2">{{ uniqueCampaigns }}</div>
            <div class="text-gray-600">Campaigns Supported</div>
          </div>
        </div>

        <!-- Donations List -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-2xl font-bold">Donation History</h2>
          </div>

          <div v-if="loading" class="p-6">
            <div v-for="i in 3" :key="i" class="mb-4">
              <div class="skeleton h-20 w-full"></div>
            </div>
          </div>

          <div v-else-if="donations.length > 0" class="divide-y divide-gray-200">
            <div v-for="donation in donations" :key="donation.id" class="p-6 hover:bg-gray-50 transition-colors">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h3 class="font-semibold text-lg mb-1">Campaign Name</h3>
                  <p class="text-gray-600 text-sm mb-2">{{ formatDate(donation.timestamp) }}</p>
                  <div class="flex items-center gap-2">
                    <span class="text-2xl font-bold text-green-600">{{ formatAmount(donation.amount) }} XLM</span>
                    <a 
                      :href="`https://stellar.expert/explorer/testnet/tx/${donation.tx_hash}`"
                      target="_blank"
                      class="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      View Transaction →
                    </a>
                  </div>
                </div>
                <router-link 
                  :to="`/campaigns/${donation.campaign_id}`"
                  class="btn-secondary text-sm"
                >
                  View Campaign
                </router-link>
              </div>
            </div>
          </div>

          <div v-else class="p-12 text-center">
            <p class="text-gray-500 mb-4">You haven't made any donations yet</p>
            <router-link to="/campaigns" class="text-blue-600 hover:text-blue-700 font-medium">
              Browse Campaigns →
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWalletStore } from '../stores/wallet'
import api from '../services/api'

const walletStore = useWalletStore()
const loading = ref(false)
const donations = ref([])

const totalDonated = computed(() => {
  return donations.value
    .reduce((sum, d) => sum + d.amount, 0) / 10000000
})

const uniqueCampaigns = computed(() => {
  return new Set(donations.value.map(d => d.campaign_id)).size
})

const formatAmount = (amount) => {
  return (amount / 10000000).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const connectWallet = async () => {
  try {
    await walletStore.connectWallet()
    await loadDonations()
  } catch (error) {
    alert(error.message || 'Failed to connect wallet')
  }
}

const loadDonations = async () => {
  loading.value = true
  try {
    // This would need to be implemented in the API
    // For now, return empty array
    donations.value = []
  } catch (error) {
    console.error('Error loading donations:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (walletStore.isConnected) {
    loadDonations()
  }
})
</script>
