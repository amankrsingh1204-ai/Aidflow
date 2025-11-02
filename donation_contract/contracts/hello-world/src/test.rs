#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_create_campaign() {
    let env = Env::default();
    let contract_id = env.register(DonationContract, ());
    let client = DonationContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let ngo = Address::generate(&env);

    // Initialize contract
    client.initialize(&admin);

    // Create campaign
    let campaign_id = client.create_campaign(
        &String::from_str(&env, "Save the Children"),
        &ngo,
        &1000000,
    );

    assert_eq!(campaign_id, 1);

    // Get campaign details
    let campaign = client.get_campaign(&campaign_id);
    assert_eq!(campaign.id, 1);
    assert_eq!(campaign.goal_amount, 1000000);
    assert_eq!(campaign.raised_amount, 0);
    assert_eq!(campaign.active, true);
}

#[test]
fn test_campaigns_count() {
    let env = Env::default();
    let contract_id = env.register(DonationContract, ());
    let client = DonationContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let ngo = Address::generate(&env);

    client.initialize(&admin);

    assert_eq!(client.get_campaigns_count(), 0);

    client.create_campaign(&String::from_str(&env, "Campaign 1"), &ngo, &1000000);
    assert_eq!(client.get_campaigns_count(), 1);

    client.create_campaign(&String::from_str(&env, "Campaign 2"), &ngo, &2000000);
    assert_eq!(client.get_campaigns_count(), 2);
}
