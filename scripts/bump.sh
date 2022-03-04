VERSION_TYPE="${1:-patch}"
ORIG_DIR=$(pwd)

declare -a arr=("frontend" "backend" "docs" "integration")

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


# git stash pop

cd ${ORIG_DIR}