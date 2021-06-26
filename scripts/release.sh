set -e

yarn before:release "$@"
git add .
git commit -m "chore(release): publish `node -p 'require(\"./lerna.json\").version'`"
# yarn lerna publish "$@"
