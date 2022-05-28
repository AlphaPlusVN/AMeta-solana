use mpl_token_metadata::instruction::create_metadata_accounts_v2;
use solana_program::program::invoke_signed;
use crate::PREFIX;
use anchor_lang::prelude::*;
use anchor_spl::token;
use anchor_spl::token::Token;


pub struct CreateNftParams<'a> {
    pub payer: Signer<'a>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub metadata: AccountInfo<'a>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint: AccountInfo<'a>,
    /// CHECK: account checked in CPI
    pub mint_authority: Signer<'a>,
    /// CHECK: account checked in CPI
    pub vault: AccountInfo<'a>,
    /// CHECK: account checked in CPI
    pub token_program: AccountInfo<'a>,
    /// CHECK: account checked in CPI
    pub token_metadata_program: AccountInfo<'a>,
    /// CHECK: account checked in CPI
    pub rent: Sysvar<'a, Rent>,
    /// CHECK: account checked in CPI
    pub system_program: Program<'a, System>,
    pub creator_bump: u8,
    pub name: String,
    pub symbol: String,
    pub uri: String,
}
pub fn create_nft(params: CreateNftParams<'_>) -> Result<()> {
    let CreateNftParams {
        payer,
        metadata,
        mint,
        mint_authority,
        vault,
        token_program,
        token_metadata_program,
        rent,
        system_program,
        creator_bump,
        name,
        symbol,
        uri,
    } = params;
    let mint_to_ctx = token::MintTo {
        mint: mint.to_account_info(),
        to: vault.to_account_info(),
        authority: payer.to_account_info(),
    };
    token::mint_to(
        CpiContext::new(token_program.to_account_info(), mint_to_ctx),
        1,
    )?;
    let metadata_infos = vec![
        metadata.to_account_info(),
        mint.to_account_info(),
        mint_authority.to_account_info(),
        payer.to_account_info(),
        token_metadata_program.to_account_info(),
        token_program.to_account_info(),
        system_program.to_account_info(),
        rent.to_account_info(),
        // outer_space_creator.to_account_info(),
    ];
    let symbol = "FISHING_ROD".to_string();
    let mut creators: Vec<mpl_token_metadata::state::Creator> =
        vec![mpl_token_metadata::state::Creator {
            address: payer.key(),
            verified: true,
            share: 100,
        }];
    // let authority_seeds = [PREFIX.as_bytes()];
    let authority_seeds = [PREFIX.as_bytes(), &[creator_bump]];
    // invoke_signed(
    //     &create_metadata_accounts_v2(
    //         token_metadata_program.key(),
    //         metadata.key(),
    //         mint.key(),
    //         mint_authority.key(),
    //         payer.key(),
    //         mint_authority.key(),
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
