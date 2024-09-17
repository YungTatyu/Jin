FROM rust:bookworm

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
	npm \
	vim && \
	rm -rf /var/lib/apt/lists/*

# solanaのインストール
RUN sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:$PATH"

# anchorのインストール
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
RUN avm install v0.27.0

# yarnのインストール
RUN npm install -g yarn

# projectのinit
WORKDIR /usr/src/
RUN anchor init project

# フロントエンドにsolana, anchorのパッケージをインストール
WORKDIR /usr/src/project/app/
RUN npm install @solana/web3.js @project-serum/anchor

# ホスト側のソースコードと設定ファイルをCOPY
COPY ./frontend/ /usr/src/project/app/
COPY ./backend/ /usr/src/project/programs/

# ビルド
WORKDIR /usr/src/project/
RUN anchor build

# デフォルトのdeploy先をローカルのテストネットに設定
RUN solana config set --url http://localhost:8899

# accountの作成
RUN solana-keygen new --no-bip39-passphrase

# solanaのローカルネットワークのサーバ
ENTRYPOINT ["/root/.local/share/solana/install/active_release/bin/solana-test-validator"]
