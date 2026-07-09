#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, Address, Env, String, Symbol, Vec
};
use reward_token::RewardTokenClient;

#[contract]
pub struct CrowdfundContract;

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Campaign {
    pub id: u32,
    pub creator: Address,
    pub title: String,
    pub description: String,
    pub goal: i128,
    pub raised: i128,
    pub deadline: u64,
    pub claimed: bool,
}

#[derive(Clone)]
#[contracttype]
pub struct Contribution {
    pub backer: Address,
    pub amount: i128,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct BackerSnapshot {
    pub backer: Address,
    pub amount: i128,
    pub timestamp: u64,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    CampaignCount,
    Admin,
    RewardToken,
    Campaign(u32),
    TotalRaised(u32),
    Backers(u32),
    Contribution(u32, Address),
    ContributionTimestamp(u32, Address),
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
#[contracterror]
pub enum ContractError {
    InvalidGoal = 1,
    InvalidDeadline = 2,
    CampaignNotFound = 3,
    CampaignEnded = 4,
    InvalidAmount = 5,
    GoalNotMet = 6,
    DeadlineNotReached = 7,
    NotCreator = 8,
    AlreadyClaimed = 9,
    GoalMet = 10,
    NoContribution = 11,
    NotAdmin = 12,
}

const STROOPS_PER_XLM: i128 = 10_000_000;
const REWARD_RATIO: i128 = 10;

fn campaign_count(env: &Env) -> u32 {
    env.storage()
        .persistent()
        .get(&DataKey::CampaignCount)
        .unwrap_or(0)
}

fn write_campaign_count(env: &Env, count: u32) {
    env.storage()
        .persistent()
        .set(&DataKey::CampaignCount, &count);
}

fn require_future_deadline(env: &Env, deadline: u64) -> Result<(), ContractError> {
    let current = env.ledger().timestamp();
    if deadline <= current {
        return Err(ContractError::InvalidDeadline);
    }
    Ok(())
}

fn get_campaign_or_error(env: &Env, campaign_id: u32) -> Result<Campaign, ContractError> {
    env.storage()
        .persistent()
        .get(&DataKey::Campaign(campaign_id))
        .ok_or(ContractError::CampaignNotFound)
}

fn write_campaign(env: &Env, campaign: &Campaign) {
    env.storage()
        .persistent()
        .set(&DataKey::Campaign(campaign.id), campaign);
}

fn get_total_raised_internal(env: &Env, campaign_id: u32) -> i128 {
    env.storage()
        .persistent()
        .get(&DataKey::TotalRaised(campaign_id))
        .unwrap_or(0)
}

fn set_total_raised(env: &Env, campaign_id: u32, amount: i128) {
    env.storage()
        .persistent()
        .set(&DataKey::TotalRaised(campaign_id), &amount);
}

fn get_backers_internal(env: &Env, campaign_id: u32) -> Vec<Address> {
    env.storage()
        .persistent()
        .get(&DataKey::Backers(campaign_id))
        .unwrap_or(Vec::new(env))
}

fn set_backers(env: &Env, campaign_id: u32, backers: &Vec<Address>) {
    env.storage()
        .persistent()
        .set(&DataKey::Backers(campaign_id), backers);
}

fn has_deadline_passed(env: &Env, deadline: u64) -> bool {
    env.ledger().timestamp() >= deadline
}

fn get_contribution_amount(env: &Env, campaign_id: u32, backer: &Address) -> i128 {
    env.storage()
        .persistent()
        .get(&DataKey::Contribution(campaign_id, backer.clone()))
        .unwrap_or(0)
}

fn set_contribution_amount(env: &Env, campaign_id: u32, backer: &Address, amount: i128) {
    env.storage()
        .persistent()
        .set(&DataKey::Contribution(campaign_id, backer.clone()), &amount);
}

fn get_contribution_timestamp(env: &Env, campaign_id: u32, backer: &Address) -> u64 {
    env.storage()
        .persistent()
        .get(&DataKey::ContributionTimestamp(campaign_id, backer.clone()))
        .unwrap_or(0)
}

fn set_contribution_timestamp(env: &Env, campaign_id: u32, backer: &Address, timestamp: u64) {
    env.storage().persistent().set(
        &DataKey::ContributionTimestamp(campaign_id, backer.clone()),
        &timestamp,
    );
}

#[contractimpl]
impl CrowdfundContract {
    pub fn initialize_admin(env: Env, admin: Address) {
        admin.require_auth();

        if let Some(existing_admin) = env.storage().instance().get::<_, Address>(&DataKey::Admin) {
            if existing_admin != admin {
                panic!("admin already configured");
            }
            return;
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn set_reward_token(
        env: Env,
        admin: Address,
        reward_token_id: Address,
    ) -> Result<(), ContractError> {
        admin.require_auth();

        let configured_admin = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::Admin)
            .unwrap_or_else(|| {
                env.storage().instance().set(&DataKey::Admin, &admin);
                admin.clone()
            });

        if configured_admin != admin {
            return Err(ContractError::NotAdmin);
        }

        env.storage()
            .instance()
            .set(&DataKey::RewardToken, &reward_token_id);
        env.events().publish(
            (Symbol::new(&env, "reward_token_set"),),
            reward_token_id,
        );

        Ok(())
    }

    pub fn get_reward_token(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::RewardToken)
    }

    pub fn get_campaign_count(env: Env) -> u32 {
        campaign_count(&env)
    }

    pub fn create_campaign(
        env: Env,
        creator: Address,
        title: String,
        description: String,
        goal: i128,
        deadline: u64,
    ) -> Result<u32, ContractError> {
        creator.require_auth();

        if goal <= 0 {
            return Err(ContractError::InvalidGoal);
        }

        require_future_deadline(&env, deadline)?;

        let next_id = campaign_count(&env) + 1;
        let campaign = Campaign {
            id: next_id,
            creator,
            title,
            description,
            goal,
            raised: 0,
            deadline,
            claimed: false,
        };

        write_campaign(&env, &campaign);
        write_campaign_count(&env, next_id);
        set_total_raised(&env, next_id, 0);
        set_backers(&env, next_id, &Vec::new(&env));
        env.events().publish(
            (Symbol::new(&env, "campaign_created"), next_id),
            campaign.clone(),
        );

        Ok(next_id)
    }

    pub fn back_campaign(
        env: Env,
        campaign_id: u32,
        backer: Address,
        amount: i128,
    ) -> Result<(), ContractError> {
        backer.require_auth();

        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }

        let mut campaign = get_campaign_or_error(&env, campaign_id)?;
        if has_deadline_passed(&env, campaign.deadline) {
            return Err(ContractError::CampaignEnded);
        }

        let existing = get_contribution_amount(&env, campaign_id, &backer);
        set_contribution_amount(&env, campaign_id, &backer, existing + amount);
        set_contribution_timestamp(&env, campaign_id, &backer, env.ledger().timestamp());

        let mut backers = get_backers_internal(&env, campaign_id);
        if existing == 0 {
            backers.push_back(backer.clone());
            set_backers(&env, campaign_id, &backers);
        }

        let next_total = get_total_raised_internal(&env, campaign_id) + amount;
        set_total_raised(&env, campaign_id, next_total);
        campaign.raised = next_total;
        write_campaign(&env, &campaign);

        if let Some(reward_token_id) = env.storage().instance().get::<_, Address>(&DataKey::RewardToken) {
            let reward_amount = (amount / STROOPS_PER_XLM) * REWARD_RATIO * STROOPS_PER_XLM;

            if reward_amount > 0 {
                let reward_token = RewardTokenClient::new(&env, &reward_token_id);
                reward_token.mint(&backer.clone(), &reward_amount);
            }
        }

        env.events().publish(
            (Symbol::new(&env, "campaign_backed"), campaign_id),
            Contribution { backer, amount },
        );

        Ok(())
    }

    pub fn get_campaign(env: Env, campaign_id: u32) -> Result<Campaign, ContractError> {
        get_campaign_or_error(&env, campaign_id)
    }

    pub fn get_total_raised(env: Env, campaign_id: u32) -> Result<i128, ContractError> {
        let _ = get_campaign_or_error(&env, campaign_id)?;
        Ok(get_total_raised_internal(&env, campaign_id))
    }

    pub fn get_backers_count(env: Env, campaign_id: u32) -> Result<u32, ContractError> {
        let _ = get_campaign_or_error(&env, campaign_id)?;
        let backers = get_backers_internal(&env, campaign_id);
        let mut active_backers = 0_u32;

        for backer in backers.iter() {
            if get_contribution_amount(&env, campaign_id, &backer) > 0 {
                active_backers += 1;
            }
        }

        Ok(active_backers)
    }

    pub fn get_backers(env: Env, campaign_id: u32) -> Result<Vec<BackerSnapshot>, ContractError> {
        let _ = get_campaign_or_error(&env, campaign_id)?;
        let backers = get_backers_internal(&env, campaign_id);
        let mut snapshots = Vec::new(&env);

        for backer in backers.iter() {
            let amount = get_contribution_amount(&env, campaign_id, &backer);

            if amount <= 0 {
                continue;
            }

            snapshots.push_back(BackerSnapshot {
                backer: backer.clone(),
                amount,
                timestamp: get_contribution_timestamp(&env, campaign_id, &backer),
            });
        }

        Ok(snapshots)
    }

    pub fn claim_funds(
        env: Env,
        campaign_id: u32,
        creator: Address,
    ) -> Result<(), ContractError> {
        creator.require_auth();

        let mut campaign = get_campaign_or_error(&env, campaign_id)?;
        if campaign.creator != creator {
            return Err(ContractError::NotCreator);
        }
        if !has_deadline_passed(&env, campaign.deadline) {
            return Err(ContractError::DeadlineNotReached);
        }
        if campaign.raised < campaign.goal {
            return Err(ContractError::GoalNotMet);
        }
        if campaign.claimed {
            return Err(ContractError::AlreadyClaimed);
        }

        campaign.claimed = true;
        write_campaign(&env, &campaign);
        env.events()
            .publish((Symbol::new(&env, "funds_claimed"), campaign_id), creator);
        Ok(())
    }

    pub fn refund(env: Env, campaign_id: u32, backer: Address) -> Result<i128, ContractError> {
        backer.require_auth();

        let campaign = get_campaign_or_error(&env, campaign_id)?;
        if !has_deadline_passed(&env, campaign.deadline) {
            return Err(ContractError::DeadlineNotReached);
        }
        if campaign.raised >= campaign.goal {
            return Err(ContractError::GoalMet);
        }

        let contribution = get_contribution_amount(&env, campaign_id, &backer);
        if contribution <= 0 {
            return Err(ContractError::NoContribution);
        }

        set_contribution_amount(&env, campaign_id, &backer, 0);
        set_contribution_timestamp(&env, campaign_id, &backer, 0);

        let next_total = get_total_raised_internal(&env, campaign_id) - contribution;
        set_total_raised(&env, campaign_id, next_total);

        let mut updated_campaign = campaign;
        updated_campaign.raised = next_total;
        write_campaign(&env, &updated_campaign);

        env.events().publish(
            (Symbol::new(&env, "refund_processed"), campaign_id),
            Contribution {
                backer,
                amount: contribution,
            },
        );

        Ok(contribution)
    }
}

#[cfg(test)]
mod test;
