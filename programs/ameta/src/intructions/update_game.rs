
use anchor_spl::token::TokenAccount;
use anchor_spl::token::Mint;
use anchor_lang::prelude::*;
use crate::schema::*;
/// Create a new candy machine.
#[derive(Accounts)]
#[instruction(data: AMetaData)]
pub struct UpdateAmeta<'info> {      
    #[account(mut)]
    pub a_meta: Account<'info,AMeta>, 
    /// CHECK
    #[account(mut, signer, constraint= authority.data_is_empty() && authority.lamports() > 0)]
    pub authority: AccountInfo<'info>,
    pub a_meta_mint: Account<'info, Mint>,
    pub token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,    
}

pub fn exec(
    ctx: Context<UpdateAmeta>,
    data: AMetaData,
) -> Result<()> {
    let a_meta = &mut ctx.accounts.a_meta;
    a_meta.data = data;
    a_meta.wallet = *ctx.accounts.authority.key;
    a_meta.authority = *ctx.accounts.authority.key;
    a_meta.mint = ctx.accounts.a_meta_mint.key();
    a_meta.token_account = ctx.accounts.token_account.key();
    Ok(())
}