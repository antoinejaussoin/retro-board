TARGET_ARCHS?=linux/amd64,linux/arm64,linux/arm/v7
PACKAGE_VERSION?=local

# Use this to test Docker builds manually

# Setup Buildx on x86 systems. Don't use this on M1 Macs.
setup:
	docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
	docker buildx create --name xbuilder --use
	
build:
	docker buildx inspect --bootstrap
	docker buildx build --cache-from=retrospected/maintenance:${PACKAGE_VERSION} --pull --platform ${TARGET_ARCHS} -f ./maintenance/Dockerfile -t retrospected/maintenance:${PACKAGE_VERSION} ./maintenance
	docker buildx build --cache-from=retrospected/backend:${PACKAGE_VERSION} --pull --platform ${TARGET_ARCHS} -f ./backend/Dockerfile -t retrospected/backend:${PACKAGE_VERSION} ./backend
	docker buildx build --cache-from=retrospected/frontend:${PACKAGE_VERSION} --pull --platform ${TARGET_ARCHS} -f ./frontend/Dockerfile -t retrospected/frontend:${PACKAGE_VERSION} ./frontend

single-build:
	docker build -f ./maintenance/Dockerfile -t retrospected/maintenance:${PACKAGE_VERSION} ./maintenance
	docker build -f ./backend/Dockerfile -t retrospected/backend:${PACKAGE_VERSION} ./backend
	docker build -f ./frontend/Dockerfile -t retrospected/frontend:${PACKAGE_VERSION} ./frontend

local:
	docker build -f ./backend/Dockerfile -t retrospected/backend:local ./backend
	docker build -f ./frontend/Dockerfile -t retrospected/frontend:local ./frontend

marketing-build:
	docker build -f ./marketing/Dockerfile -t retrospected/marketing:local ./marketing
	docker run -it --rm -p 3333:80 retrospected/marketing:local

install-trivy:
	brew install trivy

trivy-f:
	docker build -f ./frontend/Dockerfile -t retrospected/frontend:trivy ./frontend
	trivy image retrospected/frontend:trivy --security-checks vuln

trivy-b:
	docker build -f ./backend/Dockerfile -t retrospected/backend:trivy ./backend
	trivy image retrospected/backend:trivy --security-checks vuln
	
trivy:
	docker build -f ./backend/Dockerfile -t retrospected/backend:trivy ./backend
	docker build -f ./frontend/Dockerfile -t retrospected/frontend:trivy ./frontend
	trivy image retrospected/backend:trivy --security-checks vuln
	trivy image retrospected/frontend:trivy --security-checks vuln

translate:
	crowdin push sources
	crowdin pre-translate --method=mt --engine-id=316468 -l=fr -l=nl -l=ar -l=de  -l=it -l=ja -l=uk
	crowdin download

run-local:
	docker build -f ./frontend/Dockerfile -t retrospected/frontend:local ./frontend
	docker run \
	  --env BACKEND_HOST=localhost \
    --env BACKEND_PORT=8081 \
		--env FRONTEND_SELF_HOSTED=true \
		-it --rm -p 3100:80 retrospected/frontend:local