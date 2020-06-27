PORT?=4000

publish:
	docker build . -t antoinejaussoin/retro-board-maintenance:latest
	docker push antoinejaussoin/retro-board-maintenance:latest

run:
	docker run -p ${PORT}:80 antoinejaussoin/retro-board-maintenance:latest

multiarch:
	docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7,linux/arm/v6 -t antoinejaussoin/retro-board-maintenance:muli --push .