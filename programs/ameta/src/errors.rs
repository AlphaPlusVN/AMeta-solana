use anchor_lang::prelude::*;
#[error_code]
pub enum ErrorCode {
  #[msg("Not Owner NFT")]
  NotOwnerNFT,
  #[msg("Invalid box code")]
  InvalidBoxCode,
  #[msg("Invalid fishing rod")]
  InvalidFishingRod,
  #[msg("Rent Contract not available")]
  RentContractNotAvailable,
  #[msg("Invalid token account")]
  InvalidTokenAccount,
  
  #[msg("Not enough ameta token")]
  NotEnoughToken,
  
}