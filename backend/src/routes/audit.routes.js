const express = require('express');
const router = express.Router();
const Donation = require('../models/donation.model');
const Disbursement = require('../models/disbursement.model');
const Campaign = require('../models/campaign.model');

// Get complete audit trail for a campaign
router.get('/campaign/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;

        const campaign = await Campaign.findByPk(campaignId);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Get all donations
        const donations = await Donation.findAll({
            where: { campaignId },
            order: [['createdAt', 'DESC']]
        });

        // Get all disbursements
        const disbursements = await Disbursement.findAll({
            where: { campaignId },
            order: [['createdAt', 'DESC']]
        });

        // Calculate flow
        const totalReceived = donations.reduce((sum, d) => 
            sum + parseFloat(d.amount), 0);
        const totalDisbursed = disbursements
            .filter(d => d.status === 'completed')
            .reduce((sum, d) => sum + parseFloat(d.amount), 0);
        const currentBalance = totalReceived - totalDisbursed;

        res.json({
            campaign: {
                id: campaign.id,
                title: campaign.title,
                stellarAccount: campaign.stellarAccount,
                targetAmount: parseFloat(campaign.targetAmount),
                status: campaign.status
            },
            summary: {
                totalReceived: totalReceived.toFixed(7),
                totalDisbursed: totalDisbursed.toFixed(7),
                currentBalance: currentBalance.toFixed(7),
                donationCount: donations.length,
                disbursementCount: disbursements.filter(d => d.status === 'completed').length
            },
            donations,
            disbursements,
            flowChart: {
                inflows: donations.map(d => ({
                    date: d.createdAt,
                    amount: parseFloat(d.amount),
                    from: d.isAnonymous ? 'Anonymous' : d.donorName,
                    txId: d.stellarTransactionId
                })),
                outflows: disbursements
                    .filter(d => d.status === 'completed')
                    .map(d => ({
                        date: d.completedAt,
                        amount: parseFloat(d.amount),
                        to: d.recipientId,
                        purpose: d.purpose,
                        txId: d.stellarTransactionId
                    }))
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Track specific donation flow
router.get('/donation/:donationId/track', async (req, res) => {
    try {
        const donation = await Donation.findByPk(req.params.donationId);
        
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        const campaign = await Campaign.findByPk(donation.campaignId);
        
        // Get related disbursements (proportional tracking)
        const disbursements = await Disbursement.findAll({
            where: { 
                campaignId: donation.campaignId,
                status: 'completed'
            },
            order: [['completedAt', 'ASC']]
        });

        res.json({
            donation: {
                id: donation.id,
                amount: parseFloat(donation.amount),
                date: donation.createdAt,
                transactionId: donation.stellarTransactionId,
                campaign: campaign.title
            },
            status: 'tracked',
            campaign: {
                totalRaised: parseFloat(campaign.raisedAmount),
                totalDisbursed: disbursements.reduce((sum, d) => 
                    sum + parseFloat(d.amount), 0)
            },
            relatedDisbursements: disbursements.map(d => ({
                id: d.id,
                amount: parseFloat(d.amount),
                date: d.completedAt,
                purpose: d.purpose,
                transactionId: d.stellarTransactionId
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get transparency score/metrics
router.get('/campaign/:campaignId/transparency', async (req, res) => {
    try {
        const { campaignId } = req.params;

        const donations = await Donation.findAll({ 
            where: { campaignId } 
        });
        
        const disbursements = await Disbursement.findAll({ 
            where: { campaignId } 
        });

        const completedDisbursements = disbursements.filter(d => d.status === 'completed');
        const allDisbursementsHaveTxId = completedDisbursements.every(d => d.stellarTransactionId);
        const allDonationsHaveTxId = donations.every(d => d.stellarTransactionId);

        const transparencyScore = (
            (allDonationsHaveTxId ? 50 : 0) +
            (allDisbursementsHaveTxId ? 50 : 0)
        );

        res.json({
            campaignId,
            transparencyScore,
            metrics: {
                allDonationsVerifiable: allDonationsHaveTxId,
                allDisbursementsVerifiable: allDisbursementsHaveTxId,
                totalTransactions: donations.length + completedDisbursements.length,
                onChainRecords: donations.length + completedDisbursements.length
            },
            rating: transparencyScore === 100 ? 'Excellent' : 
                    transparencyScore >= 80 ? 'Good' : 
                    transparencyScore >= 60 ? 'Fair' : 'Needs Improvement'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
