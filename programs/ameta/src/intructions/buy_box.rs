use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::TokenAccount;
use anchor_spl::token::Mint;
use mpl_token_metadata::instruction::create_metadata_accounts_v2;
use solana_program::program::invoke_signed;
use anchor_spl::token::Token;
use anchor_spl::token;
use anchor_lang::prelude::*;

use crate::schema::*;


#[derive(Accounts)]
#[instruction(creator_bump: u8, name: String, symbol: String, uri: String)]
pub struct BuyBox<'info> {
    #[account(mut)]
    a_meta: Account<'info, AMeta>,
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    metadata: UncheckedAccount<'info>,
    #[account(init, payer = payer, mint::decimals = 0, mint::authority = payer, mint::freeze_authority = payer)]
    pub mint: Account<'info, Mint>,
    mint_authority: Signer<'info>,
    #[account(init, payer = payer, associated_token::mint = mint, associated_token::authority = payer)]
    pub vault: Account<'info, TokenAccount>,

    /// CHECK: account checked in CPI
    #[account(address = mpl_token_metadata::id())]
    token_metadata_program: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}
pub fn exec<'info>(
    ctx: Context<BuyBox>,
    creator_bump: u8,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    // let outer_space_creator = &ctx.accounts.outer_space_creator;
    let a_meta = &ctx.accounts.a_meta;
    let mint_to_ctx = token::MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    token::mint_to(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), mint_to_ctx),
        1,
    )?;
    let metadata_infos = vec![
        ctx.accounts.metadata.to_account_info(),
        ctx.accounts.mint.to_account_info(),
        ctx.accounts.mint_authority.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.token_metadata_program.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.rent.to_account_info(),
        // outer_space_creator.to_account_info(),
    ];
    // let name = "Starter Box 1".to_string();
    // let symbol = "Box1".to_string();
    // let uri = "http://referral-mb.herokuapp.com/box1.json".to_string();
    let mut creators: Vec<mpl_token_metadata::state::Creator> =
        vec![mpl_token_metadata::state::Creator {
            address: ctx.accounts.payer.key(),
            verified: true,
            share: 100,
        }];
    // let authority_seeds = [PREFIX.as_bytes()];
    
    let authority_seeds = [PREFIX.as_bytes(), &[creator_bump]];
    // invoke_signed(
    //     &create_metadata_accounts_v2(
    //         ctx.accounts.token_metadata_program.key(),
    //         ctx.accounts.metadata.key(),
    //         ctx.accounts.mint.key(),
    //         ctx.accounts.mint_authority.key(),
    //         ctx.accounts.payer.key(),
    //         ctx.accounts.mint_authority.key(),
    //         name,
    //         symbol,
    //         uri,
    //         Some(creators),
    //         1,
    //         true,
    //         false,
    //         None,
    //         None,
    //     ),
    //     metadata_infos.as_slice(),
    //     &[&authority_seeds],
    // )?;
    Ok(())
}
