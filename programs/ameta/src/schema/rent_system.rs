use anchor_lang::prelude::*;
#[account]
#[derive(Default)]
pub struct RentSystem{
    pub rent_system_token_account: Pubkey,
}

impl RentSystem{
    pub const SIZE: usize = 8 + 32;
}