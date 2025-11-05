-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    stellar_address VARCHAR(56),
    role VARCHAR(20) NOT NULL CHECK (role IN ('ngo', 'donor', 'admin')),
    organization_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ngo_address VARCHAR(56) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_amount TEXT NOT NULL,
    raised_amount TEXT DEFAULT '0',
    is_active BOOLEAN DEFAULT TRUE,
    contract_campaign_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    donor_address VARCHAR(56) NOT NULL,
    amount TEXT NOT NULL,
    token_address VARCHAR(56) NOT NULL,
    transaction_hash VARCHAR(64) UNIQUE NOT NULL,
    message TEXT,
    contract_donation_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disbursements table
CREATE TABLE disbursements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    recipient_address VARCHAR(56) NOT NULL,
    amount TEXT NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'executed', 'rejected')),
    approvals_count INTEGER DEFAULT 0,
    required_approvals INTEGER DEFAULT 2,
    transaction_hash VARCHAR(64),
    contract_disbursement_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_at TIMESTAMP WITH TIME ZONE
);

-- Disbursement approvals table
CREATE TABLE disbursement_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disbursement_id UUID NOT NULL REFERENCES disbursements(id) ON DELETE CASCADE,
    approver_address VARCHAR(56) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(disbursement_id, approver_address)
);

-- Recipients table
CREATE TABLE recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stellar_address VARCHAR(56) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('campaign', 'donation', 'disbursement', 'user')),
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_address VARCHAR(56) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_campaigns_ngo_address ON campaigns(ngo_address);
CREATE INDEX idx_campaigns_is_active ON campaigns(is_active);
CREATE INDEX idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX idx_donations_donor_address ON donations(donor_address);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX idx_disbursements_campaign_id ON disbursements(campaign_id);
CREATE INDEX idx_disbursements_status ON disbursements(status);
CREATE INDEX idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipients_updated_at BEFORE UPDATE ON recipients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
