use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
pub mod schema;
pub use schema::*;

pub mod intructions;
pub use intructions::*;

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
        buy_box::exec(ctx, creator_bump, name, symbol, uri);
        Ok(())
    }

    pub fn initialize_starter_account(
        ctx: Context<InitializeStarterAccount>,
        user_name: String
    ) -> Result<()>{
        initialize_starter_account::exec(ctx, user_name);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
