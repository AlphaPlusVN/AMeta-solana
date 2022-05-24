use anchor_lang::prelude::*;
#[account]
#[derive(Default)]
pub struct StarterAccount {
    pub user_name: String,
    pub amount: u64,
    pub wallet: Pubkey,
    pub created_date: i64,
}

impl StarterAccount{
    pub const SIZE: usize = 8 + 32 + 8 + 32 + 8;
}
