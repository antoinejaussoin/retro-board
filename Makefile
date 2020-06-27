TARGET_ARCHS=linux/amd64

prepare:
	docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
	docker buildx create --name xbuilder --use
	docker buildx inspect --bootstrap

maintenance:
	docker buildx build --platform ${TARGET_ARCHS} -f ./retro-board-maintenance/Dockerfile -t antoinejaussoin/retro-board-maintenance:${PACKAGE_VERSION} --push ./retro-board-maintenance

backend:
	docker buildx build --platform ${TARGET_ARCHS} -f ./retro-board-server/Dockerfile -t antoinejaussoin/retro-board-backend:${PACKAGE_VERSION} --push .

frontend:
	docker buildx build --platform ${TARGET_ARCHS} -f ./retro-board-app/Dockerfile -t antoinejaussoin/retro-board-frontend:${PACKAGE_VERSION} --push .
