TARGET_ARCHS?=linux/amd64,linux/arm/v7
BUILDX_VERSION?=v0.4.1
PACKAGE_VERSION?=local

# This is used by Travis to install Docker & Buildx

install:
	curl -fsSL https://get.docker.com | sh
	echo '{"experimental":"enabled"}' | sudo tee /etc/docker/daemon.json
	mkdir -p ~/.docker
	echo '{"experimental":"enabled"}' | sudo tee ~/.docker/config.json
	sudo service docker start
	docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
	docker buildx create --name xbuilder --use
	docker buildx inspect --bootstrap
