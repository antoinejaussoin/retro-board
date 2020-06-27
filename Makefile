BUILDX_VER=v0.4.1


# install:
# 	mkdir -vp ~/.docker/cli-plugins/ ~/dockercache
# 	curl --silent -L "https://github.com/docker/buildx/releases/download/${BUILDX_VER}/buildx-${BUILDX_VER}.linux-amd64" > ~/.docker/cli-plugins/docker-buildx
# 	chmod a+x ~/.docker/cli-plugins/docker-buildx

install:
	mkdir -vp ~/.docker/cli-plugins/ ~/dockercache
	curl --silent -L "https://github.com/docker/buildx/releases/download/${BUILDX_VER}/buildx-${BUILDX_VER}.linux-amd64" > ~/.docker/cli-plugins/docker-buildx
	chmod a+x ~/.docker/cli-plugins/docker-buildx

prepare:
	# docker buildx create --name mbuilder
	# docker buildx use mbuilder
	# docker buildx inspect --bootstrap
	docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
  docker buildx create --name xbuilder --use
	docker buildx inspect --bootstrap

backend:
	docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -f ./retro-board-server/Dockerfile -t antoinejaussoin/retro-board-backend:${PACKAGE_VERSION} --push .

frontend:
	docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v6,linux/arm/v7 -f ./retro-board-app/Dockerfile -t antoinejaussoin/retro-board-frontend:${PACKAGE_VERSION} --push .

# https://github.com/docker/buildx/issues/156
# https://tech.smartling.com/building-multi-architecture-docker-images-on-arm-64-c3e6f8d78e1c
# https://github.com/jdrouet/docker-on-ci/blob/master/Makefile