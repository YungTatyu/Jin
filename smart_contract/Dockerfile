FROM rust:latest

# TODO 完成時には `rm -rf /var/lib/apt/lists/*` の処理を入れるべき
RUN apt-get update && \
	apt-get install -y \
	build-essential \
	pkg-config \
	libudev-dev \
	llvm \
	libclang-dev \
	protobuf-compiler \
	libssl-dev

# solanaのインストール
RUN sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:$PATH"

# anchorのインストール
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force && \
	avm install v0.27.0

# TODO ENTRYPOINTをスマートコントラクタのビルド AND デプロイに変更?
ENTRYPOINT ["/bin/bash"]
