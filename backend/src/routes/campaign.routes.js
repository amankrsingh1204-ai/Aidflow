const express = require('express');
const router = express.Router();
const Campaign = require('../models/campaign.model');
const StellarService = require('../services/stellar.service');

// Get all campaigns
router.get('/', async (req, res) => {
    try {
        const { status, category, limit = 20, offset = 0 } = req.query;
        
        const where = {};
        if (status) where.status = status;
        if (category) where.category = category;

        const campaigns = await Campaign.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get campaign by ID
router.get('/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findByPk(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Get Stellar account balance
        try {
            const accountDetails = await StellarService.getAccountDetails(campaign.stellarAccount);
            campaign.dataValues.stellarBalance = accountDetails.balances;
        } catch (error) {
            console.error('Error fetching Stellar balance:', error);
        }

        res.json(campaign);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new campaign
router.post('/', async (req, res) => {
    try {
        const {
            ngoId,
            title,
            description,
            category,
            targetAmount,
            assetCode,
            assetIssuer,
            startDate,
            endDate,
            imageUrl,
            signerKeys
        } = req.body;

        // Create Stellar account for campaign
        const newAccount = StellarService.createAccount();
        
        // Fund account on testnet (remove in production)
        if (process.env.STELLAR_NETWORK === 'testnet') {
            await StellarService.fundTestnetAccount(newAccount.publicKey);
        }

        // Setup multi-sig if signers provided
        if (signerKeys && signerKeys.length > 0) {
            await StellarService.setupMultiSigAccount(
                newAccount.secretKey,
                signerKeys,
                2 // threshold
            );
        }

        const campaign = await Campaign.create({
            ngoId,
            title,
            description,
            category,
            targetAmount,
            assetCode: assetCode || 'USDC',
            assetIssuer,
            stellarAccount: newAccount.publicKey,
            startDate,
            endDate,
            imageUrl,
            status: 'active'
        });

        res.status(201).json({
            campaign,
            stellarSecretKey: newAccount.secretKey // Return only once, store securely
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update campaign
router.put('/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findByPk(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        await campaign.update(req.body);
        res.json(campaign);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get campaign statistics
router.get('/:id/stats', async (req, res) => {
    try {
        const campaign = await Campaign.findByPk(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Get transaction history from Stellar
        const payments = await StellarService.getAccountPayments(campaign.stellarAccount, 100);
        
        // Calculate statistics
        const donationCount = payments.filter(p => p.type === 'payment' && p.to === campaign.stellarAccount).length;
        const totalRaised = parseFloat(campaign.raisedAmount);
        const percentageReached = (totalRaised / parseFloat(campaign.targetAmount)) * 100;

        res.json({
            campaignId: campaign.id,
            totalRaised,
            targetAmount: parseFloat(campaign.targetAmount),
            donationCount,
            percentageReached: percentageReached.toFixed(2),
            status: campaign.status,
            recentPayments: payments.slice(0, 10)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
