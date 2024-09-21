# 実行について
1. ローカルでMakeを実行し、コンテナを生成
2. 生成したコンテナに入る(docker exec -it app bash)
3. Makeします。
5. これにより、anchorとnext.jsがそれぞれ起動します。*現段階ではまだ２つはつながっていない

# 開発ワークフロー指示

## コンテナ内でのバグ修正について

1. コンテナ内で`Make`コマンドを実行中にバグを発見した場合:
   - コンテナから抜けてください。
   - ローカル環境で修正を行ってください。

## 1での重要な注意事項
- `replace_program_id.sh`スクリプトの実行について:
  - このスクリプトはファイル内の文字列置換を行います。
  - この処理はコンテナ生成時に1回のみ実行可能です。
  - 再実行はできないため、注意が必要です。

## replace_program_id.shで置き換える必要のあるファイルでの注意点
Makefileと同階層にある replace_program_id.sh の中で置き換えるファイルを書く必要がある。これから開発をしていく中で順次追加していきましょう。
置き換えるファイルの文字列の部分は "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS" にしておく必要があります。
rust
```rs
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
```

typescript, javascript
```ts
const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');
```

## 推奨ワークフロー

1. コンテナ生成
2. コンテナに入る
3. Makeする
4. 挙動確認
5. バグなどがあれば、コンテナ内で作業せず、コンテナから抜ける
6. ローカルで修正
7. 修正後、改めて、コンテナを生成
