import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { auditService, donationService } from '../services/api';

function DonationTracking() {
  const { donationId } = useParams();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackingData();
  }, [donationId]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      const response = await auditService.trackDonation(donationId);
      setTrackingData(response.data);
    } catch (error) {
      toast.error('Failed to load tracking data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading tracking data...</div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-xl text-gray-600">Donation not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Track Your Donation</h1>

        {/* Donation Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Your Contribution</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Amount</div>
              <div className="text-2xl font-bold text-green-600">
                ${trackingData.donation.amount.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Date</div>
              <div className="text-lg font-medium">
                {new Date(trackingData.donation.date).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-1">Campaign</div>
            <div className="font-medium">{trackingData.donation.campaign}</div>
          </div>
          <div className="mt-4 bg-gray-50 p-3 rounded">
            <div className="text-xs text-gray-600 mb-1">Transaction ID</div>
            <div className="text-xs font-mono break-all">{trackingData.donation.transactionId}</div>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Your Impact</h2>
          <p className="text-gray-700 mb-4">
            Your donation is part of a pool of funds that has been used to support {trackingData.relatedDisbursements.length} recipients.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-70 rounded-lg p-4">
              <div className="text-sm text-gray-600">Campaign Total Raised</div>
              <div className="text-xl font-bold">${trackingData.campaign.totalRaised.toFixed(2)}</div>
            </div>
            <div className="bg-white bg-opacity-70 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total Disbursed</div>
              <div className="text-xl font-bold">${trackingData.campaign.totalDisbursed.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Related Disbursements */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Related Disbursements</h2>
          <p className="text-sm text-gray-600 mb-4">
            These are the payments made from the campaign pool that your donation helped fund:
          </p>
          <div className="space-y-4">
            {trackingData.relatedDisbursements.map((disbursement, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold">{disbursement.purpose}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(disbursement.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    ${disbursement.amount.toFixed(2)}
                  </div>
                </div>
                {disbursement.transactionId && (
                  <a
                    href={`https://horizon-testnet.stellar.org/transactions/${disbursement.transactionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Transaction →
                  </a>
                )}
              </div>
            ))}
            {trackingData.relatedDisbursements.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No disbursements yet. Your funds are being held securely until allocated.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonationTracking;
