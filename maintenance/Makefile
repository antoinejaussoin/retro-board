PORT?=4000

publish:
	docker build . -t retrospected/maintenance:latest
	docker push retrospected/maintenance:latest

run:
	docker run -p ${PORT}:80 retrospected/maintenance:latest
