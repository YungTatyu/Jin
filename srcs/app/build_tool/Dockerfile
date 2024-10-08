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

# Install solana appropriately depending on CPU architecture
RUN ARCH=$(uname -m) && \
	if [ "$ARCH" = "x86_64" ]; then \
	sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)" && \
	cp /root/.local/share/solana/install/active_release/bin/solana-test-validator /usr/local/bin/; \
	elif [ "$ARCH" = "aarch64" ]; then \
	git clone https://github.com/solana-labs/solana.git && \
	cd solana && \
	cargo build --release && \
	cp /solana/target/release/solana-test-validator /usr/local/bin/ && \
	cp -r /solana/sdk /solana/target/release/; \
	else \
	echo "Unsupported architecture: $ARCH"; \
	exit 1; \
	fi

# Pass for x86_86 and arm
ENV PATH="/solana/target/release:/root/.local/share/solana/install/active_release/bin:$PATH"

# Install anchor
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
RUN avm install 0.27.0

# Install yarn
RUN npm install -g yarn

# Initialize Project
WORKDIR /usr/src/
RUN anchor init project


# Copy back-end source code
COPY ./backend/project/ /usr/src/project/programs/project/
COPY ./backend/Anchor.toml /usr/src/project/Anchor.toml
RUN rm /usr/src/project/tests/project.ts
COPY ./backend/tests/ /usr/src/project/tests/

# Build by anchor
WORKDIR /usr/src/project/
RUN anchor build


WORKDIR /usr/src/
# Files to run in the container
COPY ./build_tool/replace_program_id.sh ./replace_program_id.sh
RUN chmod +x ./replace_program_id.sh
COPY ./build_tool/Makefile ./Makefile
COPY ./build_tool/replace ./replace
COPY ./build_tool/grep.py ./grep.py

# Set the deployment destination to the local test net
RUN solana config set --url https://api.devnet.solana.com

# Generate test accounts
RUN solana-keygen new --no-bip39-passphrase

# Expose the port that Next.js runs on
EXPOSE 3000

# Copy front-end source code
COPY ./frontend/ /usr/src/project/app/

# Go to the directory of the copied Next.js project and install the dependencies listed in package.json.
WORKDIR /usr/src/project/app/
RUN npm install

# Build Next.js app
WORKDIR /usr/src/project/app/
RUN npm run build


# Install package for front-end
RUN npm install @solana/web3.js @project-serum/anchor

# Specify solana's local network server as the entry point
ENTRYPOINT ["/usr/local/bin/solana-test-validator"]
