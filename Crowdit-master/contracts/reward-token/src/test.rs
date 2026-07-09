extern crate std;

use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env, String};

use crate::{RewardToken, RewardTokenClient};

#[test]
fn initializes_and_mints_rewards() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let recipient = Address::generate(&env);
    let contract_id = env.register(RewardToken, ());
    let client = RewardTokenClient::new(&env, &contract_id);

    client.initialize(
        &admin,
        &String::from_str(&env, "Crowdit Reward"),
        &String::from_str(&env, "CRD"),
        &7,
    );
    client.mint(&recipient, &1_000);

    assert_eq!(client.balance(&recipient), 1_000);
    assert_eq!(client.total_supply(), 1_000);
    assert_eq!(client.admin(), admin);
}
