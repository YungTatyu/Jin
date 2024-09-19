#!/bin/bash


set -e

err() {
  echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')]: $*" >&2
}

main() {
  local cmd="$1"
  if [[ ${cmd} != "fmt" && ${cmd} != "lint" ]]; then
    err "unknown command"
    return 1
  fi
  if [ "${cmd}" = "fmt" ]; then
    echo "Formatting frontend..."
    npm run format --prefix ${FRONTEND_DIR}

    echo "Formatting backend..."
    cargo fmt --manifest-path ${TOML_FILE}

  elif [ "${cmd}" = "lint" ]; then
    echo "Linting backend..."
    cargo clippy --manifest-path ${TOML_FILE} || return 1
    echo "Compile backend..."
    cargo check --manifest-path ${TOML_FILE} || return 1

    echo "Linting frontend..."
    npm run lint --prefix ${FRONTEND_DIR} || return 1

    echo "Type-checking frontend..."
    npm run type-check --prefix ${FRONTEND_DIR} || return 1

    echo "Compile check..."
    cd $FRONTEND_DIR
    npx next build
  fi
  return 0
}

main "$@"


# if [ "$1" = "fmt" ]; then
#     echo "Formatting frontend..."
#     #npm install --prefix $FRONTEND_DIR
#     npm run format --prefix $FRONTEND_DIR

#     echo "Formatting backend..."
#     cargo fmt --manifest-path $TOML_FILE


# elif [ "$1" = "lint" ]; then
#     echo "Linting frontend..."
#     npm run lint --prefix $FRONTEND_DIR

#     echo "Type-checking frontend..."
#     npm run type-check --prefix $FRONTEND_DIR


#     echo "Linting backend..."
#     cargo clippy --manifest-path $TOML_FILE

#     echo "Compile check..."
#     cd $FRONTEND_DIR
#     npx next build
# else
#     echo "Unknown command: $1"
#     exit 1
# fi
