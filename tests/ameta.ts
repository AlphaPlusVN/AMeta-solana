import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Ameta } from "../target/types/ameta";
import { clusterApiUrl, Connection, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AMetaData, createAssociatedTokenAccountInstruction, findAssociatedTokenAddress, getAMeta, getAtaForMint, getMetadata, initializeMint, MY_WALLET, MY_WALLET2, TOKEN_METADATA_PROGRAM_ID } from "./utils";
import { AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

describe("ameta", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Ameta as Program<Ameta>;
  const aMetaToken = Keypair.generate();
  const ownerTokenAccount = Keypair.generate();
  let payer = MY_WALLET;
  before(async () => {
    await initializeMint(9, aMetaToken, program.provider)

  })

  it('initialize_a_meta', async () => {
    // return;
    let outerSpaceData: AMetaData = {
      price: new anchor.BN(12),
      symbol: 'AMC',
    };
    let payerWallet = program.provider.wallet;

    const [aMetaPDA, bump] = await getAMeta(program);

    let sig = await program.rpc.initializeGame(outerSpaceData, {
      accounts: {
        aMeta: aMetaPDA,
        authority: MY_WALLET.publicKey,
        systemProgram: SystemProgram.programId,

      },
      signers: [MY_WALLET],

    })

    console.log("aMetaPDA ==========", await program.account.aMeta.fetch(aMetaPDA));
  });
  // it('update ameta', async () => {
  //   // return;
  //   let outerSpaceData: AMetaData = {
  //     price: new anchor.BN(1),
  //     symbol: 'AMCCCC',
  //   };
  //   let payerWallet = program.provider.wallet;

  //   const [aMetaPDA, bump] = await getAMeta(program);

  //   let sig = await program.rpc.updateGame(outerSpaceData, {
  //     accounts: {
  //       aMeta: aMetaPDA,
  //       authority: MY_WALLET.publicKey,
  //       systemProgram: SystemProgram.programId,
  //     },
  //     signers: [MY_WALLET],

  //   })

  //   console.log("aMetaPDA ==========", await program.account.aMeta.fetch(aMetaPDA));
  // });

  // it('create starter account', async () => {
  //   const [aMetaPDA, bump] = await getAMeta(program);
  //   const starter_account1 = Keypair.generate();
  //   await program.rpc.initializeStarterAccount('trunghieu307', {
  //     accounts: {
  //       authority: MY_WALLET.publicKey,
  //       aMeta: aMetaPDA,
  //       starterAccount: starter_account1.publicKey,
  //       systemProgram: SystemProgram.programId,
  //       rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //     }, signers: [starter_account1]
  //   })



  // });
  const mint = Keypair.generate();
  const buyerWallet = Keypair.generate();
  let boxVault: anchor.web3.PublicKey;

  it('Buy box', async () => {
    const airdropSignature = await program.provider.connection.requestAirdrop(
      buyerWallet.publicKey,
      LAMPORTS_PER_SOL,
    );

    await program.provider.connection.confirmTransaction(airdropSignature);

    const [aMetaPDA, bump] = await getAMeta(program);
    const metadataAddress = await getMetadata(mint.publicKey);

    boxVault = await findAssociatedTokenAddress(buyerWallet.publicKey, mint.publicKey);

    // let buyerTokenAccount = await findAssociatedTokenAddress(buyerWallet.publicKey, aMetaToken.publicKey);

    let buyerTokenAccount = Keypair.generate();
    let create_buyer_token_tx = new Transaction().add(

      SystemProgram.createAccount({
        fromPubkey: program.provider.wallet.publicKey,
        newAccountPubkey: buyerTokenAccount.publicKey,
        space: AccountLayout.span,
        lamports: await Token.getMinBalanceRentForExemptAccount(program.provider.connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      // init mint account
      Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        aMetaToken.publicKey, // mint
        buyerTokenAccount.publicKey, // token account
        buyerWallet.publicKey // owner of token account
      ),
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        aMetaToken.publicKey, // mint
        buyerTokenAccount.publicKey, // receiver (sholud be a token account)
        payer.publicKey, // mint authority
        [], // only multisig account will use. leave it empty now.
        150e9 // amount. if your decimals is 8, you mint 10^8 for 1 token.
      )
    );

    await program.provider.send(create_buyer_token_tx, [buyerTokenAccount]);

    console.log("buyerTokenAccount balance: ", await program.provider.connection.getTokenAccountBalance(buyerTokenAccount.publicKey));
    let create_owner_token_tx = new Transaction().add(

      SystemProgram.createAccount({
        fromPubkey: program.provider.wallet.publicKey,
        newAccountPubkey: ownerTokenAccount.publicKey,
        space: AccountLayout.span,
        lamports: await Token.getMinBalanceRentForExemptAccount(program.provider.connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      // init mint account
      Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        aMetaToken.publicKey, // mint
        ownerTokenAccount.publicKey, // token account
        payer.publicKey // owner of token account
      ),
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        aMetaToken.publicKey, // mint
        ownerTokenAccount.publicKey, // receiver (sholud be a token account)
        payer.publicKey, // mint authority
        [], // only multisig account will use. leave it empty now.
        100e9 // amount. if your decimals is 8, you mint 10^8 for 1 token.
      )
    );

    await program.provider.send(create_owner_token_tx, [ownerTokenAccount]);
    console.log("ownerTokenAccount balance: ", await program.provider.connection.getTokenAccountBalance(ownerTokenAccount.publicKey));
    await program.rpc.buyBox(bump, 'BOX1', 'STARTER_BOX', {
      accounts: {
        aMeta: aMetaPDA,
        payer: buyerWallet.publicKey,
        boxMint: mint.publicKey,
        aMetaToken: aMetaToken.publicKey,
        // mintAuthority: payer.publicKey,
        buyerTokenAccount: buyerTokenAccount.publicKey,
        ownerTokenAccount: ownerTokenAccount.publicKey,
        vault: boxVault,
        metadata: metadataAddress,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
      , signers: [mint, buyerWallet]
    })
    console.log("buyerTokenAccount balance: ", await program.provider.connection.getTokenAccountBalance(buyerTokenAccount.publicKey));
    console.log("ownerTokenAccount balance: ", await program.provider.connection.getTokenAccountBalance(ownerTokenAccount.publicKey));
    // console.log("token balance: ", await program.provider.connection.getTokenAccountBalance(boxVault));
  });

  let fishingRod = Keypair.generate();
  let fishingRodVault: anchor.web3.PublicKey;

  // it('open box', async () => {
  //   const [aMetaPDA, bump] = await getAMeta(program);
  //   fishingRodVault = await findAssociatedTokenAddress(payer.publicKey, fishingRod.publicKey);
  //   const metadataAddress = await getMetadata(fishingRod.publicKey);

  //   await program.rpc.openBox(bump, 'uri', 'name', {
  //     accounts: {
  //       user: payer.publicKey,
  //       aMeta: aMetaPDA,
  //       aMetaBox: mint.publicKey,
  //       boxTokenAccount: boxVault,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
  //       metadata: metadataAddress,
  //       mint: fishingRod.publicKey,
  //       vault: fishingRodVault,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //       rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     },
  //     signers: [fishingRod, payer]
  //   })
  //   console.log("token balance box: ", await program.provider.connection.getTokenAccountBalance(boxVault));
  //   console.log("token balance fishingRod: ", await program.provider.connection.getTokenAccountBalance(fishingRodVault));
  // })

  // it('init rent system', async () => {
  //   const [aMetaPDA, bump] = await getAMeta(program);

  //   let rentSystem: anchor.web3.PublicKey;
  //   const [rentSystemPublicKey] = await anchor.web3.PublicKey.findProgramAddress(
  //     [Buffer.from('rent_system'), aMetaPDA.toBuffer(), MY_WALLET.publicKey.toBuffer()],
  //     program.programId
  //   )
  //   rentSystem = rentSystemPublicKey;
  //   const rentSystemTokenAccount = await findAssociatedTokenAddress(payer.publicKey, aMetaToken.publicKey);

  //   await program.rpc.initializeRentSystem({
  //     accounts: {
  //       aMeta: aMetaPDA,
  //       authority: MY_WALLET.publicKey,
  //       rentSystem: rentSystem,
  //       mint: aMetaToken.publicKey,
  //       rentSystemTokenAccount: rentSystemTokenAccount,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //       rent: anchor.web3.SYSVAR_RENT_PUBKEY
  //     },
  //     signers: [MY_WALLET]
  //   })

  //   // console.log('rent system', await program.account.rentSystem.fetch(rentSystem));

  // })

  // it('make new fishing rod rent contract', async () => {
  //   const [aMetaPDA, bump] = await getAMeta(program);
  //   const [fishingRodRentContractPk] = await anchor.web3.PublicKey.findProgramAddress(
  //     [
  //       Buffer.from('fishing_rod_rent_contract'),
  //       aMetaPDA.toBuffer(),
  //       program.provider.wallet.publicKey.toBuffer(),
  //     ],
  //     program.programId,
  //   )
  //   await program.rpc.makeNewFishingRodRent(new anchor.BN(20), {
  //     accounts: {
  //       aMeta: aMetaPDA,
  //       authority: payer.publicKey,
  //       fishingRodForRent: fishingRod.publicKey,
  //       fishingRodOwner: fishingRodVault,
  //       fishingRodRentContract: fishingRodRentContractPk,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     }
  //   });

  //   console.log('Fishing rod rent contract: ', await program.account.rentContract.fetch(fishingRodRentContractPk));
  // })

});


