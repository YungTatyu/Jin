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
	cp -r ./srcs/app/backend ./srcs/debug
	cp -r ./srcs/app/frontend ./srcs/debug
	@echo "FORMAT"
	docker-compose -f ./srcs/debug_compose.yml run --name lint-container lint-format fmt
	rm -rf ./srcs/app/frontend/src/
	rm -rf ./srcs/app/backend/project/src/
	docker cp lint-container:frontend/src ./srcs/app/frontend/src/
	docker cp lint-container:backend/src ./srcs/app/backend/project/src/
	rm -rf ./srcs/debug/frontend
	rm -rf ./srcs/debug/backend

lint:
	cp -r ./srcs/app/backend ./srcs/debug
	cp -r ./srcs/app/frontend ./srcs/debug
	@echo "LINT"
	docker-compose -f ./srcs/debug_compose.yml run --rm lint-format lint
	rm -rf ./srcs/debug/frontend
	rm -rf ./srcs/debug/backend


# fmt:
# 	@echo "FORMAT"
# 	npm run format --prefix $(FRONTEND_DIR)
# 	@echo ""
# 	cargo fmt --manifest-path $(TOML_FILE)

# lint:
# 	@echo "LINT"
# 	npm run lint --prefix $(FRONTEND_DIR)
# 	@echo ""
# 	@echo "TYPE-CHECK"
# 	npm run type-check --prefix $(FRONTEND_DIR)
# 	@echo ""
# 	cargo clippy --manifest-path $(TOML_FILE)