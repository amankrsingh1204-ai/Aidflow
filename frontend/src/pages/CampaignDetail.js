import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { campaignService, donationService, stellarService } from '../services/api';
import QRCode from 'qrcode.react';

function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDonateModal, setShowDonateModal] = useState(false);

  useEffect(() => {
    fetchCampaignData();
  }, [id]);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      const [campaignRes, statsRes, donationsRes] = await Promise.all([
        campaignService.getById(id),
        campaignService.getStats(id),
        donationService.getAll({ campaignId: id, limit: 10 })
      ]);
      
      setCampaign(campaignRes.data);
      setStats(statsRes.data);
      setDonations(donationsRes.data);
    } catch (error) {
      toast.error('Failed to load campaign details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-xl text-gray-600">Campaign not found</div>
      </div>
    );
  }

  const progressPercentage = ((parseFloat(campaign.raisedAmount) / parseFloat(campaign.targetAmount)) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Campaign Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-8xl mb-4">💧</div>
              <h1 className="text-4xl font-bold">{campaign.title}</h1>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {campaign.assetCode} {parseFloat(campaign.raisedAmount).toFixed(2)}
                </div>
                <div className="text-gray-600">Raised of {parseFloat(campaign.targetAmount).toFixed(2)} goal</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{progressPercentage}%</div>
                <div className="text-gray-600">Funded</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stats?.donationCount || 0}</div>
                <div className="text-gray-600">Donations</div>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowDonateModal(true)}
                className="btn-primary flex-1"
              >
                💰 Donate Now
              </button>
              <Link
                to={`/audit/${campaign.id}`}
                className="btn-secondary"
              >
                📊 View Audit Trail
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">About This Campaign</h2>
              <p className="text-gray-700 whitespace-pre-line">{campaign.description}</p>
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-2">Campaign Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{campaign.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${campaign.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                      {campaign.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{new Date(campaign.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Donations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Recent Donations</h2>
              {donations.length === 0 ? (
                <p className="text-gray-500">No donations yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">
                            {donation.isAnonymous ? '?' : donation.donorName?.[0] || 'D'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {donation.isAnonymous ? 'Anonymous' : donation.donorName || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {campaign.assetCode} {parseFloat(donation.amount).toFixed(2)}
                        </div>
                        <a
                          href={`https://horizon-testnet.stellar.org/transactions/${donation.stellarTransactionId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View on Horizon →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stellar Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Campaign Wallet</h3>
              <div className="mb-4 flex justify-center">
                <QRCode value={campaign.stellarAccount} size={160} />
              </div>
              <div className="bg-gray-50 p-3 rounded break-all text-sm font-mono">
                {campaign.stellarAccount}
              </div>
              <button
                onClick={() => copyToClipboard(campaign.stellarAccount)}
                className="w-full mt-3 btn-secondary text-sm"
              >
                📋 Copy Address
              </button>
            </div>

            {/* Transparency Badge */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-3">🏆 Transparency Score</h3>
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <p className="text-sm text-gray-700">
                All transactions verified on Stellar blockchain. Complete audit trail available.
              </p>
            </div>

            {/* Multi-sig Info */}
            <div className="bg-purple-50 rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-3">🔐 Security</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Multi-signature wallet</li>
                <li>✓ {campaign.multisigThreshold}-of-3 approval required</li>
                <li>✓ On-chain verification</li>
                <li>✓ Transparent disbursements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Donate to Campaign</h2>
            <p className="text-gray-600 mb-6">
              Send {campaign.assetCode} to the campaign wallet address below using your Stellar wallet.
            </p>
            
            <div className="mb-6 flex justify-center">
              <QRCode value={campaign.stellarAccount} size={200} />
            </div>
            
            <div className="bg-gray-50 p-3 rounded break-all text-sm font-mono mb-4">
              {campaign.stellarAccount}
            </div>
            
            <button
              onClick={() => copyToClipboard(campaign.stellarAccount)}
              className="w-full btn-primary mb-3"
            >
              📋 Copy Address
            </button>
            
            <button
              onClick={() => setShowDonateModal(false)}
              className="w-full btn-secondary"
            >
              Close
            </button>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              After sending, your transaction will appear on the blockchain within 3-5 seconds
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CampaignDetail;
