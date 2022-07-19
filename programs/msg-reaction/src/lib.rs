use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;


declare_id!("27fkeXbiL7f1xJvTv4mP5XQE4gbbTdDBq8pu5qqCgBoc");

#[program]
pub mod msg_reaction {
    use super::*;

    pub fn send_tweet(ctx: Context<SendTweet>,content:String,like:u32) -> Result<()> {
        let tweet: &mut Account<Tweet> =&mut ctx.accounts.tweet;
        let author: &Signer=&ctx.accounts.author;
        let clock : i64 = (Clock::get().unwrap()).unix_timestamp;
        if content.chars().count() > 300{
            return Err(ErrorCode::TweetTooLong.into())
        }
        tweet.author=*author.key;
        tweet.time= clock;
        tweet.content=content;
        tweet.likes=like;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SendTweet<'info> {
    #[account(init,payer=author,space=Tweet::LEN)]
    pub tweet:Account<'info, Tweet>,
    #[account(mut)]
    pub author:Signer<'info>,
    #[account(address = system_program::ID)]
    /// CHECK: We don't read or write so it's okay
    pub system_program: AccountInfo<'info>,}

#[account]
pub struct Tweet {
    pub author : Pubkey,
    pub time : i64,
    pub content : String,
    pub likes : u32
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIME_LENGTH: usize = 8;
const LIKE_LENGTH: usize = 4;
const STRING_LENGTH_PREFIX: usize = 4;
const MAX_CONTENT_LENGTH: usize = 300 * 4;

impl Tweet {
    const LEN:usize=DISCRIMINATOR_LENGTH+PUBLIC_KEY_LENGTH+TIME_LENGTH+LIKE_LENGTH+STRING_LENGTH_PREFIX+MAX_CONTENT_LENGTH;
}

#[error_code]
pub enum ErrorCode {
    #[msg("The provided Tweet should be 300 characters long maximum.")]
    TweetTooLong,
}
