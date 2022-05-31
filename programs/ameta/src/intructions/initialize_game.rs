
use anchor_lang::prelude::*;
use crate::schema::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token;
use anchor_spl::token::Mint;
use anchor_spl::token::Token;
use anchor_spl::token::TokenAccount;
/// Create a new candy machine.
#[derive(Accounts)]
#[instruction(data: AMetaData)]
pub struct InitializeAMeta<'info> {      
    #[account(
        init, 
        seeds=[PREFIX.as_bytes()],
        payer = authority,
        bump,
        space = AMeta::SIZE
        
    )]
    pub a_meta: Account<'info,AMeta>, 
    #[account(init, payer = authority, mint::decimals = 9, mint::authority = authority, mint::freeze_authority = authority)]
    pub a_meta_mint: Account<'info, Mint>,
    /// CHECK
    #[account(mut, signer, constraint= authority.data_is_empty() && authority.lamports() > 0)]
    pub authority: AccountInfo<'info>,

    #[account(init, payer = authority, associated_token::mint = a_meta_mint, associated_token::authority = authority)]
    pub token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,    
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec(
    ctx: Context<InitializeAMeta>,
    data: AMetaData,
) -> Result<()> {
    let outer_space = &mut ctx.accounts.a_meta;
    outer_space.data = data;
    outer_space.wallet = *ctx.accounts.authority.key;
    outer_space.authority = *ctx.accounts.authority.key;
    outer_space.mint = ctx.accounts.a_meta_mint.key();
    outer_space.token_account = ctx.accounts.token_account.key();

    let mint_to_ctx = token::MintTo {
        mint: ctx.accounts.a_meta_mint.to_account_info(),
        to: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };
    token::mint_to(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), mint_to_ctx),
        10000000000000,
    )?;

    Ok(())
}