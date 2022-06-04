use crate::errors::ErrorCode;
use crate::schema::*;
use crate::utils::create_nft;
use crate::CreateNftParams;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token;
use anchor_spl::token::Mint;
use anchor_spl::token::Token;
use anchor_spl::token::TokenAccount;
use mpl_token_metadata::instruction::create_metadata_accounts_v2;
use solana_program::program::invoke_signed;
#[derive(Accounts)]
#[instruction(creator_bump: u8, fishing_rod_uri: String, fishing_rod_name: String)]
pub struct OpenBox<'info> {
    // AMeta accounts
    #[account(mut)]
    pub a_meta: Account<'info, AMeta>,
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub box_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub box_token_account: Account<'info, TokenAccount>,
    #[account(init, payer = user, mint::decimals = 0, mint::authority = user, mint::freeze_authority = user)]
    pub mint: Account<'info, Mint>,
    
    #[account(init, payer = user, associated_token::mint = mint, associated_token::authority = user)]
    pub vault: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    metadata: UncheckedAccount<'info>,
    /// CHECK: account checked in CPI
    #[account(address = mpl_token_metadata::id())]
    token_metadata_program: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn exec(
    ctx: Context<OpenBox>,
    creator_bump: u8,
    fishing_rod_uri: String,
    fishing_rod_name: String,
) -> Result<()> {
    let user = &ctx.accounts.user;
    let box_mint = &ctx.accounts.box_mint;
    let box_token_account = &ctx.accounts.box_token_account;
    // Check the owner of token account
    if box_token_account.owner != user.key() {
        return err!(ErrorCode::NotOwnerNFT);
    }
    //Check Box on the token account
    if box_token_account.mint != box_mint.key() {
        return err!(ErrorCode::NotOwnerNFT);
    }

    //Check amount of token account
    if box_token_account.amount != 1 {
        return err!(ErrorCode::NotOwnerNFT);
    }

    let burn_ctx = token::Burn {
        mint: ctx.accounts.box_mint.to_account_info(),
        from: ctx.accounts.box_token_account.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    token::burn(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), burn_ctx),
        1,
    )?;
    let symbol = "F_ROD".to_string();

    create_nft(CreateNftParams{
        payer: user.clone(),
        metadata: ctx.accounts.metadata.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        mint_authority: ctx.accounts.user.clone(),
        vault: ctx.accounts.vault.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
        token_metadata_program:  ctx.accounts.token_metadata_program.to_account_info(),
        rent:ctx.accounts.rent.clone(),
        system_program: ctx.accounts.system_program.clone(),
        creator_bump: creator_bump,
        name: fishing_rod_name,
        symbol: symbol,
        uri: fishing_rod_uri,
    })?;
    Ok(())
}
