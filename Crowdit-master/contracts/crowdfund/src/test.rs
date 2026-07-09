extern crate std;

use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::{Address, Env, String};

use crate::{ContractError, CrowdfundContract, CrowdfundContractClient};
use reward_token::{RewardToken, RewardTokenClient};

fn create_campaign_fixture(
    env: &Env,
    client: &CrowdfundContractClient<'_>,
    creator: &Address,
    goal: i128,
    deadline: u64,
) -> u32 {
    client.create_campaign(
        creator,
        &String::from_str(env, "Crowdit Live Session"),
        &String::from_str(env, "Studio and release funding"),
        &goal,
        &deadline,
    )
}

#[test]
fn creates_and_reads_campaign() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().with_mut(|ledger| {
        ledger.timestamp = 100;
    });

    let creator = Address::generate(&env);
    let contract_id = env.register(CrowdfundContract, ());
    let client = CrowdfundContractClient::new(&env, &contract_id);

    let campaign_id = create_campaign_fixture(&env, &client, &creator, 500, 1_000);
    let campaign = client.get_campaign(&campaign_id);

    assert_eq!(campaign.id, 1);
    assert_eq!(campaign.creator, creator);
    assert_eq!(campaign.goal, 500);
    assert_eq!(campaign.raised, 0);
    assert_eq!(client.get_campaign_count(), 1);
}

#[test]
fn tracks_backers_and_total_raised() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().with_mut(|ledger| {
        ledger.timestamp = 100;
    });

    let creator = Address::generate(&env);
    let backer_one = Address::generate(&env);
    let backer_two = Address::generate(&env);
    let contract_id = env.register(CrowdfundContract, ());
    let client = CrowdfundContractClient::new(&env, &contract_id);

    let campaign_id = create_campaign_fixture(&env, &client, &creator, 1_000, 1_500);
    client.back_campaign(&campaign_id, &backer_one, &150);
    client.back_campaign(&campaign_id, &backer_two, &200);
    client.back_campaign(&campaign_id, &backer_one, &50);

    assert_eq!(client.get_total_raised(&campaign_id), 400);
    assert_eq!(client.get_backers_count(&campaign_id), 2);
}

#[test]
fn mints_reward_tokens_when_configured() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().with_mut(|ledger| {
        ledger.timestamp = 100;
    });

    let admin = Address::generate(&env);
    let creator = Address::generate(&env);
    let backer = Address::generate(&env);
    let crowdfund_id = env.register(CrowdfundContract, ());
    let reward_token_id = env.register(RewardToken, ());
    let crowdfund_client = CrowdfundContractClient::new(&env, &crowdfund_id);
    let reward_token_client = RewardTokenClient::new(&env, &reward_token_id);

    reward_token_client.initialize(
        &crowdfund_id.clone().into(),
        &String::from_str(&env, "Crowdit Reward"),
        &String::from_str(&env, "CRD"),
        &7,
    );
    crowdfund_client.initialize_admin(&admin);
    crowdfund_client.set_reward_token(&admin, &reward_token_id.clone().into());

    let campaign_id = create_campaign_fixture(&env, &crowdfund_client, &creator, 1_000, 1_500);
    crowdfund_client.back_campaign(&campaign_id, &backer, &20_000_000);

    assert_eq!(reward_token_client.balance(&backer), 200_000_000);
    assert_eq!(reward_token_client.total_supply(), 200_000_000);
}

#[test]
fn refunds_failed_campaigns_after_deadline() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().with_mut(|ledger| {
        ledger.timestamp = 100;
    });

    let creator = Address::generate(&env);
    let backer = Address::generate(&env);
    let contract_id = env.register(CrowdfundContract, ());
    let client = CrowdfundContractClient::new(&env, &contract_id);

    let campaign_id = create_campaign_fixture(&env, &client, &creator, 1_000, 150);
    client.back_campaign(&campaign_id, &backer, &250);

    env.ledger().with_mut(|ledger| {
        ledger.timestamp = 200;
    });

    let refunded = client.refund(&campaign_id, &backer);
    assert_eq!(refunded, 250);
    assert_eq!(client.get_total_raised(&campaign_id), 0);
    assert_eq!(client.get_backers_count(&campaign_id), 0);
}

#[test]
fn returns_backer_snapshots_for_active_contributions() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().with_mut(|ledger| {
        ledger.timestamp = 100;
    });

    let creator = Address::generate(&env);
    let backer = Address::generate(&env);
    let contract_id = env.register(CrowdfundContract, ());
    let client = CrowdfundContractClient::new(&env, &contract_id);

    let campaign_id = create_campaign_fixture(&env, &client, &creator, 1_000, 1_500);
    client.back_campaign(&campaign_id, &backer, &125);

    let backers = client.get_backers(&campaign_id);
    let snapshot = backers.get(0).unwrap();

    assert_eq!(backers.len(), 1);
    assert_eq!(snapshot.backer, backer);
    assert_eq!(snapshot.amount, 125);
    assert_eq!(snapshot.timestamp, 100);
}

#[test]
fn prevents_claim_before_goal_or_deadline() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().with_mut(|ledger| {
        ledger.timestamp = 100;
    });

    let creator = Address::generate(&env);
    let contract_id = env.register(CrowdfundContract, ());
    let client = CrowdfundContractClient::new(&env, &contract_id);

    let campaign_id = create_campaign_fixture(&env, &client, &creator, 1_000, 500);
    let result = client.try_claim_funds(&campaign_id, &creator);

    assert_eq!(result, Err(Ok(ContractError::DeadlineNotReached)));
}
