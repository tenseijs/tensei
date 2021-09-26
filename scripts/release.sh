set -e
set -u

if [[ -z "${TENSEI_PACKAGE_VERSION}" ]]; then
  echo "You must set the TENSEI_PACKAGE_VERSION environment variable before publishing a release."
  exit 1
else
  echo "Publishing version ${TENSEI_PACKAGE_VERSION}"
fi

git add .
git commit -m "chore(release): publish v${TENSEI_PACKAGE_VERSION}" --allow-empty
yarn build
yarn lerna publish "$@"
