// use crate::errors::ErrorCode;
use crate::schema::*;
use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token};
#[derive(Accounts)]
#[instruction(user_name: String)]
pub struct InitializeStarterAccount<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    // AMeta accounts
    #[account(mut)]
    pub a_meta: Account<'info, AMeta>,
    #[account(
        init,
        payer = authority,
        space = StarterAccount::SIZE,
        // seeds = [b"starter_account".as_ref(), &a_meta.key().to_bytes(), &authority.key().to_bytes()], 
        // bump
      )]
    pub starter_account: Account<'info, StarterAccount>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec(
    ctx: Context<InitializeStarterAccount>,
    user_name: String,    
) -> Result<()> {
    let starter_account = &mut ctx.accounts.starter_account;
    let now = Clock::get().unwrap().unix_timestamp;
    starter_account.amount = 0;
    starter_account.user_name = user_name;
    starter_account.created_date = now;
    Ok(())
}
