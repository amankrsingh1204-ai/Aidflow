const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Donation = sequelize.define('Donation', {
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
    donorId: {
        type: DataTypes.UUID,
        field: 'donor_id'
    },
    donorEmail: {
        type: DataTypes.STRING(255),
        field: 'donor_email'
    },
    donorName: {
        type: DataTypes.STRING(255),
        field: 'donor_name'
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
        allowNull: false,
        field: 'stellar_transaction_id'
    },
    stellarMemo: {
        type: DataTypes.TEXT,
        field: 'stellar_memo'
    },
    sourceAccount: {
        type: DataTypes.STRING(56),
        allowNull: false,
        field: 'source_account'
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'completed'
    },
    isAnonymous: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_anonymous'
    },
    message: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'donations',
    timestamps: true,
    underscored: true,
    updatedAt: false
});

module.exports = Donation;
