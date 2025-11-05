import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data)
      throw new Error(error.response.data.error || 'An error occurred')
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request)
      throw new Error('Network error - please check your connection')
    } else {
      // Something else happened
      console.error('Error:', error.message)
      throw new Error(error.message)
    }
  }
)

const api = {
  // Organizations
  organizations: {
    list: () => apiClient.get('/organizations'),
    getById: (id) => apiClient.get(`/organizations/${id}`),
    getByWallet: (walletAddress) => apiClient.get(`/organizations/wallet/${walletAddress}`),
    create: (data) => apiClient.post('/organizations', data),
    update: (id, data) => apiClient.patch(`/organizations/${id}`, data)
  },

  // Campaigns
  campaigns: {
    list: (params) => apiClient.get('/campaigns', { params }),
    getById: (id) => apiClient.get(`/campaigns/${id}`),
    create: (data) => apiClient.post('/campaigns', data),
    update: (id, data) => apiClient.patch(`/campaigns/${id}`, data)
  },

  // Donations
  donations: {
    create: (data) => apiClient.post('/donations', data),
    listByCampaign: (campaignId, params) => apiClient.get(`/donations/${campaignId}`, { params })
  },

  // Disbursements
  disbursements: {
    create: (data) => apiClient.post('/disbursements', data),
    getById: (id) => apiClient.get(`/disbursements/${id}`),
    approve: (id, data) => apiClient.post(`/disbursements/${id}/approve`, data),
    execute: (id, data) => apiClient.post(`/disbursements/${id}/execute`, data),
    listByCampaign: (campaignId) => apiClient.get(`/disbursements/campaign/${campaignId}`)
  },

  // Audit
  audit: {
    getCampaignHistory: (campaignId) => apiClient.get(`/audit/${campaignId}`)
  }
}

export default api
