use anchor_spl::token::Token;
use anchor_spl::associated_token::AssociatedToken;
use crate::schema::*;
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use anchor_spl::token::TokenAccount;
use anchor_spl::{associated_token, token};
#[derive(Accounts)]
#[instruction(profit: u8)]
pub struct MakeNewFishingRodRent<'info> {
    #[account(mut)]
    pub a_meta: Box<Account<'info, AMeta>>,
    #[account(seeds = [b"rent_system".as_ref(), &a_meta.key().to_bytes(), &a_meta.wallet.to_bytes()], bump)]
    /// CHECK: Just a pure account
    pub rent_system: Account<'info, RentSystem>,
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub fishing_rod_for_rent: Account<'info, Mint>,
    #[account(mut)]
    pub fishing_rod_owner: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        space = RentContract::SIZE,
        seeds = [b"fishing_rod_rent_contract".as_ref(), &a_meta.key().to_bytes(), &authority.key().to_bytes()], 
        bump
      )]
    pub fishing_rod_rent_contract: Account<'info, RentContract>,
    
    #[account(init, payer = authority, associated_token::mint = fishing_rod_for_rent, associated_token::authority = rent_system)]
    pub pool_fishing_rod: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}


pub fn exec(ctx: Context<MakeNewFishingRodRent>, profit: u8) -> Result<()> {
    let fishing_rod_rent_contract = &mut ctx.accounts.fishing_rod_rent_contract;
    let fishing_rod_owner = &mut ctx.accounts.fishing_rod_owner;
    let fishing_rod_for_rent = &mut ctx.accounts.fishing_rod_for_rent;

    fishing_rod_rent_contract.status = "NEW".to_string();
    fishing_rod_rent_contract.owner = fishing_rod_owner.key();
    fishing_rod_rent_contract.nft_address = fishing_rod_for_rent.key();
    fishing_rod_rent_contract.profit = profit;

    let transfer_ctx = token::Transfer{
        from: fishing_rod_owner.to_account_info(),
        to: ctx.accounts.pool_fishing_rod.to_account_info(),
        authority: ctx.accounts.authority.to_account_info()
    };

    token::transfer(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_ctx),
        1,
    )?;

    Ok(())
}
