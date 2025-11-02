import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transparent Giving, Powered by Stellar
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Track every donation from source to impact with blockchain transparency
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/campaigns" className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition">
                Browse Campaigns
              </Link>
              <Link to="/create-campaign" className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition">
                Create Campaign
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Why AidFlow?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-blue-50 p-8 rounded-xl card-shadow">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-4">Complete Transparency</h3>
              <p className="text-gray-700">
                Every transaction recorded on Stellar blockchain. Track donations from receipt to final impact.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-green-50 p-8 rounded-xl card-shadow">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-4">Lightning Fast</h3>
              <p className="text-gray-700">
                Stellar's 3-5 second settlement. Near-zero fees mean more goes to those in need.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-purple-50 p-8 rounded-xl card-shadow">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-2xl font-bold mb-4">Secure Multi-Sig</h3>
              <p className="text-gray-700">
                Multi-signature treasury ensures funds are protected and disbursements are approved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold mb-2">Create Campaign</h3>
              <p className="text-gray-600">NGO creates a campaign with goals and multi-sig wallet</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold mb-2">Receive Donations</h3>
              <p className="text-gray-600">Donors send crypto directly to campaign wallet</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold mb-2">Approve Disbursement</h3>
              <p className="text-gray-600">Multi-sig approval for payments to recipients</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
              <h3 className="text-xl font-bold mb-2">Track Impact</h3>
              <p className="text-gray-600">Donors see exactly where their money went</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-xl text-gray-700">Transparent</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-green-600 mb-2">&lt;$0.00001</div>
              <div className="text-xl text-gray-700">Transaction Fee</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-600 mb-2">3-5s</div>
              <div className="text-xl text-gray-700">Settlement Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="stellar-gradient text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Make an Impact?</h2>
          <p className="text-xl mb-8">
            Join NGOs and donors who trust blockchain for transparent giving
          </p>
          <Link to="/create-campaign" className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition inline-block">
            Start Your Campaign
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
