TARGET_ARCHS?=linux/amd64,linux/arm64,linux/arm/v7
BUILDX_VERSION?=v0.4.1
PACKAGE_VERSION?=local

# Use this to test Docker builds manually

build:
	docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
	docker buildx create --node xbuilder --use
	docker buildx inspect --bootstrap
	docker buildx build --cache-from=antoinejaussoin/retro-board-maintenance:${PACKAGE_VERSION} --pull --platform ${TARGET_ARCHS} -f ./retro-board-maintenance/Dockerfile -t antoinejaussoin/retro-board-maintenance:${PACKAGE_VERSION} ./retro-board-maintenance
	docker buildx build --cache-from=antoinejaussoin/retro-board-backend:${PACKAGE_VERSION} --pull --platform ${TARGET_ARCHS} -f ./retro-board-server/Dockerfile -t antoinejaussoin/retro-board-backend:${PACKAGE_VERSION} .
	docker buildx build --cache-from=antoinejaussoin/retro-board-frontend:${PACKAGE_VERSION} --pull --platform ${TARGET_ARCHS} -f ./retro-board-app/Dockerfile -t antoinejaussoin/retro-board-frontend:${PACKAGE_VERSION} .