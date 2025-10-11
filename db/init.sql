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
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
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
$$;
