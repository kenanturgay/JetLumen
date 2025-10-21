#![no_std]
use soroban_sdk::{contractimpl, symbol, Address, Env};

pub struct JetLumen;

const KEY_TOTAL: &str = "total";
const KEY_LAST: &str = "last";

#[contractimpl]
impl JetLumen {
    pub fn record_transfer(env: Env, sender: Address, recipient: Address, amount: i128) {
        let mut total: i128 = match env.storage().persistent().get(&symbol!(KEY_TOTAL)) {
            Some(v) => v,
            None => 0,
        };
        total += amount;
        env.storage().persistent().set(&symbol!(KEY_TOTAL), &total);
        env.storage().persistent().set(&symbol!(KEY_LAST), &recipient);
    }

    pub fn get_total_transferred(env: Env) -> i128 {
        match env.storage().persistent().get(&symbol!(KEY_TOTAL)) {
            Some(v) => v,
            None => 0,
        }
    }

    pub fn get_last_recipient(env: Env) -> Address {
        match env.storage().persistent().get(&symbol!(KEY_LAST)) {
            Some(v) => v,
            None => Address::from_contract_id(&env, &env.current_contract()),
        }
    }
}
