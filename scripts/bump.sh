VERSION_TYPE="${1:-patch}"
ORIG_DIR=$(pwd)

declare -a arr=("frontend" "docs" "integration" "marketing")

npm config set git-tag-version false
npm config set commit-hooks false

# git stash

cd ./scripts

for dir in "${arr[@]}"
do
	cd ../${dir}
	echo npm version ${VERSION_TYPE}
	npm version ${VERSION_TYPE}
done

cd ../
echo npm version ${VERSION_TYPE}
npm version ${VERSION_TYPE}

VERSION=$(node -p "require('./package.json').version")
echo "cargo version ${VERSION}"
node -e '
const fs = require("fs");
const version = process.argv[1];
const manifestPath = "backend/Cargo.toml";
const lockPath = "backend/Cargo.lock";
const manifest = fs.readFileSync(manifestPath, "utf8");
const lock = fs.readFileSync(lockPath, "utf8");
const workspaceVersion = /(\[workspace\.package\][\s\S]*?^version = )"[^"]+"/m;
const packageVersion = /(name = "retrospected-(?:migrations|server)"\nversion = )"[^"]+"/g;
if (!workspaceVersion.test(manifest)) {
  console.error("Could not find the Rust workspace version in backend/Cargo.toml");
  process.exit(1);
}
const updatedLock = lock.replace(packageVersion, `$1"${version}"`);
if (updatedLock === lock) {
  console.error("Could not find the Rust package versions in backend/Cargo.lock");
  process.exit(1);
}
fs.writeFileSync(manifestPath, manifest.replace(workspaceVersion, `$1"${version}"`));
fs.writeFileSync(lockPath, updatedLock);
' "${VERSION}" || exit 1

# git stash pop

cd ${ORIG_DIR}
