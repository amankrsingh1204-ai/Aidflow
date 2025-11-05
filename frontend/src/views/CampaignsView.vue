<template>
  <div class="campaigns-view py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-bold mb-8">All Campaigns</h1>

      <!-- Filters -->
      <div class="glass rounded-lg shadow p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-white mb-2">Status</label>
            <select v-model="filters.status" class="input-field">
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-white mb-2">Category</label>
            <select v-model="filters.category" class="input-field">
              <option value="">All Categories</option>
              <option value="Disaster Relief">Disaster Relief</option>
              <option value="Educational Fund">Educational Fund</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Community Development">Community Development</option>
              <option value="Environmental Conservation">Environmental Conservation</option>
              <option value="Food & Nutrition">Food & Nutrition</option>
              <option value="Child Welfare">Child Welfare</option>
              <option value="Women Empowerment">Women Empowerment</option>
              <option value="Animal Welfare">Animal Welfare</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="flex items-end">
            <button @click="applyFilters" class="btn-primary w-full">Apply Filters</button>
          </div>
        </div>
      </div>

      <!-- Campaigns Grid -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="campaign-card p-6">
          <div class="skeleton h-48 mb-4"></div>
          <div class="skeleton h-6 w-3/4 mb-2"></div>
          <div class="skeleton h-4 w-1/2"></div>
        </div>
      </div>

      <div v-else-if="displayedCampaigns.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Campaign cards similar to HomeView -->
        <div v-for="campaign in displayedCampaigns" :key="campaign.id" class="campaign-card">
          <img 
            :src="campaign.image || 'https://via.placeholder.com/400x200?text=Campaign'"
            alt="Campaign"
            class="w-full h-48 object-cover"
          />
          <div class="p-6">
            <span class="badge badge-success mb-2">{{ campaign.status }}</span>
            <h3 class="text-xl font-semibold mb-2 text-white">{{ campaign.name }}</h3>
            <p class="text-white mb-2">Category: {{ campaign.category }}</p>
            <p class="text-white mb-4 line-clamp-2">{{ campaign.description }}</p>
            <router-link :to="`/campaigns/${campaign.id}`" class="btn-primary w-full text-center block">
              View Details
            </router-link>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <p class="text-white text-lg">No campaigns found</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCampaignStore } from '../stores/campaign'

const campaignStore = useCampaignStore()
const loading = ref(false)
const campaigns = ref([])
const filters = ref({
  status: '',
  category: ''
})

const loadCampaigns = () => {
  // Load mock campaigns from localStorage
  const mockCampaigns = JSON.parse(localStorage.getItem('mockCampaigns') || '[]')
  campaigns.value = mockCampaigns
}

const displayedCampaigns = computed(() => {
  let filtered = campaigns.value

  if (filters.value.status) {
    filtered = filtered.filter(c => c.status.toLowerCase() === filters.value.status.toLowerCase())
  }

  if (filters.value.category) {
    filtered = filtered.filter(c => c.category === filters.value.category)
  }

  return filtered
})

const applyFilters = async () => {
  loading.value = true
  try {
    loadCampaigns()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCampaigns()
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
