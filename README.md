# 🚀 Enhanced SLA Prediction Admin Platform

A comprehensive, production-grade network monitoring and SLA prediction platform with AI-powered analytics, real-time anomaly detection, and green optimization capabilities.

![Platform Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![AI Powered](https://img.shields.io/badge/AI-powered-purple.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Contributing](#contributing)
- [Support](#support)

## 🎯 Overview

The Enhanced SLA Prediction Admin Platform is a next-generation network monitoring solution that combines machine learning, real-time analytics, and green optimization to provide comprehensive insights into network performance and SLA compliance.

### Key Capabilities

- **🤖 AI-Powered Predictions**: XGBoost and Random Forest models for SLA violation prediction
- **🔍 Anomaly Detection**: Isolation Forest-based real-time anomaly detection
- **🌍 Interactive Network Map**: Global network topology visualization with Leaflet.js
- **📊 Advanced Analytics**: Real-time dashboards with ApexCharts
- **🌱 Green Optimization**: Energy efficiency and carbon footprint tracking
- **📈 Bandwidth Monitoring**: Comprehensive bandwidth utilization analysis
- **📧 Smart Alerts**: Email and Telegram notifications with customizable thresholds
- **📤 Export Tools**: Multiple format data export capabilities

## ✨ Features

### 🎛️ Admin Dashboard
- **Real-time Metrics**: Live network performance monitoring
- **Risk Assessment**: ML-powered SLA violation risk scoring
- **Anomaly Detection**: Automated detection of unusual network patterns
- **Performance Analytics**: Comprehensive network performance analysis

### 🗺️ Network Visualization
- **Interactive Map**: Global network topology with 15+ nodes
- **Real-time Status**: Live node status and connection health
- **Risk Visualization**: Color-coded connections based on risk levels
- **Detailed Popups**: Comprehensive node and connection information

### 📊 Analytics & Reporting
- **SLA Analytics**: Detailed SLA compliance tracking and prediction
- **Bandwidth Monitoring**: Real-time bandwidth utilization analysis
- **Green Metrics**: Energy efficiency and carbon footprint optimization
- **Export Tools**: CSV, JSON, Excel, and PDF export capabilities

### 🔔 Alert System
- **Multi-channel Alerts**: Email and Telegram notifications
- **Customizable Thresholds**: Configurable risk and anomaly thresholds
- **Smart Routing**: Intelligent alert routing based on severity
- **Alert History**: Comprehensive alert tracking and management

### 🌱 Green Optimization
- **Energy Efficiency**: Real-time energy consumption monitoring
- **Carbon Tracking**: Carbon footprint analysis and reduction recommendations
- **Renewable Energy**: Renewable energy usage tracking
- **Optimization Recommendations**: AI-powered green path suggestions

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for development)
- Python 3.11+ (for development)

### One-Line Setup

```bash
make setup
```

This command will:
1. Build all Docker containers
2. Start all services
3. Initialize the database
4. Perform health checks

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sla-prediction-admin-platform
   ```

2. **Environment Configuration**
   ```bash
   make env-setup
   # Edit .env file with your configuration
   ```

3. **Build and Start Services**
   ```bash
   make build
   make up
   ```

4. **Access the Platform**
   - **Admin Dashboard**: http://localhost:3000
   - **API Documentation**: http://localhost:8000/docs
   - **Grafana Monitoring**: http://localhost:3001 (admin/admin)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • Admin UI      │    │ • REST API      │    │ • Telemetry     │
│ • Network Map   │    │ • ML Models     │    │ • Predictions   │
│ • Analytics     │    │ • Anomaly Det.  │    │ • User Data     │
│ • Export Tools  │    │ • Alert System  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │   ML Pipeline   │    │   InfluxDB      │
         └──────────────┤                 │◄──►│   (Time Series) │
                        │ • XGBoost       │    │                 │
                        │ • Random Forest │    │ • Metrics       │
                        │ • Isolation F.  │    │ • Analytics     │
                        │ • SHAP          │    │                 │
                        └─────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend**
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui
- ApexCharts for visualizations
- Leaflet.js for network maps
- Framer Motion for animations

**Backend**
- FastAPI with Python 3.11
- SQLAlchemy ORM
- Pydantic for validation
- XGBoost & scikit-learn for ML
- SHAP for model explainability

**Infrastructure**
- PostgreSQL for relational data
- InfluxDB for time-series data
- Redis for caching
- Nginx for reverse proxy
- Docker for containerization

## 📸 Screenshots

### Admin Dashboard
![Dashboard Overview](docs/images/dashboard-overview.png)
*Real-time network monitoring with key performance indicators*

### Network Map
![Network Topology](docs/images/network-map.png)
*Interactive global network topology with real-time status*

### Analytics
![SLA Analytics](docs/images/sla-analytics.png)
*Comprehensive SLA violation prediction and analysis*

### Green Optimization
![Green Metrics](docs/images/green-optimization.png)
*Energy efficiency and carbon footprint optimization*

## 📚 API Documentation

### Core Endpoints

#### Telemetry Management
```http
GET    /telemetry/              # List telemetry records
POST   /telemetry/              # Create telemetry record
GET    /telemetry/{id}          # Get specific record
```

#### ML Predictions
```http
POST   /predict/                # Predict SLA violation
POST   /predict-and-store/      # Predict and store
GET    /explain/{id}            # Get SHAP explanation
```

#### Anomaly Detection
```http
POST   /anomaly/                # Detect anomalies
```

#### Data Export
```http
GET    /export/sla-metrics      # Export SLA data
GET    /export/bandwidth-usage  # Export bandwidth data
```

#### System Information
```http
GET    /health                  # Health check
GET    /stats/                  # Platform statistics
GET    /models/info             # ML model information
```

### Example API Usage

**Predict SLA Violation**
```bash
curl -X POST "http://localhost:8000/predict/" \
  -H "Content-Type: application/json" \
  -d '{
    "bandwidth": 2.0,
    "throughput": 1.8,
    "congestion": 15.0,
    "packet_loss": 2.5,
    "latency": 12.0,
    "jitter": 1.2,
    "network_measure": "NYC-DC-01",
    "network_target": "LAX-DC-02"
  }'
```

**Export Data**
```bash
curl "http://localhost:8000/export/sla-metrics?format=csv" > sla_data.csv
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following configuration:

```bash
# Database Configuration
DATABASE_URL=postgresql://sla_user:sla_password@postgres:5432/sla_prediction

# InfluxDB Configuration
INFLUXDB_URL=http://influxdb:8086
INFLUXDB_TOKEN=sla-admin-token
INFLUXDB_ORG=sla-org
INFLUXDB_BUCKET=sla-metrics

# Email Alert Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com

# Telegram Alert Configuration
TELEGRAM_BOT_TOKEN=your-bot-token

# Default Alert Recipients
DEFAULT_ALERT_EMAIL=admin@company.com
DEFAULT_TELEGRAM_CHAT_ID=your-chat-id

# Frontend Configuration
VITE_API_URL=http://localhost:8000
```

### Alert Configuration

Configure email and Telegram alerts through the admin interface:

1. Navigate to **Alerts** tab
2. Enable desired notification channels
3. Set risk thresholds (default: 75%)
4. Configure recipient addresses

### ML Model Configuration

The platform uses pre-trained models with fallback capabilities:

- **SLA Predictor**: XGBoost classifier (96.8% accuracy)
- **Anomaly Detector**: Isolation Forest
- **Explainer**: SHAP TreeExplainer

## 🛠️ Development

### Local Development Setup

1. **Start Database Services**
   ```bash
   make dev
   ```

2. **Frontend Development**
   ```bash
   npm install
   npm run dev
   ```

3. **Backend Development**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

### Available Commands

```bash
make help          # Show all available commands
make build         # Build Docker containers
make up            # Start all services
make down          # Stop all services
make logs          # View service logs
make test          # Run tests
make lint          # Run code linting
make clean         # Clean up containers
make backup        # Backup database
make health        # Check service health
```

### Code Quality

The project maintains high code quality standards:

- **Frontend**: ESLint + Prettier
- **Backend**: Black + Flake8
- **Testing**: Vitest (frontend) + Pytest (backend)
- **Type Safety**: TypeScript + Pydantic

### Testing

```bash
# Run all tests
make test

# Frontend tests only
npm test

# Backend tests only
cd backend && pytest tests/ -v
```

## 🚀 Deployment

### Production Deployment

1. **Configure Production Environment**
   ```bash
   cp .env.example .env.production
   # Edit production configuration
   ```

2. **Deploy with Docker Compose**
   ```bash
   make deploy-prod
   ```

3. **Health Check**
   ```bash
   make health
   ```

### Cloud Deployment Options

**AWS**
- ECS with Fargate
- RDS for PostgreSQL
- ElastiCache for Redis
- CloudFront for CDN

**Google Cloud**
- Cloud Run for containers
- Cloud SQL for PostgreSQL
- Memorystore for Redis
- Cloud CDN

**Azure**
- Container Instances
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure CDN

### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f infra/k8s/

# Check deployment status
kubectl get pods -n sla-platform
```

## 📊 Monitoring

### Built-in Monitoring

- **Health Endpoints**: `/health` for service status
- **Metrics Endpoint**: `/stats` for platform statistics
- **Grafana Dashboard**: Advanced monitoring at port 3001

### Key Metrics

- **Performance**: API response times, throughput
- **ML Models**: Prediction accuracy, confidence scores
- **System**: CPU, memory, disk usage
- **Business**: SLA compliance, anomaly rates

### Alerting

Configure alerts for:
- High SLA violation risk (>75%)
- System anomalies
- Service downtime
- Performance degradation

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Run the test suite**: `make test`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all CI checks pass

## 📞 Support

### Getting Help

- **Documentation**: Check this README and API docs
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

### Common Issues

**Services not starting**
```bash
# Check service logs
make logs

# Restart services
make down && make up
```

**Database connection issues**
```bash
# Check database health
docker-compose exec postgres pg_isready -U sla_user

# Reset database
make clean && make up
```

**Frontend build issues**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Performance Optimization

- **Database**: Regular VACUUM and index optimization
- **Caching**: Redis for frequently accessed data
- **CDN**: Use CDN for static assets in production
- **Monitoring**: Regular performance monitoring and alerting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI**: For the excellent Python web framework
- **React**: For the powerful frontend library
- **scikit-learn**: For machine learning capabilities
- **Leaflet**: For interactive mapping
- **ApexCharts**: For beautiful data visualizations

---

**Built with ❤️ for network reliability and performance monitoring**

For more information, visit our [documentation](docs/) or check out the [API reference](http://localhost:8000/docs).