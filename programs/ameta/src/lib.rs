use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
pub mod schema;
pub use schema::*;

pub mod intructions;
pub use intructions::*;

pub mod errors;
pub use errors::*;

pub mod utils;
pub use utils::*;
use crate::errors::ErrorCode;

#[program]
pub mod ameta {
    use super::*;

    pub fn initialize_game(ctx: Context<InitializeAMeta>, data: AMetaData) -> Result<()> {
        initialize_game::exec(ctx, data);
        Ok(())
    }

    pub fn buy_box(
        ctx: Context<BuyBox>,
        creator_bump: u8,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        buy_box::exec(ctx, creator_bump, name, symbol, uri)
        
    }

    pub fn open_box(
        ctx: Context<OpenBox>,
        creator_bump: u8,
        fishing_rod_uri: String,
        fishing_rod_name: String,
    ) -> Result<()> {        
        open_box::exec(ctx, creator_bump, fishing_rod_uri, fishing_rod_name)
    }

    pub fn initialize_starter_account(
        ctx: Context<InitializeStarterAccount>,
        user_name: String,
    ) -> Result<()> {
        initialize_starter_account::exec(ctx, user_name)        
    }
}

#[derive(Accounts)]
pub struct Initialize {}
