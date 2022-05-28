use crate::errors::ErrorCode;
use crate::schema::*;
use crate::utils::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token;
use anchor_spl::token::Mint;
use anchor_spl::token::Token;
use anchor_spl::token::TokenAccount;
use mpl_token_metadata::instruction::create_metadata_accounts_v2;
use solana_program::program::invoke_signed;

#[derive(Accounts)]
#[instruction(creator_bump: u8, name: String, box_code: String)]
pub struct BuyBox<'info> {
    #[account(mut)]
    pub a_meta: Box<Account<'info, AMeta>>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(init, payer = payer, mint::decimals = 0, mint::authority = payer, mint::freeze_authority = payer)]
    pub box_mint: Account<'info, Mint>,

    // // #[account(mut)]
    // // pub mint_authority: Signer<'info>,
    #[account(init, payer = payer, associated_token::mint = box_mint, associated_token::authority = payer)]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub owner_token_account: UncheckedAccount<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    metadata: UncheckedAccount<'info>,
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
    box_code: String,
) -> Result<()> {
    // let outer_space_creator = &ctx.accounts.outer_space_creator;
    let a_meta = &ctx.accounts.a_meta;
    let buyer_token_account = &ctx.accounts.buyer_token_account;
    let owner_token_account = &ctx.accounts.owner_token_account;

    let mut uri = "".to_string();
    let mut price: u64 = 0;
    if box_code == "STARTER_BOX".to_string() {
        uri = "https://ipfs.io/ipfs/QmSfLHFkqx5HUaob2dRSFynR5z9puJKEye2Ezig4U5iEDx".to_string();
        price = 100000000000;
    } else {
        return err!(ErrorCode::InvalidBoxCode);
    }
    msg!("===========MSG=============");
    msg!(&a_meta.token_account.to_string());
    msg!(&owner_token_account.key().to_string());

    if a_meta.token_account != owner_token_account.key() {
        return err!(ErrorCode::InvalidOwnerTokenAccount);
    }

    if buyer_token_account.amount < price {
        return err!(ErrorCode::NotEnoughToken);
    }

    let transfer_ctx = token::Transfer {
        from: buyer_token_account.to_account_info(),
        to: owner_token_account.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    token::transfer(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_ctx),
        price,
    )?;

    let mint_to_ctx = token::MintTo {
        mint: ctx.accounts.box_mint.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    token::mint_to(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), mint_to_ctx),
        1,
    )?;
    let metadata_infos = vec![
        ctx.accounts.metadata.to_account_info(),
        ctx.accounts.box_mint.to_account_info(),
        // ctx.accounts.payer.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.token_metadata_program.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.rent.to_account_info(),
        // outer_space_creator.to_account_info(),
    ];
    let mut creators: Vec<mpl_token_metadata::state::Creator> =
        vec![mpl_token_metadata::state::Creator {
            address: ctx.accounts.payer.key(),
            verified: true,
            share: 100,
        }];
    let authority_seeds = [PREFIX.as_bytes()];
    let authority_seeds = [PREFIX.as_bytes(), &[creator_bump]];
    // invoke_signed(
    //     &create_metadata_accounts_v2(
    //         ctx.accounts.token_metadata_program.key(),
    //         ctx.accounts.metadata.key(),
    //         ctx.accounts.box_mint.key(),
    //         ctx.accounts.payer.key(),
    //         ctx.accounts.payer.key(),
    //         ctx.accounts.payer.key(),
    //         name,
    //         "BOX".to_string(),
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
