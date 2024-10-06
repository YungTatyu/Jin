.PHONY: up, down, re

DOCKER_COMPOSE = @docker compose
COMPOSE_YML_PATH = ./docker-compose.yml
APP_DIR := ./

up:
	${DOCKER_COMPOSE} -f ${COMPOSE_YML_PATH} up -d --build app

down:
	${DOCKER_COMPOSE} -f ${COMPOSE_YML_PATH} down --rmi all --volumes --remove-orphans

re: down up
