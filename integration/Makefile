main:
	docker-compose rm -s -v -f
	docker-compose -f docker-compose.local.main.yml pull
	docker-compose -f docker-compose.local.main.yml up

local:
	docker build -f ../backend/Dockerfile -t retrospected/backend:local ../backend
	docker build -f ../frontend/Dockerfile -t retrospected/frontend:local ../frontend
	docker-compose down
	docker-compose up -d
	npm install
	npm test
	docker-compose down

local-compose:
	docker build -f ../backend/Dockerfile -t retro-backend:local ../backend
	docker build -f ../frontend/Dockerfile -t retro-frontend:local ../frontend
	docker-compose -f ./docker-compose.local.local.yml up --exit-code-from cypress
	
alpha:
	docker-compose rm -s -f -v
	docker-compose -f ./docker-compose.ci.alpha.yml pull
	docker-compose -f ./docker-compose.ci.alpha.yml up --exit-code-from cypress