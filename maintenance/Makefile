PORT?=4000

publish:
	docker build . -t antoinejaussoin/maintenance:latest
	docker push antoinejaussoin/maintenance:latest

run:
	docker run -p ${PORT}:80 antoinejaussoin/maintenance:latest
