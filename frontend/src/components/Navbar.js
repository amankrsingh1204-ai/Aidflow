import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">💧 AidFlow</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/campaigns" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Campaigns
              </Link>
              <Link to="/create-campaign" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Create Campaign
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-4">Testnet</span>
            <button className="btn-primary text-sm">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
