# コンテナ起動後の流れ

1. コンテナ内でMakeをするだけで動くようにしました。
2. Makefileの中で "replace_program_id.sh" を実行している。
さらにその中でreplace.rsをコンパイルし、その実行ファイルを使って、program_idが必要な部分だけ置き換えています。
<注意点>
1. replace_program_id.sh の中で置き換えるファイルを書く必要がある。これから開発をしていく中で順次追加していきましょう。
2. 置き換えるファイルの文字列の部分は空にしておく必要があります。
rust
```rs
declare_id!("");
```

typescript, javascript
```ts
const PROGRAM_ID = new PublicKey('');
```