use anchor_lang::prelude::*;
#[account]
#[derive(Default)]
pub struct RentContract{
    pub owner: Pubkey,
    pub nft_address: Pubkey,
    pub status: String,
    pub profit: u8,
    pub renter: Pubkey,
}

impl RentContract{
    pub const SIZE: usize = 8 + 32 + 32 + 8 + 8 + 32;
}