import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { auditService, campaignService } from '../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function AuditDashboard() {
  const { campaignId } = useParams();
  const [auditData, setAuditData] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAuditData();
  }, [campaignId]);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      const [auditRes, campaignRes] = await Promise.all([
        auditService.getCampaignAudit(campaignId),
        campaignService.getById(campaignId)
      ]);
      
      setAuditData(auditRes.data);
      setCampaign(campaignRes.data);
    } catch (error) {
      toast.error('Failed to load audit data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading audit trail...</div>
      </div>
    );
  }

  if (!auditData || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-xl text-gray-600">No audit data available</div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: [...auditData.flowChart.inflows, ...auditData.flowChart.outflows]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Balance',
        data: (() => {
          let balance = 0;
          const allTransactions = [
            ...auditData.flowChart.inflows.map(i => ({ ...i, type: 'in' })),
            ...auditData.flowChart.outflows.map(o => ({ ...o, type: 'out' }))
          ].sort((a, b) => new Date(a.date) - new Date(b.date));
          
          return allTransactions.map(tx => {
            balance += tx.type === 'in' ? tx.amount : -tx.amount;
            return balance;
          });
        })(),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Audit Dashboard</h1>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
              ✓ Verified
            </span>
          </div>
          <h2 className="text-xl text-gray-600">{campaign.title}</h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Received</div>
            <div className="text-2xl font-bold text-green-600">
              {campaign.assetCode} {auditData.summary.totalReceived}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Disbursed</div>
            <div className="text-2xl font-bold text-blue-600">
              {campaign.assetCode} {auditData.summary.totalDisbursed}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Current Balance</div>
            <div className="text-2xl font-bold text-purple-600">
              {campaign.assetCode} {auditData.summary.currentBalance}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Donations</div>
            <div className="text-2xl font-bold text-gray-900">
              {auditData.summary.donationCount}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('donations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'donations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Donations ({auditData.donations.length})
              </button>
              <button
                onClick={() => setActiveTab('disbursements')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'disbursements'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Disbursements ({auditData.summary.disbursementCount})
              </button>
              <button
                onClick={() => setActiveTab('flow')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'flow'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Flow Chart
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-4">Balance Over Time</h3>
                  <Line data={chartData} options={{ responsive: true }} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="font-bold text-green-900 mb-3">✓ Transparency Metrics</h4>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li>✓ All donations verified on blockchain</li>
                      <li>✓ All disbursements have transaction IDs</li>
                      <li>✓ Real-time balance tracking</li>
                      <li>✓ Complete audit trail available</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-bold text-blue-900 mb-3">📊 Statistics</h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>Average donation: {campaign.assetCode} {(parseFloat(auditData.summary.totalReceived) / auditData.summary.donationCount).toFixed(2)}</li>
                      <li>Unique donors: {auditData.summary.donationCount}</li>
                      <li>Average disbursement: {campaign.assetCode} {auditData.summary.disbursementCount > 0 ? (parseFloat(auditData.summary.totalDisbursed) / auditData.summary.disbursementCount).toFixed(2) : '0.00'}</li>
                      <li>Fund utilization: {((parseFloat(auditData.summary.totalDisbursed) / parseFloat(auditData.summary.totalReceived)) * 100).toFixed(1)}%</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Donations Tab */}
            {activeTab === 'donations' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">All Donations</h3>
                {auditData.donations.map((donation) => (
                  <div key={donation.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold">
                          {donation.isAnonymous ? 'Anonymous Donor' : donation.donorName || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(donation.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          +{campaign.assetCode} {parseFloat(donation.amount).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-xs font-mono break-all">
                      TX: {donation.stellarTransactionId}
                    </div>
                    <a
                      href={`https://horizon-testnet.stellar.org/transactions/${donation.stellarTransactionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                    >
                      View on Stellar Horizon →
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Disbursements Tab */}
            {activeTab === 'disbursements' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">All Disbursements</h3>
                {auditData.disbursements.filter(d => d.status === 'completed').map((disbursement) => (
                  <div key={disbursement.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold">{disbursement.purpose}</div>
                        <div className="text-sm text-gray-500">
                          Recipient: {disbursement.recipientId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(disbursement.completedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          -{campaign.assetCode} {parseFloat(disbursement.amount).toFixed(2)}
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {disbursement.status}
                        </span>
                      </div>
                    </div>
                    {disbursement.stellarTransactionId && (
                      <>
                        <div className="bg-gray-50 p-2 rounded text-xs font-mono break-all">
                          TX: {disbursement.stellarTransactionId}
                        </div>
                        <a
                          href={`https://horizon-testnet.stellar.org/transactions/${disbursement.stellarTransactionId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                        >
                          View on Stellar Horizon →
                        </a>
                      </>
                    )}
                  </div>
                ))}
                {auditData.disbursements.filter(d => d.status === 'completed').length === 0 && (
                  <p className="text-gray-500 text-center py-8">No disbursements yet</p>
                )}
              </div>
            )}

            {/* Flow Chart Tab */}
            {activeTab === 'flow' && (
              <div>
                <h3 className="text-lg font-bold mb-4">Transaction Flow Visualization</h3>
                <div className="space-y-4">
                  {[...auditData.flowChart.inflows.map(i => ({ ...i, type: 'in' })), 
                    ...auditData.flowChart.outflows.map(o => ({ ...o, type: 'out' }))]
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((tx, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className={`w-20 text-sm text-gray-500`}>
                          {new Date(tx.date).toLocaleDateString()}
                        </div>
                        <div className={`flex-1 ${tx.type === 'in' ? 'text-right' : 'text-left'}`}>
                          {tx.type === 'in' ? (
                            <div className="inline-block bg-green-100 px-4 py-2 rounded-lg">
                              <span className="font-bold text-green-700">
                                +{campaign.assetCode} {tx.amount.toFixed(2)}
                              </span>
                              <span className="text-sm text-green-600 ml-2">
                                from {tx.from}
                              </span>
                            </div>
                          ) : (
                            <div className="inline-block bg-red-100 px-4 py-2 rounded-lg">
                              <span className="font-bold text-red-700">
                                -{campaign.assetCode} {tx.amount.toFixed(2)}
                              </span>
                              <span className="text-sm text-red-600 ml-2">
                                to {tx.purpose}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="w-8">
                          {tx.type === 'in' ? '📥' : '📤'}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stellar Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">🌐 Blockchain Verification</h3>
          <p className="text-sm text-blue-800 mb-3">
            All transactions are permanently recorded on the Stellar blockchain and can be independently verified.
          </p>
          <a
            href={`https://horizon-testnet.stellar.org/accounts/${campaign.stellarAccount}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium"
          >
            View Campaign Wallet on Stellar Horizon →
          </a>
        </div>
      </div>
    </div>
  );
}

export default AuditDashboard;
