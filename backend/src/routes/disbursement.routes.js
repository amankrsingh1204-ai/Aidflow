const express = require('express');
const router = express.Router();
const Disbursement = require('../models/disbursement.model');
const Campaign = require('../models/campaign.model');
const StellarService = require('../services/stellar.service');

// Get all disbursements
router.get('/', async (req, res) => {
    try {
        const { campaignId, status, limit = 50, offset = 0 } = req.query;
        
        const where = {};
        if (campaignId) where.campaignId = campaignId;
        if (status) where.status = status;

        const disbursements = await Disbursement.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json(disbursements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get disbursement by ID
router.get('/:id', async (req, res) => {
    try {
        const disbursement = await Disbursement.findByPk(req.params.id);
        
        if (!disbursement) {
            return res.status(404).json({ error: 'Disbursement not found' });
        }

        // Get transaction details if completed
        if (disbursement.stellarTransactionId) {
            try {
                const txDetails = await StellarService.getTransaction(disbursement.stellarTransactionId);
                disbursement.dataValues.stellarTransaction = txDetails;
            } catch (error) {
                console.error('Error fetching transaction:', error);
            }
        }

        res.json(disbursement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create disbursement request
router.post('/', async (req, res) => {
    try {
        const {
            campaignId,
            recipientId,
            amount,
            purpose,
            requestedBy,
            scheduledDate,
            notes
        } = req.body;

        // Verify campaign exists
        const campaign = await Campaign.findByPk(campaignId);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Check if campaign has sufficient funds
        const currentBalance = parseFloat(campaign.raisedAmount);
        if (currentBalance < parseFloat(amount)) {
            return res.status(400).json({ 
                error: 'Insufficient funds in campaign',
                available: currentBalance,
                requested: amount
            });
        }

        const disbursement = await Disbursement.create({
            campaignId,
            recipientId,
            amount,
            assetCode: campaign.assetCode,
            assetIssuer: campaign.assetIssuer,
            purpose,
            requestedBy,
            scheduledDate,
            notes,
            status: 'pending',
            requiredApprovals: campaign.multisigThreshold || 2
        });

        res.status(201).json(disbursement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Approve disbursement
router.post('/:id/approve', async (req, res) => {
    try {
        const { approverId, signature } = req.body;
        
        const disbursement = await Disbursement.findByPk(req.params.id);
        if (!disbursement) {
            return res.status(404).json({ error: 'Disbursement not found' });
        }

        if (disbursement.status !== 'pending') {
            return res.status(400).json({ error: 'Disbursement is not pending approval' });
        }

        // Increment approval count
        const newApprovalCount = disbursement.approvalCount + 1;
        await disbursement.update({
            approvalCount: newApprovalCount,
            approvedBy: approverId
        });

        // Check if enough approvals
        if (newApprovalCount >= disbursement.requiredApprovals) {
            await disbursement.update({ status: 'approved' });
        }

        res.json({
            disbursement,
            approved: newApprovalCount >= disbursement.requiredApprovals
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Execute disbursement (process payment)
router.post('/:id/execute', async (req, res) => {
    try {
        const { signerSecrets } = req.body; // Array of secret keys for multi-sig
        
        const disbursement = await Disbursement.findByPk(req.params.id);
        if (!disbursement) {
            return res.status(404).json({ error: 'Disbursement not found' });
        }

        if (disbursement.status !== 'approved') {
            return res.status(400).json({ error: 'Disbursement must be approved first' });
        }

        const campaign = await Campaign.findByPk(disbursement.campaignId);
        
        // Get recipient details (assuming recipient model exists)
        // For now, using recipientId as stellar address
        const recipientAddress = disbursement.recipientId; // Should be recipient's stellar address

        try {
            await disbursement.update({ status: 'processing' });

            // Create multi-sig transaction
            const { xdr, hash } = await StellarService.createMultiSigPayment(
                campaign.stellarAccount,
                recipientAddress,
                disbursement.amount,
                disbursement.assetCode,
                disbursement.assetIssuer,
                `Disbursement: ${disbursement.purpose}`
            );

            // Sign with provided secrets
            let signedXdr = xdr;
            for (const secret of signerSecrets) {
                signedXdr = StellarService.signTransaction(signedXdr, secret);
            }

            // Submit transaction
            const result = await StellarService.submitTransaction(signedXdr);

            // Update disbursement
            await disbursement.update({
                status: 'completed',
                stellarTransactionId: result.transactionId,
                completedAt: new Date()
            });

            // Update campaign balance
            const newBalance = parseFloat(campaign.raisedAmount) - parseFloat(disbursement.amount);
            await campaign.update({ raisedAmount: newBalance });

            res.json({
                disbursement,
                transaction: result,
                horizonUrl: StellarService.getHorizonUrl(result.transactionId)
            });
        } catch (error) {
            await disbursement.update({ status: 'failed' });
            throw error;
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get disbursement statistics for campaign
router.get('/campaign/:campaignId/stats', async (req, res) => {
    try {
        const { campaignId } = req.params;

        const disbursements = await Disbursement.findAll({
            where: { campaignId }
        });

        const completed = disbursements.filter(d => d.status === 'completed');
        const pending = disbursements.filter(d => d.status === 'pending');
        const totalDisbursed = completed.reduce((sum, d) => sum + parseFloat(d.amount), 0);

        res.json({
            campaignId,
            totalDisbursements: disbursements.length,
            completed: completed.length,
            pending: pending.length,
            totalDisbursed: totalDisbursed.toFixed(7),
            recentDisbursements: disbursements.slice(0, 10)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
