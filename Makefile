.PHONY: help install dev dev-frontend dev-backend test lint format seed clean docker-up docker-down

# Default target
help:
	@echo "FalcoElectrec - Available Commands"
	@echo "==================================="
	@echo ""
	@echo "Development:"
	@echo "  make install      - Install all dependencies (frontend + backend)"
	@echo "  make dev          - Run both frontend and backend in development mode"
	@echo "  make dev-frontend - Run frontend only"
	@echo "  make dev-backend  - Run backend only"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make test         - Run all tests"
	@echo "  make test-backend - Run backend tests only"
	@echo "  make lint         - Run linters on all code"
	@echo "  make format       - Format all code"
	@echo ""
	@echo "Database:"
	@echo "  make seed         - Seed database with initial data"
	@echo "  make migrate      - Run database migrations"
	@echo "  make db-reset     - Reset database (WARNING: deletes all data)"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up    - Start all services with Docker Compose"
	@echo "  make docker-down  - Stop all Docker services"
	@echo "  make docker-build - Build Docker images"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean        - Remove build artifacts and caches"

# Installation
install:
	cd frontend && npm install
	cd backend && pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

install-backend:
	cd backend && pip install -r requirements.txt

# Development
dev:
	@echo "Starting development servers..."
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:5000"
	@make -j2 dev-frontend dev-backend

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && flask run --reload --port 5000

# Testing
test: test-backend
	@echo "All tests passed!"

test-backend:
	cd backend && python -m pytest tests/ -v

test-frontend:
	cd frontend && npm test

# Linting
lint: lint-frontend lint-backend

lint-frontend:
	cd frontend && npm run lint

lint-backend:
	cd backend && ruff check .
	cd backend && mypy . --ignore-missing-imports

# Formatting
format: format-frontend format-backend

format-frontend:
	cd frontend && npx prettier --write "src/**/*.{ts,tsx,css}"

format-backend:
	cd backend && black .
	cd backend && ruff check --fix .

# Database
migrate:
	cd backend && flask db upgrade

migrate-new:
	cd backend && flask db migrate -m "$(MSG)"

seed:
	cd backend && python seed.py

db-reset:
	cd backend && flask db downgrade base
	cd backend && flask db upgrade
	cd backend && python seed.py

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker-compose build

docker-logs:
	docker-compose logs -f

# Cleanup
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	rm -rf frontend/dist 2>/dev/null || true
	rm -rf backend/*.db 2>/dev/null || true
