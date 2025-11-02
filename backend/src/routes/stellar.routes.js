const express = require('express');
const router = express.Router();
const StellarService = require('../services/stellar.service');

// Create new Stellar account
router.post('/account/create', async (req, res) => {
    try {
        const account = StellarService.createAccount();
        
        // Fund on testnet if applicable
        if (process.env.STELLAR_NETWORK === 'testnet') {
            await StellarService.fundTestnetAccount(account.publicKey);
        }
        
        res.json(account);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get account details
router.get('/account/:publicKey', async (req, res) => {
    try {
        const details = await StellarService.getAccountDetails(req.params.publicKey);
        res.json(details);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get account transactions
router.get('/account/:publicKey/transactions', async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const transactions = await StellarService.getAccountTransactions(
            req.params.publicKey, 
            parseInt(limit)
        );
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get account payments
router.get('/account/:publicKey/payments', async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const payments = await StellarService.getAccountPayments(
            req.params.publicKey, 
            parseInt(limit)
        );
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get transaction details
router.get('/transaction/:txId', async (req, res) => {
    try {
        const transaction = await StellarService.getTransaction(req.params.txId);
        res.json({
            transaction,
            horizonUrl: StellarService.getHorizonUrl(req.params.txId)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Validate Stellar address
router.post('/validate-address', (req, res) => {
    const { address } = req.body;
    const isValid = StellarService.isValidAddress(address);
    res.json({ address, isValid });
});

module.exports = router;
