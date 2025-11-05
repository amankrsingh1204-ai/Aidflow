#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

/// Campaign data structure
#[derive(Clone)]
#[contracttype]
pub struct Campaign {
    pub id: u32,
    pub name: String,
    pub org: Address,
    pub goal: i128,
    pub raised: i128,
    pub deadline: u64,
    pub active: bool,
}

/// Donation data structure
#[derive(Clone)]
#[contracttype]
pub struct Donation {
    pub donor: Address,
    pub amount: i128,
    pub timestamp: u64,
}

/// Storage keys
#[contracttype]
pub enum DataKey {
    Admin,
    CampaignCount,
    Campaign(u32),
    CampaignDonations(u32),
    TotalDonationsCount,
}

#[contract]
pub struct DonationContract;

#[contractimpl]
impl DonationContract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Contract already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::CampaignCount, &0u32);
        env.storage().instance().set(&DataKey::TotalDonationsCount, &0u32);
    }

    pub fn create_campaign(env: Env, org: Address, name: String, goal: i128, deadline: u64) -> u32 {
        org.require_auth();
        if goal <= 0 {
            panic!("Goal must be greater than 0");
        }
        let current_time = env.ledger().timestamp();
        if deadline <= current_time {
            panic!("Deadline must be in the future");
        }
        let mut campaign_count: u32 = env.storage().instance().get(&DataKey::CampaignCount).unwrap_or(0);
        campaign_count += 1;
        let campaign = Campaign {
            id: campaign_count,
            name,
            org,
            goal,
            raised: 0,
            deadline,
            active: true,
        };
        env.storage().persistent().set(&DataKey::Campaign(campaign_count), &campaign);
        env.storage().instance().set(&DataKey::CampaignCount, &campaign_count);
        let donations: Vec<Donation> = Vec::new(&env);
        env.storage().persistent().set(&DataKey::CampaignDonations(campaign_count), &donations);
        campaign_count
    }

    pub fn donate(env: Env, campaign_id: u32, donor: Address, amount: i128) {
        donor.require_auth();
        if amount <= 0 {
            panic!("Donation amount must be greater than 0");
        }
        let mut campaign: Campaign = env.storage().persistent().get(&DataKey::Campaign(campaign_id)).expect("Campaign not found");
        if !campaign.active {
            panic!("Campaign is not active");
        }
        let current_time = env.ledger().timestamp();
        if current_time > campaign.deadline {
            panic!("Campaign deadline has passed");
        }
        campaign.raised += amount;
        env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);
        let donation = Donation { donor: donor.clone(), amount, timestamp: current_time };
        let mut campaign_donations: Vec<Donation> = env.storage().persistent().get(&DataKey::CampaignDonations(campaign_id)).unwrap_or(Vec::new(&env));
        campaign_donations.push_back(donation);
        env.storage().persistent().set(&DataKey::CampaignDonations(campaign_id), &campaign_donations);
        let mut total_donations: u32 = env.storage().instance().get(&DataKey::TotalDonationsCount).unwrap_or(0);
        total_donations += 1;
        env.storage().instance().set(&DataKey::TotalDonationsCount, &total_donations);
    }

    pub fn disburse(env: Env, campaign_id: u32, recipient: Address, amount: i128) {
        let mut campaign: Campaign = env.storage().persistent().get(&DataKey::Campaign(campaign_id)).expect("Campaign not found");
        campaign.org.require_auth();
        if amount <= 0 {
            panic!("Disbursement amount must be greater than 0");
        }
        if amount > campaign.raised {
            panic!("Insufficient funds in campaign");
        }
        campaign.raised -= amount;
        env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);
    }

    pub fn get_campaign(env: Env, id: u32) -> Campaign {
        env.storage().persistent().get(&DataKey::Campaign(id)).expect("Campaign not found")
    }

    pub fn get_donations(env: Env, campaign_id: u32) -> Vec<Donation> {
        env.storage().persistent().get(&DataKey::CampaignDonations(campaign_id)).unwrap_or(Vec::new(&env))
    }

    pub fn close_campaign(env: Env, id: u32) {
        let mut campaign: Campaign = env.storage().persistent().get(&DataKey::Campaign(id)).expect("Campaign not found");
        campaign.org.require_auth();
        if !campaign.active {
            panic!("Campaign already closed");
        }
        campaign.active = false;
        env.storage().persistent().set(&DataKey::Campaign(id), &campaign);
    }

    pub fn get_campaigns_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::CampaignCount).unwrap_or(0)
    }

    pub fn get_total_donations_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::TotalDonationsCount).unwrap_or(0)
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).expect("Contract not initialized")
    }

    pub fn is_goal_reached(env: Env, campaign_id: u32) -> bool {
        let campaign: Campaign = env.storage().persistent().get(&DataKey::Campaign(campaign_id)).expect("Campaign not found");
        campaign.raised >= campaign.goal
    }

    pub fn get_remaining_amount(env: Env, campaign_id: u32) -> i128 {
        let campaign: Campaign = env.storage().persistent().get(&DataKey::Campaign(campaign_id)).expect("Campaign not found");
        let remaining = campaign.goal - campaign.raised;
        if remaining > 0 { remaining } else { 0 }
    }
}

#[cfg(test)]
mod test;
