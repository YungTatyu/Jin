.PHONY: all deploy build dev start

ANCHOR_DEPLOY = anchor deploy
ANCHOR_BUILD = anchor build
NEXT_DEV = npx next dev -p 3000
NEXT_START = npx next start -p 3000

all: deploy build start-dev

deploy:
	cd project && \
	$(ANCHOR_DEPLOY) > ../anchor_id.txt && \
	cd .. && \
	python3 grep.py && \
	./replace_program_id.sh

build:
	cd project && \
	$(ANCHOR_BUILD) && \
	$(ANCHOR_DEPLOY)

start-dev:
	cd project/app && \
	$(NEXT_DEV)

start-prod:
	cd project/app && \
	$(NEXT_START)

backend-test: deploy build
	solana-keygen new --no-bip39-passphrase -o /root/.config/solana/id2.json && \
	solana airdrop 1 /root/.config/solana/id2.json && \
	node /usr/src/project/app/sample/test.js
