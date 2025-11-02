const express = require('express');
const router = express.Router();
const Donation = require('../models/donation.model');
const Campaign = require('../models/campaign.model');
const StellarService = require('../services/stellar.service');

// Get all donations
router.get('/', async (req, res) => {
    try {
        const { campaignId, donorId, limit = 50, offset = 0 } = req.query;
        
        const where = {};
        if (campaignId) where.campaignId = campaignId;
        if (donorId) where.donorId = donorId;

        const donations = await Donation.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json(donations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get donation by ID
router.get('/:id', async (req, res) => {
    try {
        const donation = await Donation.findByPk(req.params.id);
        
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        // Get transaction details from Stellar
        try {
            const txDetails = await StellarService.getTransaction(donation.stellarTransactionId);
            donation.dataValues.stellarTransaction = txDetails;
        } catch (error) {
            console.error('Error fetching transaction:', error);
        }

        res.json(donation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Record new donation (after Stellar transaction)
router.post('/', async (req, res) => {
    try {
        const {
            campaignId,
            donorId,
            donorEmail,
            donorName,
            amount,
            assetCode,
            assetIssuer,
            stellarTransactionId,
            sourceAccount,
            isAnonymous,
            message
        } = req.body;

        // Verify campaign exists
        const campaign = await Campaign.findByPk(campaignId);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Verify transaction on Stellar network
        try {
            const txDetails = await StellarService.getTransaction(stellarTransactionId);
            
            // Verify transaction was successful
            if (!txDetails.successful) {
                return res.status(400).json({ error: 'Transaction failed on Stellar network' });
            }
        } catch (error) {
            return res.status(400).json({ error: 'Invalid transaction ID or transaction not found' });
        }

        // Create donation record
        const donation = await Donation.create({
            campaignId,
            donorId,
            donorEmail,
            donorName,
            amount,
            assetCode: assetCode || campaign.assetCode,
            assetIssuer,
            stellarTransactionId,
            stellarMemo: `Donation to ${campaign.title}`,
            sourceAccount,
            status: 'completed',
            isAnonymous: isAnonymous || false,
            message
        });

        // Update campaign raised amount
        const newRaisedAmount = parseFloat(campaign.raisedAmount) + parseFloat(amount);
        await campaign.update({ raisedAmount: newRaisedAmount });

        // Check if campaign goal reached
        if (newRaisedAmount >= parseFloat(campaign.targetAmount)) {
            await campaign.update({ status: 'completed' });
        }

        res.status(201).json({
            donation,
            campaign: {
                id: campaign.id,
                raisedAmount: newRaisedAmount,
                status: campaign.status
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get donation statistics for a campaign
router.get('/campaign/:campaignId/stats', async (req, res) => {
    try {
        const { campaignId } = req.params;

        const donations = await Donation.findAll({
            where: { campaignId, status: 'completed' }
        });

        const totalDonations = donations.length;
        const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
        const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;
        const uniqueDonors = new Set(donations.map(d => d.donorId || d.donorEmail)).size;

        res.json({
            campaignId,
            totalDonations,
            totalAmount: totalAmount.toFixed(7),
            averageDonation: averageDonation.toFixed(7),
            uniqueDonors,
            largestDonation: donations.length > 0 
                ? Math.max(...donations.map(d => parseFloat(d.amount))).toFixed(7)
                : 0,
            recentDonations: donations.slice(0, 5)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify donation on blockchain
router.get('/verify/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        const transaction = await StellarService.getTransaction(transactionId);
        
        res.json({
            verified: true,
            transaction,
            horizonUrl: StellarService.getHorizonUrl(transactionId)
        });
    } catch (error) {
        res.status(404).json({ 
            verified: false, 
            error: 'Transaction not found on Stellar network' 
        });
    }
});

module.exports = router;
