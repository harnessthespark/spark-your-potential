-- Spark Your Potential Database Schema
-- PostgreSQL

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    subscription_tier VARCHAR(50) DEFAULT 'free', -- free, spark_session, full_programme
    subscription_expires_at TIMESTAMP
);

-- ============================================
-- BLUEPRINTS TABLE (Core data from Spark Your Potential)
-- ============================================
CREATE TABLE blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Core Identity
    name VARCHAR(255),
    core_pattern TEXT,
    thread TEXT,
    
    -- Positioning Statement Components
    role_identity VARCHAR(255),        -- "Creative Catalyst"
    what_you_do TEXT,                   -- "unlocks creative potential"
    who_you_serve TEXT,                 -- "clients and teams that have forgotten..."
    unique_approach TEXT,               -- "connect creativity with commercial reality"
    background TEXT,                    -- "15 years helping brands like Nike..."
    where_heading TEXT,                 -- "seeking roles where I can transform..."
    
    -- Full positioning statement (generated)
    positioning_statement TEXT,
    
    -- Evidence (stored as JSON arrays)
    evidence JSONB DEFAULT '[]',        -- [{company, description, result}]
    belief_moments JSONB DEFAULT '[]',  -- [{title, story}]
    
    -- Deal-breakers
    red_flags JSONB DEFAULT '[]',       -- [{flag, description}]
    green_flags JSONB DEFAULT '[]',     -- [{flag, description}]
    
    -- Raw questionnaire responses (for regeneration)
    questionnaire_responses JSONB,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    version INTEGER DEFAULT 1
);

-- ============================================
-- CV DATA TABLE (Generated from Blueprint)
-- ============================================
CREATE TABLE cv_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blueprint_id UUID REFERENCES blueprints(id) ON DELETE CASCADE,
    
    -- CV Content
    headline VARCHAR(500),
    profile_summary TEXT,
    
    -- Skills and highlights
    skills JSONB DEFAULT '[]',          -- ["Creative Strategy", "Team Transformation"]
    highlights JSONB DEFAULT '[]',      -- [{text, order}]
    
    -- Experience (can be edited independently)
    experience JSONB DEFAULT '[]',      -- [{title, company, dates, bullets}]
    
    -- Contact info
    email VARCHAR(255),
    phone VARCHAR(50),
    linkedin_url VARCHAR(500),
    location VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_exported_at TIMESTAMP
);

-- ============================================
-- DECISION FRAMEWORK TABLE
-- ============================================
CREATE TABLE decision_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blueprint_id UUID REFERENCES blueprints(id) ON DELETE CASCADE,
    
    -- Custom criteria (generated from blueprint)
    criteria JSONB DEFAULT '[]',        -- [{criterion, weight: 'high'|'med'|'low'}]
    
    -- Saved evaluations
    evaluations JSONB DEFAULT '[]',     -- [{opportunity_name, scores: {criterion_id: score}}]
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- OPPORTUNITY EVALUATIONS TABLE
-- ============================================
CREATE TABLE opportunity_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    framework_id UUID REFERENCES decision_frameworks(id) ON DELETE CASCADE,
    
    -- Opportunity details
    opportunity_name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    role VARCHAR(255),
    notes TEXT,
    
    -- Scores (JSON object mapping criterion to score)
    scores JSONB DEFAULT '{}',          -- {criterion_id: score}
    total_score DECIMAL(5,2),
    
    -- Verdict
    verdict VARCHAR(50),                -- 'pursue', 'consider', 'pass'
    verdict_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_blueprints_user_id ON blueprints(user_id);
CREATE INDEX idx_cv_data_user_id ON cv_data(user_id);
CREATE INDEX idx_cv_data_blueprint_id ON cv_data(blueprint_id);
CREATE INDEX idx_decision_frameworks_user_id ON decision_frameworks(user_id);
CREATE INDEX idx_opportunity_evaluations_user_id ON opportunity_evaluations(user_id);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blueprints_updated_at
    BEFORE UPDATE ON blueprints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_data_updated_at
    BEFORE UPDATE ON cv_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decision_frameworks_updated_at
    BEFORE UPDATE ON decision_frameworks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunity_evaluations_updated_at
    BEFORE UPDATE ON opportunity_evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
