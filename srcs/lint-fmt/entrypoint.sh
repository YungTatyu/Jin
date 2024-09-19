#!/bin/bash


set -e

if [ "$1" = "fmt" ]; then
    echo "Formatting frontend..."
    #npm install --prefix $FRONTEND_DIR
    npm run format --prefix $FRONTEND_DIR

    echo "Formatting backend..."
    cargo fmt --manifest-path $TOML_FILE


elif [ "$1" = "lint" ]; then
    echo "Linting frontend..."
    npm run lint --prefix $FRONTEND_DIR

    echo "Type-checking frontend..."
    npm run type-check --prefix $FRONTEND_DIR


    echo "Linting backend..."
    cargo clippy --manifest-path $TOML_FILE

else
    echo "Unknown command: $1"
    exit 1
fi
