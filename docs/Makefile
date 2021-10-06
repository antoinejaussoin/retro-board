build-container:
	docker build -t retrodoc .

run: build-container
	docker run -p 5100:80 retrodoc
