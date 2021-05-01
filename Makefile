TARGET_ARCHS?=linux/amd64,linux/arm64,linux/arm/v7
PACKAGE_VERSION?=local

# Use this to test Docker builds manually

# Setup Buildx on x86 systems. Don't use this on M1 Macs.
setup:
	docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
	docker buildx create --name xbuilder --use
	
build:
	docker buildx inspect --bootstrap
	docker buildx build --cache-from=antoinejaussoin/maintenance:${PACKAGE_VERSION} --pull --platform ${TARGET_ARCHS} -f ./maintenance/Dockerfile -t antoinejaussoin/maintenance:${PACKAGE_VERSION} ./maintenance
	docker buildx build --cache-from=antoinejaussoin/retro-board-backend:${PACKAGE_VERSION} --pull --platform ${TARGET_ARCHS} -f ./backend/Dockerfile -t antoinejaussoin/retro-board-backend:${PACKAGE_VERSION} .
	docker buildx build --cache-from=antoinejaussoin/retro-board-frontend:${PACKAGE_VERSION} --pull --platform ${TARGET_ARCHS} -f ./frontend/Dockerfile -t antoinejaussoin/retro-board-frontend:${PACKAGE_VERSION} .

single-build:
	docker build -f ./maintenance/Dockerfile -t antoinejaussoin/maintenance:${PACKAGE_VERSION} ./maintenance
	docker build -f ./backend/Dockerfile -t antoinejaussoin/retro-board-backend:${PACKAGE_VERSION} .
	docker build -f ./frontend/Dockerfile -t antoinejaussoin/retro-board-frontend:${PACKAGE_VERSION} .