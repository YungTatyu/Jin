# ビルドステージ
FROM rust:latest AS build

RUN apt-get update && \
	apt-get install -y \
	build-essential \
	pkg-config \
	libudev-dev \
	llvm \
	libclang-dev \
	protobuf-compiler \
	libssl-dev

# ここうまくいかない。バージョン(stable)を変えると上手くいく
RUN sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# ここをコンテナ内にinstallされたsolana-CLIの適切なパスに変換する
RUN export PATH="/root/.local/share/solana/install/active_release/bin:$PATH"

WORKDIR /usr/src/myapp
COPY . .
RUN cargo install --path .

FROM rust:latest AS production
COPY --from=build /usr/src/myapp/target/release/smart_contract /usr/local/bin
ENTRYPOINT ["/usr/local/bin/smart_contract"]
