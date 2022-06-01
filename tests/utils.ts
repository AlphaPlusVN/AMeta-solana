import * as anchor from '@project-serum/anchor';
import { Program, Spl, web3 } from '@project-serum/anchor';
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


export const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);

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
export const MY_WALLET2 = web3.Keypair.fromSecretKey(
  new Uint8Array(
    JSON.parse(fs.readFileSync(__dirname + '/../keypair6.json').toString())
  )
)

export const getStakePool = async (outerProgram: any, outerPDA: web3.PublicKey,) => {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from('stakepool'),
      outerPDA.toBuffer(),
      outerProgram.provider.wallet.publicKey.toBuffer(),
    ],
    outerProgram.programId,
  )

}

export const getMetadata = async (
  mint: anchor.web3.PublicKey,
): Promise<anchor.web3.PublicKey> => {
  return (
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0];
};

export const findAssociatedTokenAddress = async(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<PublicKey> => {
  return (await PublicKey.findProgramAddress(
      [
          walletAddress.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          tokenMintAddress.toBuffer(),
      ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  ))[0];
}
const splProgram = Spl.token()
export const initializeMint = async (
  decimals: number,
  token: web3.Keypair,
  provider: anchor.Provider,
) => {
  const ix = await (splProgram.account as any).mint.createInstruction(token)
  const tx = new web3.Transaction().add(ix)
  await provider.send(tx, [token])
  return await splProgram.rpc.initializeMint(
    decimals,
    provider.wallet.publicKey,
    provider.wallet.publicKey,
    {
      accounts: {
        mint: token.publicKey,
        rent: web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [],
    },
  )
}

 export const createAssociatedTokenAccountInstruction = (
  associatedTokenAddress: anchor.web3.PublicKey,
  payer: anchor.web3.PublicKey,
  walletAddress: anchor.web3.PublicKey,
  splTokenMintAddress: anchor.web3.PublicKey,
) => {
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
    { pubkey: walletAddress, isSigner: false, isWritable: false },
    { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  return new anchor.web3.TransactionInstruction({
    keys,
    programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    data: Buffer.from([]),
  });
};