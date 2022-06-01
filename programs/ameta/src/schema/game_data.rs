use anchor_lang::prelude::*;
#[account]
#[derive(Default)]
pub struct AMeta {
    pub authority: Pubkey,
    pub wallet: Pubkey,
    pub data: AMetaData,
    pub token_account: Pubkey,
    pub mint: Pubkey,
}

impl AMeta {
    pub const SIZE: usize = 8 + 32 + 32 + (64 + 8) + 32 + 32;
}

/// Candy machine settings data.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, PartialEq)]
pub struct AMetaData {
    pub price: u64,
    pub symbol: String,
}

pub static PREFIX: &str = "a_meta";
