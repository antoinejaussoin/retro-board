run:
	docker build -f ./Dockerfile -t retrospected/marketing:local ./
	docker run \
		--env NEXT_PUBLIC_MEASUREMENT_ID=G-BLAH \
		--env NEXT_PUBLIC_APP_URL=http://localhost:3000 \
		-it --rm -p 3333:3000 retrospected/marketing:local