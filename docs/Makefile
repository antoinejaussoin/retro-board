build-container:
	docker build -t retrodoc .

build-no-cache:
	docker build --no-cache -t retrodoc .

run: build-container
	docker run -p 5100:80 retrodoc
