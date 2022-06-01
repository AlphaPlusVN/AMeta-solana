
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
    
    pub system_program: Program<'info, System>,    
}

pub fn exec(
    ctx: Context<UpdateAmeta>,
    data: AMetaData,
) -> Result<()> {
    let outer_space = &mut ctx.accounts.a_meta;
    outer_space.data = data;
    outer_space.wallet = *ctx.accounts.authority.key;
    outer_space.authority = *ctx.accounts.authority.key;
    Ok(())
}