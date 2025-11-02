import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Campaigns
export const campaignService = {
  getAll: (params) => api.get('/campaigns', { params }),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  getStats: (id) => api.get(`/campaigns/${id}/stats`),
};

// Donations
export const donationService = {
  getAll: (params) => api.get('/donations', { params }),
  getById: (id) => api.get(`/donations/${id}`),
  create: (data) => api.post('/donations', data),
  getCampaignStats: (campaignId) => api.get(`/donations/campaign/${campaignId}/stats`),
  verify: (txId) => api.get(`/donations/verify/${txId}`),
};

// Disbursements
export const disbursementService = {
  getAll: (params) => api.get('/disbursements', { params }),
  getById: (id) => api.get(`/disbursements/${id}`),
  create: (data) => api.post('/disbursements', data),
  approve: (id, data) => api.post(`/disbursements/${id}/approve`, data),
  execute: (id, data) => api.post(`/disbursements/${id}/execute`, data),
  getCampaignStats: (campaignId) => api.get(`/disbursements/campaign/${campaignId}/stats`),
};

// Audit
export const auditService = {
  getCampaignAudit: (campaignId) => api.get(`/audit/campaign/${campaignId}`),
  trackDonation: (donationId) => api.get(`/audit/donation/${donationId}/track`),
  getTransparency: (campaignId) => api.get(`/audit/campaign/${campaignId}/transparency`),
};

// Stellar
export const stellarService = {
  createAccount: () => api.post('/stellar/account/create'),
  getAccount: (publicKey) => api.get(`/stellar/account/${publicKey}`),
  getTransactions: (publicKey, limit) => api.get(`/stellar/account/${publicKey}/transactions`, { params: { limit } }),
  getPayments: (publicKey, limit) => api.get(`/stellar/account/${publicKey}/payments`, { params: { limit } }),
  getTransaction: (txId) => api.get(`/stellar/transaction/${txId}`),
  validateAddress: (address) => api.post('/stellar/validate-address', { address }),
};

export default api;
