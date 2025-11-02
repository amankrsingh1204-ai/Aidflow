import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { campaignService } from '../services/api';

function CreateCampaign() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    targetAmount: '',
    assetCode: 'USDC',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    ngoId: '00000000-0000-0000-0000-000000000000', // Placeholder
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await campaignService.create({
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
      });

      toast.success('Campaign created successfully!');
      toast.info(`Save this secret key securely: ${response.data.stellarSecretKey}`, {
        autoClose: false,
      });
      
      setTimeout(() => {
        navigate(`/campaigns/${response.data.campaign.id}`);
      }, 3000);
    } catch (error) {
      toast.error('Failed to create campaign: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Campaign</h1>
          <p className="text-gray-600 mb-8">
            Launch a transparent fundraising campaign on Stellar blockchain
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Emergency Relief for Natural Disaster"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="input-field"
                placeholder="Describe your campaign, its goals, and how funds will be used..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="general">General</option>
                  <option value="education">Education</option>
                  <option value="health">Healthcare</option>
                  <option value="disaster">Disaster Relief</option>
                  <option value="environment">Environment</option>
                  <option value="poverty">Poverty Alleviation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Type
                </label>
                <select
                  name="assetCode"
                  value={formData.assetCode}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="USDC">USDC (Stablecoin)</option>
                  <option value="XLM">XLM (Stellar Lumens)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount *
              </label>
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                className="input-field"
                placeholder="10000"
              />
              <p className="text-sm text-gray-500 mt-1">
                Amount in {formData.assetCode}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">🔐 Security Features</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Dedicated Stellar wallet created for your campaign</li>
                <li>✓ Multi-signature protection (2-of-3 approval required)</li>
                <li>✓ All transactions recorded on blockchain</li>
                <li>✓ Complete audit trail for donors</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Creating Campaign...' : 'Create Campaign'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/campaigns')}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCampaign;
