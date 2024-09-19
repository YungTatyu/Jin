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
	cp -r ./srcs/app/backend ./srcs/lint-fmt
	cp -r ./srcs/app/frontend ./srcs/lint-fmt
	@echo "FORMAT"
	docker-compose -f ./srcs/debug_compose.yml run --name lint-container lint-format fmt
	rm -rf ./srcs/app/frontend/src/
	rm -rf ./srcs/app/backend/project/src/
	docker cp lint-container:frontend/src ./srcs/app/frontend/src/
	docker cp lint-container:backend/src ./srcs/app/backend/project/src/
	docker rm lint-container
	rm -rf ./srcs/lint-fmt/frontend
	rm -rf ./srcs/lint-fmt/backend

lint:
	cp -r ./srcs/app/backend ./srcs/lint-fmt
	cp -r ./srcs/app/frontend ./srcs/lint-fmt
	@echo "LINT"
	docker-compose -f ./srcs/debug_compose.yml run --rm lint-format lint
	rm -rf ./srcs/lint-fmt/frontend
	rm -rf ./srcs/lint-fmt/backend