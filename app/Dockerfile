FROM rust:bookworm

# Install dependent packages
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

# Install solana
RUN sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:$PATH"

# Install anchor
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
RUN avm install v0.27.0

# Install yarn
RUN npm install -g yarn

# Initialize Project
WORKDIR /usr/src/
RUN anchor init project

# Install package for front-end
WORKDIR /usr/src/project/app/
RUN npm install @solana/web3.js @project-serum/anchor

# Copy front-end source code
COPY ./frontend/ /usr/src/project/app/

# Copy back-end source code
COPY ./backend/ /usr/src/project/programs/

# Build by anchor
WORKDIR /usr/src/project/
RUN anchor build

# Set the deployment destination to the local test net
RUN solana config set --url http://localhost:8899

# Generate test accounts
RUN solana-keygen new --no-bip39-passphrase

# Specify solana's local network server as the entry point
ENTRYPOINT ["/root/.local/share/solana/install/active_release/bin/solana-test-validator"]
