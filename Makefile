backend-multiarch:
	docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -f ./retro-board-server/Dockerfile -t antoinejaussoin/retro-board-backend:multi --push .

frontend-multiarch:
	docker buildx build -t antoinejaussoin/retro-board-frontend:m1 -f ./retro-board-app/Dockerfile.build . --load
	# docker push antoinejaussoin/retro-board-frontend:tmp
	docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -f ./retro-board-app/Dockerfile.serve -t antoinejaussoin/retro-board-frontend:multi --push .

frontend2:
	docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -f ./retro-board-app/Dockerfile -t antoinejaussoin/retro-board-frontend:multi --push .

# https://github.com/docker/buildx/issues/156
