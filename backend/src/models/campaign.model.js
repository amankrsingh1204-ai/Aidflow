const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Campaign = sequelize.define('Campaign', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    ngoId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'ngo_id'
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(100)
    },
    targetAmount: {
        type: DataTypes.DECIMAL(20, 7),
        allowNull: false,
        field: 'target_amount'
    },
    raisedAmount: {
        type: DataTypes.DECIMAL(20, 7),
        defaultValue: 0,
        field: 'raised_amount'
    },
    assetCode: {
        type: DataTypes.STRING(12),
        defaultValue: 'USDC',
        field: 'asset_code'
    },
    assetIssuer: {
        type: DataTypes.STRING(56),
        field: 'asset_issuer'
    },
    stellarAccount: {
        type: DataTypes.STRING(56),
        allowNull: false,
        field: 'stellar_account'
    },
    multisigThreshold: {
        type: DataTypes.INTEGER,
        defaultValue: 2,
        field: 'multisig_threshold'
    },
    status: {
        type: DataTypes.ENUM('draft', 'active', 'paused', 'completed', 'cancelled'),
        defaultValue: 'active'
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'start_date'
    },
    endDate: {
        type: DataTypes.DATE,
        field: 'end_date'
    },
    imageUrl: {
        type: DataTypes.STRING(500),
        field: 'image_url'
    }
}, {
    tableName: 'campaigns',
    timestamps: true,
    underscored: true
});

module.exports = Campaign;
