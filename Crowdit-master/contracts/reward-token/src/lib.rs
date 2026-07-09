#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol};

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub decimals: u32,
}

#[derive(Clone)]
#[contracttype]
enum DataKey {
    Admin,
    Metadata,
    TotalSupply,
    Balance(Address),
}

#[contract]
pub struct RewardToken;

#[contractimpl]
impl RewardToken {
    pub fn initialize(env: Env, admin: Address, name: String, symbol: String, decimals: u32) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(
            &DataKey::Metadata,
            &TokenMetadata {
                name,
                symbol,
                decimals,
            },
        );
        env.storage().instance().set(&DataKey::TotalSupply, &0_i128);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("admin not configured"));
        admin.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let balance_key = DataKey::Balance(to.clone());
        let current_balance: i128 = env.storage().persistent().get(&balance_key).unwrap_or(0);
        let new_balance = current_balance + amount;
        env.storage().persistent().set(&balance_key, &new_balance);

        let total_supply = Self::total_supply(env.clone()) + amount;
        env.storage().instance().set(&DataKey::TotalSupply, &total_supply);
        env.events()
            .publish((Symbol::new(&env, "reward_minted"), to), amount);
    }

    pub fn balance(env: Env, account: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(account))
            .unwrap_or(0)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0)
    }

    pub fn metadata(env: Env) -> TokenMetadata {
        env.storage()
            .instance()
            .get(&DataKey::Metadata)
            .unwrap_or_else(|| panic!("metadata not configured"))
    }

    pub fn admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("admin not configured"))
    }
}

#[cfg(test)]
mod test;
