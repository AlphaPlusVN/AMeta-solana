use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::TokenAccount;
use anchor_spl::token::Mint;
use mpl_token_metadata::instruction::create_metadata_accounts_v2;
use solana_program::program::invoke_signed;
use anchor_spl::token::Token;
use anchor_spl::token;
use anchor_lang::prelude::*;
use crate::errors::ErrorCode;
use crate::schema::*;

#[derive(Accounts)]
#[instruction(creator_bump: u8, fishing_rod_uri: String, fishing_rod_name: String)]
pub struct OpenBox{
    #[account(mut)]
    pub user: Signer<'info>,
    // AMeta accounts
    #[account(mut)]
    pub a_meta: Account<'info, AMeta>,
    #[account(mut)]
    pub a_meta_box: Account<'info, Mint>,

    pub box_token_account: Account<'info, TokenAccount>,
    #[account(address = mpl_token_metadata::id())]
    token_metadata_program: UncheckedAccount<'info>,å
}

pub fn exec(
    ctx: Context<OpenBox>,
    creator_bump: u8,
    fishing_rod_uri: String,
    fishing_rod_name: String,
) -> Result<()>{
    let user = &ctx.accounts.user;
    let a_meta_box  =&ctx.accounts.a_meta_box;
    let box_token_account = &ctx.accounts.box_token_account;
    //Check the ower of token account
    if box_token_account.owner != user.key(){
        return err!(ErrorCode::NotOwnerNFT);
    }
    
    //Check Box on the token account
    if box_token_account.mint != a_meta_box.key(){
        return err!(ErrorCode::NotOwnerNFT);
    }

    //Check amount of token account
    if box_token_account.amount != 1{
        return err!(ErrorCode::NotOwnerNFT);
    }

    

    Ok(())
}