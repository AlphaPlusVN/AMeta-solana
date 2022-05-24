
use anchor_lang::prelude::*;
#[account]
#[derive(Default)]
pub struct AMeta {
    pub authority: Pubkey,
    pub wallet: Pubkey,
    pub data: AMetaData
}
/// Candy machine settings data.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, PartialEq)]
pub struct AMetaData {    
    pub price: u64,    
    pub symbol: String,    
}

pub static PREFIX: &str = "a_meta";