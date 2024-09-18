# コンテナ起動後の流れ
1. `anchor deploy` コマンドを実行。成功時にターミナルにProgramIdが表示されるのでコピー
2. `./app/sample.js` と `./programs/project/src/lib.rs` ファイル内のプログラムIDを取得したProgramIdで置換する
```
// ./app/sample.js
const PROGRAM_ID = new PublicKey('ランダム文字列'); -> const PROGRAM_ID = new PublicKey('取得したProgramId');

// ./programs/project/src/lib.rs
declare_id!("XXX..."); -> declare_id!("取得したProgramId");
```
3. `anchor build` コマンドを実行
4. `anchor deploy` コマンドを実行
5. `node app/sample.js` を複数回実行
