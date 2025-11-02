const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Disbursement = sequelize.define('Disbursement', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    campaignId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'campaign_id'
    },
    recipientId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'recipient_id'
    },
    amount: {
        type: DataTypes.DECIMAL(20, 7),
        allowNull: false
    },
    assetCode: {
        type: DataTypes.STRING(12),
        allowNull: false,
        field: 'asset_code'
    },
    assetIssuer: {
        type: DataTypes.STRING(56),
        field: 'asset_issuer'
    },
    stellarTransactionId: {
        type: DataTypes.STRING(64),
        unique: true,
        field: 'stellar_transaction_id'
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'processing', 'completed', 'failed', 'rejected'),
        defaultValue: 'pending'
    },
    purpose: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    requestedBy: {
        type: DataTypes.UUID,
        field: 'requested_by'
    },
    approvedBy: {
        type: DataTypes.UUID,
        field: 'approved_by'
    },
    approvalCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'approval_count'
    },
    requiredApprovals: {
        type: DataTypes.INTEGER,
        defaultValue: 2,
        field: 'required_approvals'
    },
    receiptUrl: {
        type: DataTypes.STRING(500),
        field: 'receipt_url'
    },
    notes: {
        type: DataTypes.TEXT
    },
    scheduledDate: {
        type: DataTypes.DATE,
        field: 'scheduled_date'
    },
    completedAt: {
        type: DataTypes.DATE,
        field: 'completed_at'
    }
}, {
    tableName: 'disbursements',
    timestamps: true,
    underscored: true
});

module.exports = Disbursement;
