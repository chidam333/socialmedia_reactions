import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
const assert = require("assert")
import { TwitterReaction } from "../target/types/twitter_reaction";

describe("twitter-reaction", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.TwitterReaction as Program<TwitterReaction>;
  it('can send a new msg',async()=>{
    const tweet = anchor.web3.Keypair.generate();
    await program.rpc.sendTweet('This is first test case for our social media in blockchain dapp',42,{
      accounts:{
        tweet: tweet.publicKey,
        author:program.provider.wallet.publicKey,
        systemProgram:anchor.web3.SystemProgram.programId,
      },
      signers:[tweet],
  });
  const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
  console.log(tweetAccount);
});
})
