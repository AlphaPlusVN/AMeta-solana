use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
pub mod schema;
pub use schema::*;

pub mod intructions;
pub use intructions::*;

pub mod errors;
pub use errors::*;

pub mod utils;
use crate::errors::ErrorCode;
pub use utils::*;

#[program]
pub mod ameta {
    use super::*;

    pub fn initialize_game(ctx: Context<InitializeAMeta>, data: AMetaData) -> Result<()> {
        initialize_game::exec(ctx, data);
        Ok(())
    }
    pub fn update_game(ctx: Context<UpdateAmeta>, data: AMetaData) -> Result<()> {
        update_game::exec(ctx, data);
        Ok(())
    }

    pub fn buy_box(
        ctx: Context<BuyBox>,
        creator_bump: u8,
        name: String,
        box_code: String,        
    ) -> Result<()> {
        buy_box::exec(ctx, creator_bump, name, box_code)
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

    pub fn initialize_rent_system(ctx: Context<InitializeRentSystem>) -> Result<()> {
        initialize_rent_system::exec(ctx)
    }
    
    #[inline(never)]
    pub fn make_new_fishing_rod_rent(
        ctx: Context<MakeNewFishingRodRent>,
        profit: u8,
    ) -> Result<()> {
        make_new_fishing_rod_rent::exec(ctx, profit)
    }

    pub fn rent_fishing_rod(ctx: Context<RentFishingRod>) -> Result<()> {
        rent_fishing_rod::exec(ctx)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
