-- Standard User Management
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    password_hash TEXT NOT NULL, -- Keep this for basic login
    created_at TIMESTAMP DEFAULT NOW()
);

-- Dashboards Container
CREATE TABLE IF NOT EXISTS dashboards (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by BIGINT REFERENCES users(id),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Collaborative Permissions
CREATE TABLE IF NOT EXISTS dashboard_collaborators (
    dashboard_id BIGINT REFERENCES dashboards(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'viewer', -- 'viewer', 'editor', 'admin'
    PRIMARY KEY (dashboard_id, user_id)
);

-- The Core Widget Table
CREATE TABLE IF NOT EXISTS widgets (
    id BIGSERIAL PRIMARY KEY,
    dashboard_id BIGINT REFERENCES dashboards(id) ON DELETE CASCADE,
    created_by BIGINT REFERENCES users(id),
    
    -- Layout & Queuing
    layout_offset INTEGER NOT NULL, -- The order in the queue
    layout_width INTEGER NOT NULL, -- e.g., 1 to 12 (grid system)
    
    -- Extensible Definitions
    -- 'API' or 'LOCAL' (or future 'SQL', 'WEBSOCKET')
    source_type VARCHAR(50) NOT NULL, 
    
    -- 'CALENDAR' or 'DATA_WIDGET' (or future 'CHART', 'TABLE')
    sink_type VARCHAR(50) NOT NULL,
    
    -- Stores configuration for HOW to fetch/parse (URL, parsing logic, or local keys)
    source_config JSONB NOT NULL,
    
    -- Stores configuration for HOW to display (Image keys, date keys)
    sink_config JSONB NOT NULL,
    
    -- User Input Configuration (If the widget accepts input, how is it handled?)
    input_config JSONB DEFAULT '{}',

    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Storage for "Local" Data Sources
-- If a widget source_type is 'LOCAL', it reads/writes here.
CREATE TABLE IF NOT EXISTS widget_local_store (
    id BIGSERIAL PRIMARY KEY,
    widget_id BIGINT REFERENCES widgets(id) ON DELETE CASCADE,
    data_key VARCHAR(255) NOT NULL,
    data_value JSONB, -- JSONB allows storing strings, numbers, or objects
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (widget_id, data_key) -- Ensure unique keys per widget
);
