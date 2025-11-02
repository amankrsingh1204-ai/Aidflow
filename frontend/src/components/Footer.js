import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">💧 AidFlow</h3>
            <p className="text-gray-400">
              Transparent NGO donation platform powered by Stellar blockchain.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/campaigns" className="hover:text-white">Browse Campaigns</a></li>
              <li><a href="/create-campaign" className="hover:text-white">Create Campaign</a></li>
              <li><a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-white">About Stellar</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <p className="text-gray-400">
              Built on Stellar Network<br />
              Testnet: <span className="text-blue-400">horizon-testnet.stellar.org</span>
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 AidFlow. Empowering transparent giving.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
