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
  let ownerTokenAccount: anchor.web3.PublicKey;
  let payer = MY_WALLET;
  before(async () => {
    ownerTokenAccount = await findAssociatedTokenAddress(MY_WALLET.publicKey, aMetaToken.publicKey);
    // await initializeMint(9, aMetaToken, program.provider)
    // let create_owner_token_tx = new Transaction().add(

    //   SystemProgram.createAccount({
    //     fromPubkey: program.provider.wallet.publicKey,
    //     newAccountPubkey: ownerTokenAccount.publicKey,
    //     space: AccountLayout.span,
    //     lamports: await Token.getMinBalanceRentForExemptAccount(program.provider.connection),
    //     programId: TOKEN_PROGRAM_ID,
    //   }),
    //   // init mint account
    //   Token.createInitAccountInstruction(
    //     TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
    //     aMetaToken.publicKey, // mint
    //     ownerTokenAccount.publicKey, // token account
    //     payer.publicKey // owner of token account
    //   ),
    //   Token.createMintToInstruction(
    //     TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
    //     aMetaToken.publicKey, // mint
    //     ownerTokenAccount.publicKey, // receiver (sholud be a token account)
    //     payer.publicKey, // mint authority
    //     [], // only multisig account will use. leave it empty now.
    //     100e9 // amount. if your decimals is 8, you mint 10^8 for 1 token.
    //   )
    // );

    // await program.provider.send(create_owner_token_tx, [ownerTokenAccount]);
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
        aMetaMint: aMetaToken.publicKey,
        tokenAccount: ownerTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        authority: MY_WALLET.publicKey,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,

      },
      signers: [MY_WALLET, aMetaToken],

    })

    console.log("aMetaPDA ==========", await program.account.aMeta.fetch(aMetaPDA));
  });
  it('update ameta', async () => {
    // return;
    let outerSpaceData: AMetaData = {
      price: new anchor.BN(1),
      symbol: 'AMCCCC',
    };
    let payerWallet = program.provider.wallet;

    const [aMetaPDA, bump] = await getAMeta(program);

    let sig = await program.rpc.updateGame(outerSpaceData, {
      accounts: {
        aMeta: aMetaPDA,
        authority: MY_WALLET.publicKey,
        tokenAccount: ownerTokenAccount,
        aMetaMint: aMetaToken.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [MY_WALLET],

    })

    console.log("aMetaPDA ==========", await program.account.aMeta.fetch(aMetaPDA));
  });

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
  const boxNft = Keypair.generate();
  const buyerWallet = Keypair.generate();
  let boxVault: anchor.web3.PublicKey;
  return true;

  it('Buy box', async () => {
    const airdropSignature = await program.provider.connection.requestAirdrop(
      buyerWallet.publicKey,
      LAMPORTS_PER_SOL,
    );

    await program.provider.connection.confirmTransaction(airdropSignature);

    
    const metadataAddress = await getMetadata(boxNft.publicKey);

    boxVault = await findAssociatedTokenAddress(buyerWallet.publicKey, boxNft.publicKey);


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

    console.log("buyerTokenAccount balance: ", (await program.provider.connection.getTokenAccountBalance(buyerTokenAccount.publicKey)).value.uiAmount);


    await program.rpc.buyBox(bump, 'BOX1', 'STARTER_BOX', {
      accounts: {
        aMeta: aMetaPDA,
        payer: buyerWallet.publicKey,
        boxMint: boxNft.publicKey,
        // aMetaToken: aMetaToken.publicKey,
        // mintAuthority: payer.publicKey,
        buyerTokenAccount: buyerTokenAccount.publicKey,
        ownerTokenAccount: ownerTokenAccount,
        vault: boxVault,
        metadata: metadataAddress,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
      , signers: [boxNft, buyerWallet]
    })
    console.log("buyerTokenAccount balance: ", (await program.provider.connection.getTokenAccountBalance(buyerTokenAccount.publicKey)).value.uiAmount);
    console.log("ownerTokenAccount balance: ", (await program.provider.connection.getTokenAccountBalance(ownerTokenAccount)).value.uiAmount);
    console.log("boxVault balance: ", (await program.provider.connection.getTokenAccountBalance(boxVault)).value.uiAmount);
  });

  let fishingRod = Keypair.generate();
  let fishingRodVault: anchor.web3.PublicKey;

  it('open box', async () => {
    const [aMetaPDA, bump] = await getAMeta(program);
    fishingRodVault = await findAssociatedTokenAddress(buyerWallet.publicKey, fishingRod.publicKey);
    const metadataAddress = await getMetadata(fishingRod.publicKey);

    await program.rpc.openBox(bump, 'uri', 'name', {
      accounts: {
        aMeta: aMetaPDA,
        user: buyerWallet.publicKey,
        boxMint: boxNft.publicKey,
        boxTokenAccount: boxVault,
        mint: fishingRod.publicKey,
        vault: fishingRodVault,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        metadata: metadataAddress,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [
        fishingRod,
        buyerWallet
      ]
    })
    console.log("boxVault balance: ", (await program.provider.connection.getTokenAccountBalance(boxVault)).value.uiAmount);
    console.log("fishingRod balance : ", (await program.provider.connection.getTokenAccountBalance(fishingRodVault)).value.uiAmount);
  })

  it('init rent system', async () => {
    const [aMetaPDA, bump] = await getAMeta(program);

    let rentSystem: anchor.web3.PublicKey;
    const [rentSystemPublicKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('rent_system'), aMetaPDA.toBuffer(), MY_WALLET.publicKey.toBuffer()],
      program.programId
    )
    rentSystem = rentSystemPublicKey;
    const rentSystemTokenAccount = await findAssociatedTokenAddress(rentSystem, aMetaToken.publicKey);

    await program.rpc.initializeRentSystem({
      accounts: {
        aMeta: aMetaPDA,
        authority: MY_WALLET.publicKey,
        rentSystem: rentSystem,
        mint: aMetaToken.publicKey,
        rentSystemTokenAccount: rentSystemTokenAccount,
        ownerTokenAccount: ownerTokenAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY
      },
      signers: [MY_WALLET]
    })
    console.log("rentSystemTokenAccount balance : ", (await program.provider.connection.getTokenAccountBalance(rentSystemTokenAccount)).value.uiAmount);
    console.log('rent system', await program.account.rentSystem.fetch(rentSystem));

  })

  it('make new fishing rod rent contract', async () => {
    const [aMetaPDA, bump] = await getAMeta(program);
    const [fishingRodRentContractPk] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from('fishing_rod_rent_contract'),
        aMetaPDA.toBuffer(),
        buyerWallet.publicKey.toBuffer(),
      ],
      program.programId,
    )
    const [rentSystemPk] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from('rent_system'),
        aMetaPDA.toBuffer(),
        program.provider.wallet.publicKey.toBuffer(),
      ],
      program.programId,
    )
    const rentPoolTokenAccount = await findAssociatedTokenAddress(rentSystemPk, fishingRod.publicKey);
    await program.rpc.makeNewFishingRodRent(new anchor.BN(20), {
      accounts: {
        aMeta: aMetaPDA,
        authority: buyerWallet.publicKey,
        fishingRodForRent: fishingRod.publicKey,
        fishingRodOwner: fishingRodVault,
        fishingRodRentContract: fishingRodRentContractPk,
        poolFishingRod: rentPoolTokenAccount,
        rentSystem: rentSystemPk,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [buyerWallet]
    });

    console.log('Fishing rod rent contract: ', await program.account.rentContract.fetch(fishingRodRentContractPk));
    console.log("fishingRodVault balance : ", (await program.provider.connection.getTokenAccountBalance(fishingRodVault)).value.uiAmount);
    console.log("rentPoolTokenAccount balance : ", (await program.provider.connection.getTokenAccountBalance(rentPoolTokenAccount)).value.uiAmount);
  })

});


