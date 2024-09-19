.PHONY: up, down, re, fmt, lint

DOCKER_COMPOSE = @docker compose
COMPOSE_YML_PATH = ./srcs/docker-compose.yml
# フロントエンドのディレクトリを指定
FRONTEND_DIR := ./srcs/app/frontend/
TOML_FILE := ./srcs/app/backend/project/Cargo.toml

up:
	${DOCKER_COMPOSE} -f ${COMPOSE_YML_PATH} up -d --build

down:
	${DOCKER_COMPOSE} -f ${COMPOSE_YML_PATH} down --rmi all --volumes --remove-orphans

re: down up

fmt:
	@echo "FORMAT"
	npm run format --prefix $(FRONTEND_DIR)
	@echo ""
	cargo fmt --manifest-path $(TOML_FILE)

lint:
	@echo "LINT"
	npm run lint --prefix $(FRONTEND_DIR)
	@echo ""
	@echo "TYPE-CHECK"
	npm run type-check --prefix $(FRONTEND_DIR)
	@echo ""
	cargo clippy --manifest-path $(TOML_FILE)