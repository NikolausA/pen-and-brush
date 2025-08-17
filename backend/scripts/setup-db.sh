#!/bin/bash

set -e

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-user}
DB_PASSWORD=${DB_PASSWORD:-password}
DB_NAME=${DB_NAME:-graphic_editor}

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

if ! command_exists psql; then
    echo -e "${RED}Error: psql is not installed or not found in PATH. Please install PostgreSQL.${NC}"
    exit 1
fi

execute_psql() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "$1"
}

echo -e "${GREEN}Starting database setup for Graphic Editor...${NC}"

echo "Creating database '$DB_NAME'..."
if ! execute_psql "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
    execute_psql "CREATE DATABASE $DB_NAME;"
    echo -e "${GREEN}Database '$DB_NAME' created successfully.${NC}"
else
    echo -e "${GREEN}Database '$DB_NAME' already exists, skipping creation.${NC}"
fi

echo "Creating tables in '$DB_NAME'..."

cat <<EOF | PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: Project
CREATE TABLE IF NOT EXISTS "Project" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Layer
CREATE TABLE IF NOT EXISTS "Layer" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    opacity FLOAT DEFAULT 100.0,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES "Project"(id) ON DELETE CASCADE
);

-- Table: History
CREATE TABLE IF NOT EXISTS "History" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    layer_id UUID,
    action VARCHAR(255) NOT NULL,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES "Project"(id) ON DELETE CASCADE,
    FOREIGN KEY (layer_id) REFERENCES "Layer"(id) ON DELETE SET NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_layer_project_id ON "Layer"(project_id);
CREATE INDEX IF NOT EXISTS idx_history_project_id ON "History"(project_id);
CREATE INDEX IF NOT EXISTS idx_history_layer_id ON "History"(layer_id);

-- Update timestamps on row update
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
\$\$ language 'plpgsql';

DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_timestamp_project') THEN
        CREATE TRIGGER update_timestamp_project
        BEFORE UPDATE ON "Project"
        FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_timestamp_layer') THEN
        CREATE TRIGGER update_timestamp_layer
        BEFORE UPDATE ON "Layer"
        FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_timestamp_history') THEN
        CREATE TRIGGER update_timestamp_history
        BEFORE UPDATE ON "History"
        FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    END IF;
END
\$\$;
EOF

echo -e "${GREEN}Tables created successfully in '$DB_NAME'.${NC}"

echo -e "${GREEN}Database setup completed successfully!${NC}"