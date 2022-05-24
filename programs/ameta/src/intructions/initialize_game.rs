
use anchor_lang::prelude::*;
use crate::schema::*;
/// Create a new candy machine.
#[derive(Accounts)]
#[instruction(data: AMetaData)]
pub struct InitializeAMeta<'info> {      
    #[account(
        init, 
        seeds=[PREFIX.as_bytes()],
        payer = authority,
        bump,
        space =
        8  +  // < discriminator
              // \/ candy_machine
        8  + 8 + 8 + (38 * 1 /* multiply by n of creators */) + 4 + 2 + 8 +
        32 +  // < wallet
        32 +  // < authority
        32   // start date
        
    )]
    pub a_meta: Account<'info,AMeta>, 
    /// CHECK
    #[account(mut, signer, constraint= authority.data_is_empty() && authority.lamports() > 0)]
    pub authority: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,    
}

pub fn exec(
    ctx: Context<InitializeAMeta>,
    data: AMetaData,
) -> Result<()> {
    let outer_space = &mut ctx.accounts.a_meta;
    outer_space.data = data;
    outer_space.wallet = *ctx.accounts.authority.key;
    outer_space.authority = *ctx.accounts.authority.key;
    Ok(())
}