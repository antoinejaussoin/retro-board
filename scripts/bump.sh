VERSION_TYPE="${1:-patch}"
ORIG_DIR=$(pwd)

declare -a arr=("frontend" "backend" "common")

for dir in "${arr[@]}"
do
	cd ../${dir}
	echo npm version ${VERSION_TYPE}
	npm version ${VERSION_TYPE}
done

cd ../
echo npm version ${VERSION_TYPE}
npm version ${VERSION_TYPE}

cd ${ORIG_DIR}