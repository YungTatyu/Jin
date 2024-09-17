FROM rust:latest

# solana, anchorインストール時の依存パッケージをインストール
RUN apt-get update && \
	apt-get install -y \
	build-essential \
	pkg-config \
	libudev-dev \
	llvm \
	libclang-dev \
	protobuf-compiler \
	libssl-dev \
	npm && \
	rm -rf /var/lib/apt/lists/*

# solanaのインストール
RUN sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
ENV PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# anchorのインストール
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
RUN avm install v0.27.0

# yarnのインストール
RUN npm install -g yarn

# ホスト側のソースコードと設定ファイルをCOPY
COPY ./backend /usr/src/backend/

# フロントエンドにsolana, anchorのパッケージをインストール
WORKDIR /usr/src/backend/app/
RUN npm install @solana/web3.js @project-serum/anchor

# ビルド
# WORKDIR /usr/src/backend
# RUN anchor build

# accountの作成
# RUN solana-keygen new --no-bip39-passphrase

# デフォルトのdeploy先をローカルのテストネットに設定
# RUN solana config set --url http://localhost:8899

# ENTRYPOINTになるスクリプトを準備
# COPY ./tools/entrypoint.sh /usr/bin/entrypoint.sh
# RUN chmod +x /usr/bin/entrypoint.sh
# ENTRYPOINT ["/usr/bin/entrypoint.sh"]
