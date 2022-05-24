import * as anchor from '@project-serum/anchor';
import { Program, web3 } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  AccountInfo,
} from '@solana/web3.js';
import fs from 'fs'
export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID =
  new anchor.web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const PREFIX = 'a_meta';


export const getAtaForMint = async (
  mint: anchor.web3.PublicKey,
  buyer: anchor.web3.PublicKey,
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddress(
    [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  );
};


export interface AMetaData {

  symbol: string;
  price: anchor.BN;

}

export const getAMeta = async (outerProgram: any) => {
    return await PublicKey.findProgramAddress(
    [Buffer.from(PREFIX)],
    outerProgram.programId
  )

}

export const MY_WALLET = web3.Keypair.fromSecretKey(
  new Uint8Array(
    JSON.parse(fs.readFileSync(__dirname + '/../keypair5.json').toString())
  )
)

export const getStakePool = async (outerProgram: any, outerPDA: web3.PublicKey, ) => {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from('stakepool'),
      outerPDA.toBuffer(),
      outerProgram.provider.wallet.publicKey.toBuffer(),
    ],
    outerProgram.programId,
)

}