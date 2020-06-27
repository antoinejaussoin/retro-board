# install:
# 	mkdir -vp ~/.docker/cli-plugins/ ~/dockercache
# 	curl --silent -L "https://github.com/docker/buildx/releases/download/${BUILDX_VER}/buildx-${BUILDX_VER}.linux-amd64" > ~/.docker/cli-plugins/docker-buildx
# 	chmod a+x ~/.docker/cli-plugins/docker-buildx

prepare:
	docker buildx create --use

backend:
	docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -f ./retro-board-server/Dockerfile -t antoinejaussoin/retro-board-backend:${PACKAGE_VERSION} --push .

frontend:
	docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v6,linux/arm/v7,linux/arm/v8 -f ./retro-board-app/Dockerfile -t antoinejaussoin/retro-board-frontend:${PACKAGE_VERSION} --push .

# https://github.com/docker/buildx/issues/156
