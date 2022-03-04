master:
	docker-compose -f docker-compose.ci.master.yml up --exit-code-from cypress

local:
	docker build -f ../backend/Dockerfile -t retrospected/backend:local ../backend
	docker build -f ../frontend/Dockerfile -t retrospected/frontend:local ../frontend
	docker-compose down
	docker-compose up -d
	yarn
	yarn test
	docker-compose down