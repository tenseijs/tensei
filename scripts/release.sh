set -e

yarn before:release "$@"
yarn lerna publish "$@"
