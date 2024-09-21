# ベースイメージとしてRustを使用
FROM rust:latest

# Node.jsのインストール
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs

# Rustの依存関係をインストール
RUN rustup component add rustfmt clippy

# Node.jsの依存関係をコピーしてインストール
#COPY ./frontend/package*.json ./frontend/
#RUN cd frontend && npm install

# フロントエンドのソースコードをコピー
COPY ./frontend ./frontend

# バックエンドのソースコードをコピー
COPY ./backend/project ./backend

RUN npm install --prefix ./frontend
#RUN npm install -g prettier --prefix ./frontend

# コマンドを実行するシェルスクリプトを作成
COPY ./debug_tool/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
