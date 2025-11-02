-- AidFlow Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (NGOs, Donors, Recipients, Admins)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ngo', 'donor', 'recipient', 'admin')),
    full_name VARCHAR(255) NOT NULL,
    organization_name VARCHAR(255),
    stellar_public_key VARCHAR(56),
    kyc_status VARCHAR(50) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected', 'not_required')),
    kyc_tier INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ngo_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    target_amount DECIMAL(20, 7) NOT NULL,
    raised_amount DECIMAL(20, 7) DEFAULT 0,
    asset_code VARCHAR(12) NOT NULL DEFAULT 'USDC',
    asset_issuer VARCHAR(56),
    stellar_account VARCHAR(56) NOT NULL,
    multisig_threshold INTEGER DEFAULT 2,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign signers (for multi-sig)
CREATE TABLE campaign_signers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    signer_public_key VARCHAR(56) NOT NULL,
    signer_name VARCHAR(255),
    weight INTEGER DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Donations table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    donor_id UUID REFERENCES users(id),
    donor_email VARCHAR(255),
    donor_name VARCHAR(255),
    amount DECIMAL(20, 7) NOT NULL,
    asset_code VARCHAR(12) NOT NULL,
    asset_issuer VARCHAR(56),
    stellar_transaction_id VARCHAR(64) UNIQUE NOT NULL,
    stellar_memo TEXT,
    source_account VARCHAR(56) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    is_anonymous BOOLEAN DEFAULT false,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipients table
CREATE TABLE recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    campaign_id UUID REFERENCES campaigns(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    stellar_public_key VARCHAR(56) NOT NULL,
    id_document_type VARCHAR(50),
    id_document_number VARCHAR(100),
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_notes TEXT,
    country VARCHAR(100),
    region VARCHAR(100),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disbursements table
CREATE TABLE disbursements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    recipient_id UUID NOT NULL REFERENCES recipients(id),
    amount DECIMAL(20, 7) NOT NULL,
    asset_code VARCHAR(12) NOT NULL,
    asset_issuer VARCHAR(56),
    stellar_transaction_id VARCHAR(64) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'failed', 'rejected')),
    purpose TEXT NOT NULL,
    requested_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approval_count INTEGER DEFAULT 0,
    required_approvals INTEGER DEFAULT 2,
    receipt_url VARCHAR(500),
    notes TEXT,
    scheduled_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disbursement approvals (for multi-sig workflow)
CREATE TABLE disbursement_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disbursement_id UUID NOT NULL REFERENCES disbursements(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES users(id),
    approver_public_key VARCHAR(56) NOT NULL,
    signature TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('approved', 'rejected')),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions log (comprehensive audit trail)
CREATE TABLE transaction_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('donation', 'disbursement', 'refund', 'fee')),
    related_entity_id UUID,
    stellar_transaction_id VARCHAR(64) NOT NULL,
    from_account VARCHAR(56) NOT NULL,
    to_account VARCHAR(56) NOT NULL,
    amount DECIMAL(20, 7) NOT NULL,
    asset_code VARCHAR(12) NOT NULL,
    asset_issuer VARCHAR(56),
    memo TEXT,
    ledger_number INTEGER,
    operation_count INTEGER,
    fee_charged DECIMAL(20, 7),
    successful BOOLEAN DEFAULT true,
    horizon_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Milestones table (for conditional payouts)
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(20, 7),
    achieved_amount DECIMAL(20, 7) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs (system actions)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KYC documents table
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    document_type VARCHAR(50) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_stellar_key ON users(stellar_public_key);

CREATE INDEX idx_campaigns_ngo ON campaigns(ngo_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_stellar_account ON campaigns(stellar_account);

CREATE INDEX idx_donations_campaign ON donations(campaign_id);
CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_donations_tx ON donations(stellar_transaction_id);
CREATE INDEX idx_donations_created ON donations(created_at);

CREATE INDEX idx_recipients_campaign ON recipients(campaign_id);
CREATE INDEX idx_recipients_user ON recipients(user_id);
CREATE INDEX idx_recipients_status ON recipients(verification_status);

CREATE INDEX idx_disbursements_campaign ON disbursements(campaign_id);
CREATE INDEX idx_disbursements_recipient ON disbursements(recipient_id);
CREATE INDEX idx_disbursements_status ON disbursements(status);
CREATE INDEX idx_disbursements_tx ON disbursements(stellar_transaction_id);

CREATE INDEX idx_transaction_log_type ON transaction_log(transaction_type);
CREATE INDEX idx_transaction_log_stellar_tx ON transaction_log(stellar_transaction_id);
CREATE INDEX idx_transaction_log_created ON transaction_log(created_at);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipients_updated_at BEFORE UPDATE ON recipients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disbursements_updated_at BEFORE UPDATE ON disbursements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
