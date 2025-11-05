#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, DonationContract);
    let client = DonationContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    assert_eq!(client.get_campaigns_count(), 0);
    assert_eq!(client.get_donations_count(), 0);
}

#[test]
fn test_create_campaign() {
    let env = Env::default();
    let contract_id = env.register_contract(None, DonationContract);
    let client = DonationContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let ngo = Address::generate(&env);

    client.initialize(&admin);

    let title = String::from_str(&env, "Clean Water Project");
    let description = String::from_str(&env, "Providing clean water to communities");
    let target = 100_000_0000000i128; // 100,000 stroops

    let campaign_id = client.create_campaign(&ngo, &title, &description, &target);

    assert_eq!(campaign_id, 1);
    assert_eq!(client.get_campaigns_count(), 1);

    let campaign = client.get_campaign(&campaign_id);
    assert_eq!(campaign.id, 1);
    assert_eq!(campaign.target_amount, target);
    assert_eq!(campaign.raised_amount, 0);
    assert_eq!(campaign.is_active, true);
}

#[test]
fn test_donate() {
    let env = Env::default();
    let contract_id = env.register_contract(None, DonationContract);
    let client = DonationContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let ngo = Address::generate(&env);
    let donor = Address::generate(&env);
    let token = Address::generate(&env);

    client.initialize(&admin);

    let title = String::from_str(&env, "Education Fund");
    let description = String::from_str(&env, "Supporting education");
    let target = 50_000_0000000i128;

    let campaign_id = client.create_campaign(&ngo, &title, &description, &target);

    let donation_amount = 1_000_0000000i128;
    let message = String::from_str(&env, "Keep up the good work!");

    let donation_id = client.donate(&campaign_id, &donor, &donation_amount, &token, &message);

    assert_eq!(donation_id, 1);
    assert_eq!(client.get_donations_count(), 1);

    let campaign = client.get_campaign(&campaign_id);
    assert_eq!(campaign.raised_amount, donation_amount);

    let donation = client.get_donation(&donation_id);
    assert_eq!(donation.amount, donation_amount);
    assert_eq!(donation.campaign_id, campaign_id);
}

#[test]
fn test_multisig_disbursement() {
    let env = Env::default();
    let contract_id = env.register_contract(None, DonationContract);
    let client = DonationContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let ngo = Address::generate(&env);
    let donor = Address::generate(&env);
    let recipient = Address::generate(&env);
    let approver1 = Address::generate(&env);
    let approver2 = Address::generate(&env);
    let token = Address::generate(&env);

    client.initialize(&admin);
    client.set_multisig_requirement(&admin, &2);

    let title = String::from_str(&env, "Relief Fund");
    let description = String::from_str(&env, "Disaster relief");
    let target = 100_000_0000000i128;

    let campaign_id = client.create_campaign(&ngo, &title, &description, &target);

    // Make donation
    let donation_amount = 10_000_0000000i128;
    let message = String::from_str(&env, "Help those in need");
    client.donate(&campaign_id, &donor, &donation_amount, &token, &message);

    // Propose disbursement
    let disbursement_amount = 5_000_0000000i128;
    let disbursement_desc = String::from_str(&env, "Medical supplies");
    let disbursement_id = client.propose_disbursement(
        &campaign_id,
        &recipient,
        &disbursement_amount,
        &disbursement_desc,
        &approver1,
    );

    assert_eq!(disbursement_id, 1);

    // Second approval
    client.approve_disbursement(&disbursement_id, &approver2);

    // Execute disbursement
    client.execute_disbursement(&disbursement_id);

    let disbursement = client.get_disbursement(&disbursement_id);
    assert_eq!(disbursement.executed, true);
    assert_eq!(disbursement.approved_by.len(), 2);

    let campaign = client.get_campaign(&campaign_id);
    assert_eq!(campaign.raised_amount, donation_amount - disbursement_amount);
    assert_eq!(campaign.recipient_count, 1);
}

#[test]
fn test_close_campaign() {
    let env = Env::default();
    let contract_id = env.register_contract(None, DonationContract);
    let client = DonationContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let ngo = Address::generate(&env);

    client.initialize(&admin);

    let title = String::from_str(&env, "Test Campaign");
    let description = String::from_str(&env, "Test");
    let target = 10_000_0000000i128;

    let campaign_id = client.create_campaign(&ngo, &title, &description, &target);

    client.close_campaign(&campaign_id, &ngo);

    let campaign = client.get_campaign(&campaign_id);
    assert_eq!(campaign.is_active, false);
}
