# ベースイメージとしてNode.jsを使用
FROM node:latest


# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
#COPY package*.json ./
COPY . .

# 依存関係をインストール
RUN npm install

# アプリケーションをビルド
RUN npm run build

# ポート3000を公開
EXPOSE 3000

# アプリケーションを起動
CMD ["npx", "next", "dev"]