.PHONY: help build build-backend build-frontend clean start dev docker-build docker-up docker-down test

help: ## Show this help message
	@echo "Knowledge Base - Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: build-backend build-frontend ## Build both backend and frontend

build-backend: ## Build the Go backend
	@echo "Building backend..."
	@cd backend && go build -o kb-server
	@echo "✅ Backend built successfully"

build-frontend: ## Build the React frontend
	@echo "Building frontend..."
	@cd frontend && npm install && npm run build
	@rm -rf static
	@cp -r frontend/dist static
	@echo "✅ Frontend built successfully"

clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	@rm -f backend/kb-server
	@rm -rf frontend/dist
	@rm -rf frontend/node_modules
	@rm -rf static
	@echo "✅ Cleaned"

start: build ## Build and start the application
	@./start.sh

dev: ## Run in development mode (with hot reload)
	@./dev.sh

docker-build: ## Build Docker image
	@echo "Building Docker image..."
	@docker build -t knowledge-base .
	@echo "✅ Docker image built"

docker-up: ## Start with Docker Compose
	@docker-compose up -d
	@echo "✅ Application started at http://localhost:33005"

docker-down: ## Stop Docker Compose
	@docker-compose down

test-api: ## Test API endpoints
	@echo "Testing API endpoints..."
	@echo ""
	@echo "1. Testing /api/files..."
	@curl -s -u admin:changeme http://localhost:33005/api/files | head -100
	@echo ""
	@echo ""
	@echo "2. Testing /api/graph..."
	@curl -s -u admin:changeme http://localhost:33005/api/graph | head -100
	@echo ""
	@echo ""
	@echo "✅ API tests completed"

.DEFAULT_GOAL := help
