import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useCampaignStore = defineStore('campaign', () => {
  // State
  const campaigns = ref([])
  const currentCampaign = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Actions
  const fetchCampaigns = async (filters = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.campaigns.list(filters)
      campaigns.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching campaigns:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCampaign = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.campaigns.getById(id)
      currentCampaign.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching campaign:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createCampaign = async (campaignData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.campaigns.create(campaignData)
      campaigns.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Error creating campaign:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCampaign = async (id, updates) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.campaigns.update(id, updates)
      
      // Update in list
      const index = campaigns.value.findIndex(c => c.id === id)
      if (index !== -1) {
        campaigns.value[index] = response.data
      }
      
      // Update current if it's the same
      if (currentCampaign.value?.id === id) {
        currentCampaign.value = response.data
      }
      
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Error updating campaign:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    campaigns,
    currentCampaign,
    loading,
    error,
    // Actions
    fetchCampaigns,
    fetchCampaign,
    createCampaign,
    updateCampaign,
    clearError
  }
})
