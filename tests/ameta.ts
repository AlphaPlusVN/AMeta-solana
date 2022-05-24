import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Ameta } from "../target/types/ameta";
import { clusterApiUrl, Connection, Keypair, Transaction, SystemProgram, } from "@solana/web3.js";
import { AMetaData, getAMeta, MY_WALLET } from "./utils";

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

    await program.rpc.initializeGame(outerSpaceData, {
      accounts: {
        aMeta: aMetaPDA,
        authority: MY_WALLET.publicKey,
        systemProgram: SystemProgram.programId,
      },
      // signers: [MY_WALLET],

    })
    console.log("Outer Space==========", await program.account.aMeta.fetch(aMetaPDA));
    // console.log("==========", await program.provider.connection.getAccountInfo(outerSpaceAccount.publicKey));

  });

  it('create starter account', async () => {
    const [aMetaPDA, bump] = await getAMeta(program);
    const starter_account1 = Keypair.generate();
    await program.rpc.initializeStarterAccount('trunghieu307', {
      accounts: {
        authority: MY_WALLET.publicKey,
        aMeta: aMetaPDA,
        starterAccount: starter_account1.publicKey,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      }, signers: [starter_account1]
    })
    const account  = await program.account.starterAccount.fetch(starter_account1.publicKey);
    console.log("starterAccount==========", account);

    
  });
});
