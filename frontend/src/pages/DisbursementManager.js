import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { disbursementService, campaignService } from '../services/api';

function DisbursementManager() {
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [disbursements, setDisbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    recipientId: '',
    amount: '',
    purpose: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [campaignId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campaignRes, disbursementsRes] = await Promise.all([
        campaignService.getById(campaignId),
        disbursementService.getAll({ campaignId })
      ]);
      
      setCampaign(campaignRes.data);
      setDisbursements(disbursementsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDisbursement = async (e) => {
    e.preventDefault();
    try {
      await disbursementService.create({
        campaignId,
        ...formData,
        amount: parseFloat(formData.amount),
        requestedBy: '00000000-0000-0000-0000-000000000000' // Placeholder
      });
      
      toast.success('Disbursement request created!');
      setShowCreateModal(false);
      setFormData({ recipientId: '', amount: '', purpose: '', notes: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create disbursement');
    }
  };

  const handleApprove = async (disbursementId) => {
    try {
      await disbursementService.approve(disbursementId, {
        approverId: '00000000-0000-0000-0000-000000000000', // Placeholder
        approverPublicKey: 'PLACEHOLDER_KEY'
      });
      
      toast.success('Disbursement approved!');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve disbursement');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Disbursement Manager</h1>
            <p className="text-gray-600 mt-2">{campaign?.title}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            + Create Disbursement
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Available Balance</div>
            <div className="text-2xl font-bold text-green-600">
              {campaign?.assetCode} {parseFloat(campaign?.raisedAmount || 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Pending Approvals</div>
            <div className="text-2xl font-bold text-yellow-600">
              {disbursements.filter(d => d.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold text-blue-600">
              {disbursements.filter(d => d.status === 'completed').length}
            </div>
          </div>
        </div>

        {/* Disbursements List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">All Disbursements</h2>
            <div className="space-y-4">
              {disbursements.map((disbursement) => (
                <div key={disbursement.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-lg">{disbursement.purpose}</div>
                      <div className="text-sm text-gray-500">
                        Recipient: {disbursement.recipientId}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {new Date(disbursement.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        {campaign?.assetCode} {parseFloat(disbursement.amount).toFixed(2)}
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                        disbursement.status === 'completed' ? 'bg-green-100 text-green-800' :
                        disbursement.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        disbursement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {disbursement.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {disbursement.notes && (
                    <div className="bg-gray-50 p-3 rounded text-sm mb-3">
                      {disbursement.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Approvals: {disbursement.approvalCount} / {disbursement.requiredApprovals}
                    </div>
                    {disbursement.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(disbursement.id)}
                        className="btn-primary text-sm"
                      >
                        Approve
                      </button>
                    )}
                    {disbursement.status === 'completed' && disbursement.stellarTransactionId && (
                      <a
                        href={`https://horizon-testnet.stellar.org/transactions/${disbursement.stellarTransactionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Transaction →
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {disbursements.length === 0 && (
                <p className="text-gray-500 text-center py-8">No disbursements yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create Disbursement</h2>
            <form onSubmit={handleCreateDisbursement}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Recipient Stellar Address *
                  </label>
                  <input
                    type="text"
                    value={formData.recipientId}
                    onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
                    required
                    className="input-field"
                    placeholder="GXXXXXX..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    min="0.01"
                    step="0.01"
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Purpose *
                  </label>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    required
                    className="input-field"
                    placeholder="Medical supplies for..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  Create Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DisbursementManager;
