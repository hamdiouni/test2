# Enhanced SLA Prediction Platform Makefile
.PHONY: help build up down logs clean install dev test lint format

# Default target
help:
	@echo "Enhanced SLA Prediction Platform - Available Commands:"
	@echo ""
	@echo "  make build     - Build all Docker containers"
	@echo "  make up        - Start all services"
	@echo "  make down      - Stop all services"
	@echo "  make logs      - View logs from all services"
	@echo "  make clean     - Clean up containers and volumes"
	@echo "  make install   - Install frontend dependencies"
	@echo "  make dev       - Start development environment"
	@echo "  make test      - Run tests"
	@echo "  make lint      - Run linting"
	@echo "  make format    - Format code"
	@echo "  make backup    - Backup database"
	@echo "  make restore   - Restore database"
	@echo ""

# Docker operations
build:
	@echo "Building Docker containers..."
	docker-compose build --no-cache

up:
	@echo "Starting all services..."
	docker-compose up -d
	@echo "Services started. Access the application at:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend API: http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/docs"
	@echo "  Grafana: http://localhost:3001 (admin/admin)"

down:
	@echo "Stopping all services..."
	docker-compose down

logs:
	@echo "Viewing logs..."
	docker-compose logs -f

clean:
	@echo "Cleaning up containers and volumes..."
	docker-compose down -v --remove-orphans
	docker system prune -f

# Development operations
install:
	@echo "Installing frontend dependencies..."
	npm install

dev:
	@echo "Starting development environment..."
	docker-compose up -d postgres influxdb redis
	@echo "Database services started. Now run:"
	@echo "  Frontend: npm run dev"
	@echo "  Backend: cd backend && uvicorn app.main:app --reload"

test:
	@echo "Running tests..."
	npm test
	cd backend && python -m pytest tests/ -v

lint:
	@echo "Running linting..."
	npm run lint
	cd backend && flake8 app/ --max-line-length=100

format:
	@echo "Formatting code..."
	npm run format || echo "No format script found"
	cd backend && black app/ || echo "Black not installed"

# Database operations
backup:
	@echo "Creating database backup..."
	docker-compose exec postgres pg_dump -U sla_user sla_prediction > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup created: backup_$(shell date +%Y%m%d_%H%M%S).sql"

restore:
	@echo "Restoring database from backup..."
	@read -p "Enter backup file name: \" backup_file; \
	docker-compose exec -T postgres psql -U sla_user sla_prediction < $$backup_file

# Health checks
health:
	@echo "Checking service health..."
	@curl -s http://localhost:8000/health | jq '.' || echo "Backend not responding"
	@curl -s http://localhost:3000 > /dev/null && echo "Frontend: OK" || echo "Frontend: Not responding"

# Quick setup for new users
setup:
	@echo "Setting up Enhanced SLA Prediction Platform..."
	@echo "1. Building containers..."
	make build
	@echo "2. Starting services..."
	make up
	@echo "3. Waiting for services to be ready..."
	sleep 30
	@echo "4. Checking health..."
	make health
	@echo ""
	@echo "Setup complete! Access the application at http://localhost:3000"

# Production deployment
deploy-prod:
	@echo "Deploying to production..."
	@echo "WARNING: This will deploy to production environment!"
	@read -p "Are you sure? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d; \
	else \
		echo "Deployment cancelled."; \
	fi

# Monitoring
monitor:
	@echo "Opening monitoring dashboard..."
	@echo "Grafana: http://localhost:3001"
	@echo "API Metrics: http://localhost:8000/stats"
	@echo "System Health: http://localhost:8000/health"

# Data operations
seed-data:
	@echo "Seeding database with sample data..."
	docker-compose exec backend python -c "from app.database import create_tables; create_tables()"
	@echo "Sample data seeded successfully"

export-data:
	@echo "Exporting data..."
	curl -s "http://localhost:8000/export/sla-metrics?format=csv" > sla_metrics_export.csv
	curl -s "http://localhost:8000/export/bandwidth-usage?format=csv" > bandwidth_usage_export.csv
	@echo "Data exported to CSV files"

# Documentation
docs:
	@echo "Opening documentation..."
	@echo "API Documentation: http://localhost:8000/docs"
	@echo "ReDoc: http://localhost:8000/redoc"

# Environment setup
env-setup:
	@echo "Setting up environment variables..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env file from template. Please edit it with your configuration."; \
	else \
		echo ".env file already exists."; \
	fi

# Security scan
security-scan:
	@echo "Running security scan..."
	docker run --rm -v $(PWD):/app securecodewarrior/docker-security-scan /app

# Performance test
perf-test:
	@echo "Running performance tests..."
	@echo "This requires Apache Bench (ab) to be installed"
	ab -n 1000 -c 10 http://localhost:8000/health

# Update dependencies
update-deps:
	@echo "Updating dependencies..."
	npm update
	cd backend && pip install --upgrade -r requirements.txt

# Show system status
status:
	@echo "System Status:"
	@echo "=============="
	@docker-compose ps
	@echo ""
	@echo "Resource Usage:"
	@echo "==============="
	@docker stats --no-stream