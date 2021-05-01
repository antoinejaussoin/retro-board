PORT?=4000

publish:
	docker build . -t antoinejaussoin/retro-board-maintenance:latest
	docker push antoinejaussoin/retro-board-maintenance:latest

run:
	docker run -p ${PORT}:80 antoinejaussoin/retro-board-maintenance:latest
