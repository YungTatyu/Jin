use anchor_lang::prelude::*;

// SolanaのProgram IDを指定
declare_id!("");

#[program]
pub mod counter {
    use super::*;

    // Counterを作成するAPI
    // ユーザー(authority)に紐付いた新しいCounterアカウントを作成し、初期値を0に設定
    pub fn create_counter(ctx: Context<CreateCounter>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        // カウンタの所有者（authority）の公開鍵を保存
        counter.authority = ctx.accounts.authority.key();
        // カウンタを0に初期化
        counter.count = 0;
        Ok(())
    }

    // CounterをインクリメントするAPI
    // 既存のカウンタアカウントのカウント値を1増やす処理
    pub fn update_counter(ctx: Context<UpdateCounter>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count += 1;
        Ok(())
    }
}

#[derive(Accounts)]
// CreateCounter構造体: Counterアカウントを作成するためのコンテキスト
// Counterを作成する際のアカウント情報を定義
pub struct CreateCounter<'info> {
    // authority: カウンタを作成し署名するユーザーのアカウント
    #[account(mut)]
    authority: Signer<'info>,

    // counter: 新しく作成されるカウンタアカウント
    // seedsとbumpを使って、カウンタアカウントをPDA(Program Derived Address)で生成
    #[account(
        init, // カウンタアカウントを初期化する指示
        seeds = [authority.key().as_ref()], // authorityの公開鍵を元にPDAを生成
        bump, // PDAの衝突を避けるために使用されるバンプ値
        payer = authority, // アカウント作成時の手数料を払うユーザー
        space = 100 // カウンタアカウントのメモリサイズ
    )]
    counter: Account<'info, Counter>,

    // システムプログラム(アカウント作成時に使用)
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
// UpdateCounter構造体: Counterを更新するためのコンテキスト
// Counterをインクリメントする際のアカウント情報を定義
pub struct UpdateCounter<'info> {
    // authority: カウンタの所有者(署名者)のアカウント
    authority: Signer<'info>,

    // counter: インクリメントされるカウンタアカウント
    // カウンタアカウントの所有者がauthorityであることを確認(has_one)
    #[account(mut, has_one = authority)]
    counter: Account<'info, Counter>,
}

// Counter構造体: Counterアカウントのデータ構造
// Solanaのアカウントに保存されるデータを定義
#[account]
pub struct Counter {
    // カウンタアカウントの所有者(authority)の公開鍵
    authority: Pubkey,
    // カウンタの現在の値
    count: u64,
}
