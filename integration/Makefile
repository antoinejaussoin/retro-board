master:
	docker-compose rm -v -f
	docker-compose -f docker-compose.local.master.yml pull
	docker-compose -f docker-compose.local.master.yml up

local:
	docker build -f ../backend/Dockerfile -t retrospected/backend:local ../backend
	docker build -f ../frontend/Dockerfile -t retrospected/frontend:local ../frontend
	docker-compose down
	docker-compose up -d
	yarn
	yarn test
	docker-compose down