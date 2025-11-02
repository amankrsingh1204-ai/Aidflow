const StellarSdk = require('stellar-sdk');

const config = {
    network: process.env.STELLAR_NETWORK || 'testnet',
    horizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE || StellarSdk.Networks.TESTNET,
    platformPublicKey: process.env.PLATFORM_PUBLIC_KEY,
    platformSecretKey: process.env.PLATFORM_SECRET_KEY,
    signers: {
        signer1: process.env.SIGNER_1_SECRET,
        signer2: process.env.SIGNER_2_SECRET,
        signer3: process.env.SIGNER_3_SECRET
    }
};

// Initialize Stellar Server
const server = new StellarSdk.Horizon.Server(config.horizonUrl);

module.exports = {
    config,
    server,
    StellarSdk
};
