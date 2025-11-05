<template>
  <div class="campaign-detail-view py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-6">
        <div class="skeleton h-64 w-full"></div>
        <div class="skeleton h-8 w-1/2"></div>
        <div class="skeleton h-24 w-full"></div>
      </div>

      <!-- Campaign Details -->
      <div v-else-if="campaign" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <div class="glass rounded-xl shadow-lg overflow-hidden">
            <img 
              :src="campaign.image || 'https://via.placeholder.com/800x400?text=Campaign'"
              alt="Campaign"
              class="w-full h-64 object-cover"
            />
            <div class="p-8">
              <div class="flex items-center justify-between mb-4">
                <span class="badge badge-success">{{ campaign.status }}</span>
                <span class="text-white">{{ campaign.category }}</span>
              </div>
              <div class="flex justify-between items-start mb-4">
                <h1 class="text-3xl font-bold text-white">{{ campaign.name }}</h1>
                <button @click="showEditImage = !showEditImage" class="btn-secondary text-sm px-4 py-2">
                  {{ showEditImage ? 'Cancel' : 'Edit Image' }}
                </button>
              </div>
              
              <!-- Edit Image Section -->
              <div v-if="showEditImage" class="mb-4 p-4 glass rounded-lg">
                <label class="block text-sm font-medium text-white mb-2">
                  Upload New Image
                </label>
                <input 
                  type="file"
                  accept="image/*"
                  @change="handleImageUpdate"
                  class="input-field mb-2"
                />
                <button @click="saveImage" :disabled="!newImage" class="btn-primary w-full text-sm">
                  Save Image
                </button>
              </div>
              
              <p class="text-white text-lg">{{ campaign.description }}</p>
            </div>
          </div>

          <!-- Donations List -->
          <div class="glass rounded-xl shadow-lg p-8">
            <h2 class="text-2xl font-bold mb-4 text-white">Recent Donations</h2>
            <div class="space-y-4">
              <p class="text-white">No donations yet. Be the first to donate!</p>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Donation Card -->
          <div class="glass rounded-xl shadow-lg p-6 sticky top-20">
            <div class="mb-6">
              <div class="flex justify-between text-lg font-semibold mb-2">
                <span class="text-white">{{ formatAmount(campaign.current_amount || 0) }} XLM</span>
                <span class="text-white">{{ progress }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progress + '%' }"></div>
              </div>
              <div class="text-sm text-white mt-2">
                Goal: {{ formatAmount(campaign.goal_amount) }} XLM
              </div>
            </div>

            <!-- Donation Form -->
            <div v-if="walletStore.isConnected">
              <label class="block text-sm font-medium text-white mb-2">Donation Amount (XLM)</label>
              <input 
                v-model="donationAmount"
                type="number"
                step="0.1"
                min="1"
                placeholder="Enter amount"
                class="input-field mb-4"
              />
              <button 
                @click="handleDonate"
                :disabled="!donationAmount || donating"
                class="btn-primary w-full"
              >
                {{ donating ? 'Processing...' : 'Donate Now' }}
              </button>
            </div>
            <div v-else class="text-center">
              <p class="text-white mb-4">Connect your wallet to donate</p>
              <button @click="connectWallet" class="btn-primary w-full">
                Connect Wallet
              </button>
            </div>
          </div>

          <!-- Campaign Info -->
          <div class="glass rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-4 text-white">Campaign Details</h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm text-white opacity-70">Deadline</dt>
                <dd class="font-medium text-white">{{ formatDate(campaign.deadline) }}</dd>
              </div>
              <div>
                <dt class="text-sm text-white opacity-70">Created</dt>
                <dd class="font-medium text-white">{{ formatDate(campaign.created_at) }}</dd>
              </div>
              <div>
                <dt class="text-sm text-white opacity-70">Category</dt>
                <dd class="font-medium text-white">{{ campaign.category }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="text-center py-20">
        <p class="text-white text-lg">Campaign not found</p>
        <router-link to="/campaigns" class="text-purple-400 hover:text-purple-300 mt-4 inline-block">
          ← Back to campaigns
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWalletStore } from '../stores/wallet'

const route = useRoute()
const walletStore = useWalletStore()

const loading = ref(false)
const donating = ref(false)
const donationAmount = ref('')
const campaign = ref(null)
const showEditImage = ref(false)
const newImage = ref(null)

const progress = computed(() => {
  if (!campaign.value) return 0
  return Math.min(100, Math.round(((campaign.value.current_amount || 0) / campaign.value.goal_amount) * 100))
})

const formatAmount = (amount) => {
  return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const connectWallet = async () => {
  try {
    await walletStore.connectWallet()
  } catch (error) {
    alert(error.message || 'Failed to connect wallet')
  }
}

const handleImageUpdate = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const saveImage = () => {
  if (!newImage.value) return
  
  try {
    // Update campaign image in localStorage
    const mockCampaigns = JSON.parse(localStorage.getItem('mockCampaigns') || '[]')
    const campaignIndex = mockCampaigns.findIndex(c => c.id === campaign.value.id)
    
    if (campaignIndex !== -1) {
      mockCampaigns[campaignIndex].image = newImage.value
      localStorage.setItem('mockCampaigns', JSON.stringify(mockCampaigns))
      campaign.value.image = newImage.value
      showEditImage.value = false
      newImage.value = null
      alert('Image updated successfully!')
    }
  } catch (error) {
    console.error('Error updating image:', error)
    alert('Failed to update image')
  }
}

const handleDonate = async () => {
  if (!donationAmount.value) return
  
  donating.value = true
  try {
    const amount = parseFloat(donationAmount.value)
    
    // Update campaign in localStorage
    const mockCampaigns = JSON.parse(localStorage.getItem('mockCampaigns') || '[]')
    const campaignIndex = mockCampaigns.findIndex(c => c.id === campaign.value.id)
    
    if (campaignIndex !== -1) {
      mockCampaigns[campaignIndex].current_amount = (mockCampaigns[campaignIndex].current_amount || 0) + amount
      localStorage.setItem('mockCampaigns', JSON.stringify(mockCampaigns))
      campaign.value.current_amount = mockCampaigns[campaignIndex].current_amount
    }

    alert('Donation successful! Thank you for your contribution.')
    donationAmount.value = ''
  } catch (error) {
    console.error('Donation error:', error)
    alert('Donation failed: ' + error.message)
  } finally {
    donating.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    // Load campaign from localStorage
    const mockCampaigns = JSON.parse(localStorage.getItem('mockCampaigns') || '[]')
    campaign.value = mockCampaigns.find(c => c.id === route.params.id)
  } finally {
    loading.value = false
  }
})
</script>
