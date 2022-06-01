use crate::schema::*;
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use anchor_spl::token::TokenAccount;
use anchor_spl::token;
use anchor_spl::{associated_token};
use crate::errors::ErrorCode;
#[derive(Accounts)]
pub struct RentFishingRod<'info> {
    #[account(mut)]
    pub a_meta: Account<'info, AMeta>,
    #[account(mut)]
    pub renter: Signer<'info>,
    #[account(mut)]
    pub fishing_rod_rent_contract: Account<'info, RentContract>,
    #[account(mut)]    
    pub fishing_rod_for_rent: Account<'info, Mint>,
    #[account(
        init, 
        payer = renter, 
        associated_token::mint = fishing_rod_for_rent,
        associated_token::authority = renter)]
    pub vault: Account<'info, TokenAccount>,
      // System Program Address
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec(
    ctx: Context<RentFishingRod>
) -> Result<()>{
    let fishing_rod_rent_contract = &mut ctx.accounts.fishing_rod_rent_contract;
    let fishing_rod_for_rent = &mut ctx.accounts.fishing_rod_for_rent;
    let renter = &mut ctx.accounts.renter;

    if fishing_rod_rent_contract.nft_address != fishing_rod_for_rent.key() {
        return err!(ErrorCode::InvalidFishingRod);
    }

    if fishing_rod_rent_contract.status == "NEW".to_string() {
        return err!(ErrorCode::RentContractNotAvailable);
    }

    fishing_rod_rent_contract.renter = renter.key();
    fishing_rod_rent_contract.status = "RENTED".to_string();

    // let transfer_ctx = token::Transfer{
    //     from
    // }

    Ok(())
}
