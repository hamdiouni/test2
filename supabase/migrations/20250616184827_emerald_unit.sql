-- Initialize database for SLA Prediction Platform
CREATE DATABASE IF NOT EXISTS sla_prediction;

-- Create user if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'sla_user') THEN
        CREATE USER sla_user WITH PASSWORD 'sla_password';
    END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sla_prediction TO sla_user;

-- Connect to the database
\c sla_prediction;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO sla_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sla_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sla_user;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create indexes for better performance
-- These will be created by SQLAlchemy, but we can prepare them

-- Sample data insertion (optional)
-- This would be handled by the application, but we can prepare some initial data

COMMENT ON DATABASE sla_prediction IS 'SLA Violation Prediction and Anomaly Detection Platform Database';