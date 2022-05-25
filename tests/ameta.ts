import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Ameta } from "../target/types/ameta";
import { clusterApiUrl, Connection, Keypair, Transaction, SystemProgram, } from "@solana/web3.js";
import { AMetaData, findAssociatedTokenAddress, getAMeta, getMetadata, MY_WALLET, TOKEN_METADATA_PROGRAM_ID } from "./utils";
import { ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
describe("ameta", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Ameta as Program<Ameta>;

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
    // console.log(sig);
    // console.log(await program.provider.connection.getTransaction(sig, { commitment: 'confirmed' }));
    // console.log("Outer Space==========", await program.account.aMeta.fetch(aMetaPDA));
    // console.log("==========", await program.provider.connection.getAccountInfo(outerSpaceAccount.publicKey));

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
  const mint = Keypair.generate();
  let payer = MY_WALLET;
  let vault: any = null;
  
  it('Buy box', async () => {
    const [aMetaPDA, bump] = await getAMeta(program);
    const metadataAddress = await getMetadata(mint.publicKey);
    
    
    // const program = await getProgram();
    vault = await findAssociatedTokenAddress(payer.publicKey, mint.publicKey);


    await program.rpc.buyBox(bump, 'BOX1', 'BOX', 'uri', {
      accounts: {
        aMeta: aMetaPDA,
        payer: payer.publicKey,
        mint: mint.publicKey,
        mintAuthority: payer.publicKey,
        vault: vault,
        metadata: metadataAddress,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      }, signers: [mint, payer]
    })
    // const account = await program.account.
    // console.log("starterAccount==========", account);
    console.log("token balance1111: ", await program.provider.connection.getTokenAccountBalance(vault));
  });

  it('open box', async () => {
    const [aMetaPDA, bump] = await getAMeta(program);
    let payer = MY_WALLET;    
    let fishingRod = Keypair.generate();
    const metadataAddress = await getMetadata(fishingRod.publicKey);
    let fishingVault = await findAssociatedTokenAddress(payer.publicKey, fishingRod.publicKey);
    await program.rpc.openBox(bump, 'uri', 'name',{
      accounts: {
        user: payer.publicKey,
        aMeta: aMetaPDA,
        aMetaBox: mint.publicKey,
        boxTokenAccount: vault,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        metadata: metadataAddress,
        mint: fishingRod.publicKey,
        mintAuthority: payer.publicKey,
        vault: fishingVault,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      }, 
      signers: [fishingRod, payer]
    })
    console.log("token balance222: ", await program.provider.connection.getTokenAccountBalance(vault));
    console.log("token balance333: ", await program.provider.connection.getTokenAccountBalance(fishingVault));
  })

});


