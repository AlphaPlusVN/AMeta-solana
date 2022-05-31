use crate::schema::*;
use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token};
#[derive(Accounts)]
pub struct InitializeRentSystem<'info> {
  #[account(mut)]
  pub a_meta: Account<'info, AMeta>,
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(
        init,
        payer = authority,
        space = RentSystem::SIZE,
        seeds = [b"rent_system".as_ref(), &a_meta.key().to_bytes(), &authority.key().to_bytes()], 
        bump
      )]
  pub rent_system: Account<'info, RentSystem>,

  pub mint: Box<Account<'info, token::Mint>>,
  #[account(
    init,
    payer = authority,
    associated_token::mint = mint,
    associated_token::authority = rent_system
  )]
  pub rent_system_token_account: Account<'info, token::TokenAccount>,
  /// CHECK: This is not dangerous because we don't read or write from this account
  #[account(mut)]
  pub owner_token_account: UncheckedAccount<'info>,
  // System Program Address
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, token::Token>,
  pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
  pub rent: Sysvar<'info, Rent>,
}

pub fn exec(ctx: Context<InitializeRentSystem>) -> Result<()> {
  let rent_system = &mut ctx.accounts.rent_system;
  rent_system.rent_system_token_account = ctx.accounts.rent_system_token_account.key();
  
  let transfer_ctx = token::Transfer {
    from: ctx.accounts.owner_token_account.to_account_info(),
    to: ctx.accounts.rent_system_token_account.to_account_info(),
    authority: ctx.accounts.authority.to_account_info(),
  };
  token::transfer(
    CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_ctx),
    1000000000000,
  )?;
  Ok(())
}
