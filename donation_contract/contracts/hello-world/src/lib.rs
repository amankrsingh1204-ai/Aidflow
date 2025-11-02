#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String, Vec};

#[contract]
pub struct DonationContract;

#[contracttype]
#[derive(Clone)]
pub struct Campaign {
    pub id: u64,
    pub name: String,
    pub ngo_address: Address,
    pub goal_amount: i128,
    pub raised_amount: i128,
    pub active: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct Donation {
    pub campaign_id: u64,
    pub donor: Address,
    pub amount: i128,
    pub timestamp: u64,
}

#[contractimpl]
impl DonationContract {
    /// Initialize the contract
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&String::from_str(&env, "admin"), &admin);
        env.storage().instance().set(&String::from_str(&env, "campaign_count"), &0u64);
    }

    /// Create a new campaign
    pub fn create_campaign(
        env: Env,
        name: String,
        ngo_address: Address,
        goal_amount: i128,
    ) -> u64 {
        ngo_address.require_auth();
        
        let campaign_count: u64 = env.storage()
            .instance()
            .get(&String::from_str(&env, "campaign_count"))
            .unwrap_or(0);
        
        let new_id = campaign_count + 1;
        
        let campaign = Campaign {
            id: new_id,
            name: name.clone(),
            ngo_address: ngo_address.clone(),
            goal_amount,
            raised_amount: 0,
            active: true,
        };
        
        let campaign_key = String::from_str(&env, "campaign_");
        env.storage().persistent().set(&(campaign_key, new_id), &campaign);
        env.storage().instance().set(&String::from_str(&env, "campaign_count"), &new_id);
        
        new_id
    }

    /// Make a donation to a campaign
    pub fn donate(
        env: Env,
        campaign_id: u64,
        donor: Address,
        token_address: Address,
        amount: i128,
    ) {
        donor.require_auth();
        
        let campaign_key = String::from_str(&env, "campaign_");
        let mut campaign: Campaign = env.storage()
            .persistent()
            .get(&(campaign_key.clone(), campaign_id))
            .expect("Campaign not found");
        
        if !campaign.active {
            panic!("Campaign is not active");
        }
        
        // Transfer tokens from donor to NGO
        let token = token::Client::new(&env, &token_address);
        token.transfer(&donor, &campaign.ngo_address, &amount);
        
        // Update campaign raised amount
        campaign.raised_amount += amount;
        env.storage().persistent().set(&(campaign_key, campaign_id), &campaign);
        
        // Record donation
        let donation = Donation {
            campaign_id,
            donor: donor.clone(),
            amount,
            timestamp: env.ledger().timestamp(),
        };
        
        let donation_key = String::from_str(&env, "donation_");
        let donations_count: u64 = env.storage()
            .instance()
            .get(&String::from_str(&env, "donations_count"))
            .unwrap_or(0);
        
        let new_donation_id = donations_count + 1;
        env.storage().persistent().set(&(donation_key, new_donation_id), &donation);
        env.storage().instance().set(&String::from_str(&env, "donations_count"), &new_donation_id);
    }

    /// Get campaign details
    pub fn get_campaign(env: Env, campaign_id: u64) -> Campaign {
        let campaign_key = String::from_str(&env, "campaign_");
        env.storage()
            .persistent()
            .get(&(campaign_key, campaign_id))
            .expect("Campaign not found")
    }

    /// Close a campaign
    pub fn close_campaign(env: Env, campaign_id: u64, ngo_address: Address) {
        ngo_address.require_auth();
        
        let campaign_key = String::from_str(&env, "campaign_");
        let mut campaign: Campaign = env.storage()
            .persistent()
            .get(&(campaign_key.clone(), campaign_id))
            .expect("Campaign not found");
        
        if campaign.ngo_address != ngo_address {
            panic!("Only campaign owner can close it");
        }
        
        campaign.active = false;
        env.storage().persistent().set(&(campaign_key, campaign_id), &campaign);
    }

    /// Get total campaigns count
    pub fn get_campaigns_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&String::from_str(&env, "campaign_count"))
            .unwrap_or(0)
    }

    /// Get total donations count
    pub fn get_donations_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&String::from_str(&env, "donations_count"))
            .unwrap_or(0)
    }
}

mod test;
