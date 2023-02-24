run:
	docker build -f ./Dockerfile -t retrospected/marketing:local ./
	docker run \
		--env NEXT_PUBLIC_MEASUREMENT_ID=G-BLAH \
		--env NEXT_PUBLIC_APP_URL=http://localhost:3000 \
		--env NEXT_BACKEND_SUB_DOMAIN=www-beta \
		-it --rm -p 3333:3000 retrospected/marketing:local