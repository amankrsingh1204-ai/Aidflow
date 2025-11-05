<template>
  <div class="organizations-view py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-bold mb-8">Registered NGOs</h1>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-xl shadow p-6">
          <div class="skeleton h-32 mb-4"></div>
          <div class="skeleton h-6 w-3/4"></div>
        </div>
      </div>

      <div v-else-if="organizations.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="org in organizations" :key="org.id" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div class="flex items-start justify-between mb-4">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-2xl font-bold text-blue-600">{{ org.name.charAt(0) }}</span>
            </div>
            <span v-if="org.verified" class="badge badge-success">Verified</span>
          </div>
          <h3 class="text-xl font-semibold mb-2">{{ org.name }}</h3>
          <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ org.description || 'No description' }}</p>
          <div class="text-xs text-gray-500 font-mono break-all mb-4">
            {{ org.wallet_address }}
          </div>
          <router-link 
            :to="`/campaigns?org_id=${org.id}`"
            class="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View Campaigns →
          </router-link>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <p class="text-gray-500 text-lg">No organizations found</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const loading = ref(false)
const organizations = ref([])

const loadOrganizations = async () => {
  loading.value = true
  try {
    const response = await api.organizations.list()
    organizations.value = response.data
  } catch (error) {
    console.error('Error loading organizations:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrganizations()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
