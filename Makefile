.PHONY: up, down, re, fmt, lint

DOCKER_COMPOSE = @docker compose
COMPOSE_YML_PATH = ./srcs/docker-compose.yml
LINT_FMT_DIR := ./srcs/lint-fmt
APP_DIR := ./srcs/app
FRONTEND_DIR := $(APP_DIR)/frontend/
TOML_FILE := $(APP_DIR)/backend/project/Cargo.toml

up:
	${DOCKER_COMPOSE} -f ${COMPOSE_YML_PATH} up -d --build

down:
	${DOCKER_COMPOSE} -f ${COMPOSE_YML_PATH} down --rmi all --volumes --remove-orphans

re: down up

fmt:
	@echo "FORMAT"
	${DOCKER_COMPOSE} -f ${COMPOSE_YML_PATH} run --name lint-container lint-format fmt
	${RM} -rf $(APP_DIR)/frontend/src/
	${RM} -rf $(APP_DIR)/backend/project/src/
	docker cp lint-container:frontend/src $(APP_DIR)/frontend/src/
	docker cp lint-container:backend/src $(APP_DIR)/backend/project/src/
	docker rm lint-container

lint:
	@echo "LINT"
	${DOCKER_COMPOSE} -f ${COMPOSE_YML_PATH} run --rm lint-format lint
