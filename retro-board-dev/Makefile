dev:
	docker-compose up -d

# Run this to execute the frontend in Docker, running against a locally running backend
frontend-only:
	docker build -f ./frontend/Dockerfile -t retrospected/frontend:local ./frontend
	docker-compose -f ./docker-compose.fe.yml rm -f
	docker-compose -f ./docker-compose.fe.yml up