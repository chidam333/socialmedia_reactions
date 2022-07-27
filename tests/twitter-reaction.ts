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
    await program.rpc.sendTweet('This is first test case for our social media in blockchain dapp',42,18,45,11,{
      accounts:{
        tweet: tweet.publicKey,
        author:program.provider.wallet.publicKey,
        systemProgram:anchor.web3.SystemProgram.programId,
      },
      signers:[tweet],
    });
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
    assert.equal(tweetAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58());
    assert.equal(tweetAccount.content, 'This is first test case for our social media in blockchain dapp');
    assert.equal(tweetAccount.likes,42);
    assert.ok(tweetAccount.time);
  });
  it('can send without content',async()=>{
    const tweet = anchor.web3.Keypair.generate();
    await program.rpc.sendTweet('',42,18,45,11,{
      accounts:{
        tweet:tweet.publicKey,
        author : program.provider.wallet.publicKey,
        systemProgram:anchor.web3.SystemProgram.programId,},
      signers:[tweet],
      });
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
    assert.equal(tweetAccount.author.toBase58(),program.provider.wallet.publicKey.toBase58());
    assert.equal(tweetAccount.content, '');
    assert.equal(tweetAccount.likes,42);
    assert.equal(tweetAccount.heart,18);
    assert.ok(tweetAccount.time);
    })
  it('can send content of different author',async()=>{
    const tweet = anchor.web3.Keypair.generate();
    const other = anchor.web3.Keypair.generate();
    const signature = await program.provider.connection.requestAirdrop(other.publicKey, 1000000000);
    await program.provider.connection.confirmTransaction(signature);
    await program.rpc.sendTweet('this is indeed a tweet',42,18,45,11,{
      accounts:{
        tweet:tweet.publicKey,
        author : other.publicKey,
        systemProgram:anchor.web3.SystemProgram.programId,},
      signers:[other,tweet],
      });
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
    assert.equal(tweetAccount.author.toBase58(),other.publicKey.toBase58());
    assert.equal(tweetAccount.content, 'this is indeed a tweet');
    assert.equal(tweetAccount.likes,42);
    assert.ok(tweetAccount.time);
    })
  it('Error when 300+ char content is inputed',async()=>{
  try{
      const tweet = anchor.web3.Keypair.generate();
      const tweetcontent="This is a very long tweet".repeat(1000)
      await program.rpc.sendTweet(tweetcontent,42,18,45,11,{
        accounts:{
          tweet:tweet.publicKey,
          author: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,},
        signers:[tweet],
        });
    }
    catch(error){
      assert.equal("The provided Tweet should be 300 characters long maximum.","The provided Tweet should be 300 characters long maximum.");
      return;
    }
    assert.fail('Hmm it is in limits');
    })
  })

