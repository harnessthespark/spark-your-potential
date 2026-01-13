/**
 * PostgreSQL Database Connection for Spark Your Potential
 * Uses the same DigitalOcean managed database as SparkHub
 */

const { Pool } = require('pg');
const crypto = require('crypto');

// Allow self-signed certificates for DigitalOcean managed databases
if (process.env.DATABASE_URL) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Database connection pool
// Disable SSL for localhost (local dev), enable for production
const isLocalhost = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: (process.env.DATABASE_URL && !isLocalhost) ? { rejectUnauthorized: false } : false
});

console.log('Database configured:', process.env.DATABASE_URL ? 'yes' : 'no');

// Password hashing utilities
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
}

// Test connection on startup
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL pool error:', err);
});

/**
 * Initialise database tables
 * Creates tables if they don't exist (matches database_schema.sql)
 */
async function initDatabase() {
    const client = await pool.connect();
    try {
        // Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255),
                password_hash VARCHAR(500),
                is_admin BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                subscription_tier VARCHAR(50) DEFAULT 'free',
                subscription_expires_at TIMESTAMP
            )
        `);

        // Add password_hash and is_admin columns if they don't exist (migration)
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(500);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
        `);

        // Add programme_access column (migration) - stores which programmes client can access
        // Values: 'career' (Career Booster only), 'audhd' (AuDHD Coaching only), 'both' (both programmes)
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS programme_access VARCHAR(50) DEFAULT 'career';
        `);

        // Add programme_status column (migration) - stores client's current stage
        // Values: 'discovery', 'week-1', 'week-2', 'week-3', 'week-4', 'complete'
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS programme_status VARCHAR(50) DEFAULT 'enrolled';
        `);

        // Add must_change_password column - forces password change on first login
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
        `);

        // Add full_name column for display name
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
        `);

        // Create blueprints table
        await client.query(`
            CREATE TABLE IF NOT EXISTS blueprints (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,

                -- Core Identity
                name VARCHAR(255),
                core_pattern TEXT,
                thread TEXT,

                -- Positioning Statement Components
                role_identity VARCHAR(255),
                what_you_do TEXT,
                who_you_serve TEXT,
                unique_approach TEXT,
                background TEXT,
                where_heading TEXT,
                positioning_statement TEXT,

                -- JSON Arrays
                evidence JSONB DEFAULT '[]',
                belief_moments JSONB DEFAULT '[]',
                red_flags JSONB DEFAULT '[]',
                green_flags JSONB DEFAULT '[]',

                -- Raw questionnaire responses
                questionnaire_responses JSONB,

                -- Metadata
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                version INTEGER DEFAULT 1
            )
        `);

        // Create CV data table
        await client.query(`
            CREATE TABLE IF NOT EXISTS cv_data (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                blueprint_id UUID REFERENCES blueprints(id) ON DELETE CASCADE,

                headline VARCHAR(500),
                profile_summary TEXT,
                skills JSONB DEFAULT '[]',
                highlights JSONB DEFAULT '[]',
                experience JSONB DEFAULT '[]',

                email VARCHAR(255),
                phone VARCHAR(50),
                linkedin_url VARCHAR(500),
                location VARCHAR(255),

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_exported_at TIMESTAMP
            )
        `);

        // Create decision frameworks table
        await client.query(`
            CREATE TABLE IF NOT EXISTS decision_frameworks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                blueprint_id UUID REFERENCES blueprints(id) ON DELETE CASCADE,
                criteria JSONB DEFAULT '[]',
                evaluations JSONB DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create homework table for storing client homework responses
        await client.query(`
            CREATE TABLE IF NOT EXISTS homework (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                homework_type VARCHAR(50) NOT NULL,
                responses JSONB DEFAULT '{}',
                progress INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, homework_type)
            )
        `);

        // Create spark_collector table for daily wins tracking
        await client.query(`
            CREATE TABLE IF NOT EXISTS spark_collector (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                wins JSONB DEFAULT '{}',
                first_steps JSONB DEFAULT '{}',
                stats JSONB DEFAULT '{"totalWins": 0, "bestStreak": 0, "currentStreak": 0}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            )
        `);

        // Create foundations table for "Laying the Foundations" worksheet
        await client.query(`
            CREATE TABLE IF NOT EXISTS foundations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                data JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            )
        `);

        // Create weekly_checkins table for weekly check-in data
        await client.query(`
            CREATE TABLE IF NOT EXISTS weekly_checkins (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                checkin_date DATE NOT NULL,
                data JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, checkin_date)
            )
        `);

        // Create decisions table for decision framework
        await client.query(`
            CREATE TABLE IF NOT EXISTS decisions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                decision_data JSONB DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            )
        `);

        // Create session_notes table for coaching session notes
        await client.query(`
            CREATE TABLE IF NOT EXISTS session_notes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                session_date DATE NOT NULL,
                notes JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, session_date)
            )
        `);

        // Create career_discovery table for career discovery questionnaire
        await client.query(`
            CREATE TABLE IF NOT EXISTS career_discovery (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                responses JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            )
        `);

        // Create spark_ignition table for spark ignition tool data
        await client.query(`
            CREATE TABLE IF NOT EXISTS spark_ignition (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                data JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            )
        `);

        // Create password_reset_tokens table
        await client.query(`
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_email VARCHAR(255) NOT NULL,
                token VARCHAR(255) NOT NULL UNIQUE,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create notifications table for client portal alerts
        await client.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_email VARCHAR(255) NOT NULL,
                notification_type VARCHAR(50) NOT NULL,
                subject VARCHAR(500),
                message TEXT,
                link VARCHAR(500),
                link_text VARCHAR(100),
                read BOOLEAN DEFAULT false,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create login_tracking table for nudge system
        await client.query(`
            CREATE TABLE IF NOT EXISTS login_tracking (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_email VARCHAR(255) NOT NULL UNIQUE,
                last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                login_count INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create automation_settings table for coach automations
        await client.query(`
            CREATE TABLE IF NOT EXISTS automation_settings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                setting_key VARCHAR(100) UNIQUE NOT NULL,
                enabled BOOLEAN DEFAULT false,
                frequency_days INTEGER DEFAULT 7,
                last_run TIMESTAMP,
                config JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create automation_log table to track sent automations
        await client.query(`
            CREATE TABLE IF NOT EXISTS automation_log (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                automation_type VARCHAR(50) NOT NULL,
                client_email VARCHAR(255) NOT NULL,
                status VARCHAR(20) DEFAULT 'sent',
                details JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_blueprints_user_id ON blueprints(user_id);
            CREATE INDEX IF NOT EXISTS idx_cv_data_user_id ON cv_data(user_id);
            CREATE INDEX IF NOT EXISTS idx_cv_data_blueprint_id ON cv_data(blueprint_id);
            CREATE INDEX IF NOT EXISTS idx_decision_frameworks_user_id ON decision_frameworks(user_id);
            CREATE INDEX IF NOT EXISTS idx_homework_user_id ON homework(user_id);
            CREATE INDEX IF NOT EXISTS idx_spark_collector_user_id ON spark_collector(user_id);
            CREATE INDEX IF NOT EXISTS idx_foundations_user_id ON foundations(user_id);
            CREATE INDEX IF NOT EXISTS idx_weekly_checkins_user_id ON weekly_checkins(user_id);
            CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON decisions(user_id);
            CREATE INDEX IF NOT EXISTS idx_session_notes_user_id ON session_notes(user_id);
            CREATE INDEX IF NOT EXISTS idx_career_discovery_user_id ON career_discovery(user_id);
            CREATE INDEX IF NOT EXISTS idx_spark_ignition_user_id ON spark_ignition(user_id);
            CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON notifications(user_email);
            CREATE INDEX IF NOT EXISTS idx_login_tracking_user_email ON login_tracking(user_email);
            CREATE INDEX IF NOT EXISTS idx_login_tracking_last_login ON login_tracking(last_login);
            CREATE INDEX IF NOT EXISTS idx_automation_log_type ON automation_log(automation_type);
            CREATE INDEX IF NOT EXISTS idx_automation_log_client ON automation_log(client_email);
            CREATE INDEX IF NOT EXISTS idx_automation_log_created ON automation_log(created_at);
        `);

        console.log('✅ Database tables initialised');
    } catch (error) {
        console.error('❌ Database initialisation error:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Save a new blueprint to database
 */
async function saveBlueprint(userId, blueprintData) {
    const query = `
        INSERT INTO blueprints (
            user_id, name, core_pattern, thread,
            role_identity, what_you_do, who_you_serve,
            unique_approach, background, where_heading,
            positioning_statement, evidence, belief_moments,
            red_flags, green_flags, questionnaire_responses,
            completed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
        RETURNING *
    `;

    const values = [
        userId,
        blueprintData.name,
        blueprintData.core_pattern,
        blueprintData.thread,
        blueprintData.role_identity,
        blueprintData.what_you_do,
        blueprintData.who_you_serve,
        blueprintData.unique_approach,
        blueprintData.background,
        blueprintData.where_heading,
        blueprintData.positioning_statement,
        JSON.stringify(blueprintData.evidence || []),
        JSON.stringify(blueprintData.belief_moments || []),
        JSON.stringify(blueprintData.red_flags || []),
        JSON.stringify(blueprintData.green_flags || []),
        JSON.stringify(blueprintData.questionnaire_responses || {})
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
}

/**
 * Get the latest blueprint for a user
 */
async function getLatestBlueprint(userId) {
    const query = `
        SELECT * FROM blueprints
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
}

/**
 * Get blueprint by ID
 */
async function getBlueprintById(blueprintId) {
    const query = `SELECT * FROM blueprints WHERE id = $1`;
    const result = await pool.query(query, [blueprintId]);
    return result.rows[0] || null;
}

/**
 * Create or get user by email (legacy - no password)
 */
async function getOrCreateUser(email, name = null) {
    // Try to find existing user
    let result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );

    if (result.rows.length > 0) {
        // Update last login
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [result.rows[0].id]
        );
        return result.rows[0];
    }

    // Create new user
    result = await pool.query(
        `INSERT INTO users (email, name, last_login)
         VALUES ($1, $2, NOW())
         RETURNING *`,
        [email, name]
    );
    return result.rows[0];
}

/**
 * Login user with email and password
 */
async function loginUser(email, password) {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );

    if (result.rows.length === 0) {
        return { success: false, error: 'User not found' };
    }

    const user = result.rows[0];

    // Check if user has a password set
    if (!user.password_hash) {
        return { success: false, error: 'No password set. Please contact admin.' };
    }

    // Verify password
    if (!verifyPassword(password, user.password_hash)) {
        return { success: false, error: 'Incorrect password' };
    }

    // Update last login
    await pool.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
    );

    return { success: true, user };
}

/**
 * Create a new client account (admin function)
 * @param {string} email - Client email
 * @param {string} name - Client name
 * @param {string} password - Client password
 * @param {string} programmeAccess - 'career', 'audhd', or 'both'
 * @param {boolean} isTempPassword - If true, forces password change on first login
 */
async function createClientAccount(email, name, password, programmeAccess = 'career', isTempPassword = true) {
    // Check if user already exists
    const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );

    if (existing.rows.length > 0) {
        // Update existing user with password and programme access
        const hashedPassword = hashPassword(password);
        const result = await pool.query(
            `UPDATE users SET name = COALESCE($2, name), password_hash = $3, programme_access = $4, must_change_password = $5, updated_at = NOW()
             WHERE email = $1
             RETURNING *`,
            [email, name, hashedPassword, programmeAccess, isTempPassword]
        );
        return result.rows[0];
    }

    // Create new user with password and programme access
    const hashedPassword = hashPassword(password);
    const result = await pool.query(
        `INSERT INTO users (email, name, password_hash, programme_access, must_change_password, last_login)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING *`,
        [email, name, hashedPassword, programmeAccess, isTempPassword]
    );
    return result.rows[0];
}

/**
 * Create a coach/admin account
 * @param {string} email - Coach email
 * @param {string} name - Coach name
 * @param {string} password - Coach password
 */
async function createCoachAccount(email, name, password) {
    // Check if user already exists
    const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );

    const hashedPassword = hashPassword(password);

    if (existing.rows.length > 0) {
        // Update existing user to be admin with password
        const result = await pool.query(
            `UPDATE users SET name = COALESCE($2, name), password_hash = $3, is_admin = true, must_change_password = false, updated_at = NOW()
             WHERE email = $1
             RETURNING *`,
            [email, name, hashedPassword]
        );
        return result.rows[0];
    }

    // Create new admin user
    const result = await pool.query(
        `INSERT INTO users (email, name, password_hash, is_admin, must_change_password, last_login)
         VALUES ($1, $2, $3, true, false, NOW())
         RETURNING *`,
        [email, name, hashedPassword]
    );
    return result.rows[0];
}

/**
 * Get all users (admin function)
 */
async function getAllUsers() {
    const result = await pool.query(
        `SELECT id, email, name, is_admin, created_at, last_login, subscription_tier, programme_access
         FROM users ORDER BY created_at DESC`
    );
    return result.rows;
}

/**
 * Check if user is admin
 */
async function isAdmin(userId) {
    const result = await pool.query(
        'SELECT is_admin FROM users WHERE id = $1',
        [userId]
    );
    return result.rows.length > 0 && result.rows[0].is_admin === true;
}

/**
 * Update client details (admin function)
 */
async function updateClient(userId, { name, email, programmeAccess }) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined && name !== null) {
        updates.push(`name = $${paramCount}`);
        values.push(name);
        paramCount++;
    }

    if (email !== undefined && email !== null) {
        updates.push(`email = $${paramCount}`);
        values.push(email);
        paramCount++;
    }

    if (programmeAccess !== undefined && programmeAccess !== null) {
        updates.push(`programme_access = $${paramCount}`);
        values.push(programmeAccess);
        paramCount++;
    }

    if (updates.length === 0) {
        throw new Error('No fields to update');
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
    `;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
        throw new Error('User not found');
    }
    return result.rows[0];
}

/**
 * Delete client and all their data (admin function)
 */
async function deleteClient(userId) {
    // Due to ON DELETE CASCADE, deleting user will automatically delete:
    // - blueprints
    // - cv_data
    // - decision_frameworks
    const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [userId]
    );
    if (result.rows.length === 0) {
        throw new Error('User not found');
    }
    return result.rows[0];
}

/**
 * Save CV data linked to blueprint
 */
async function saveCVData(userId, blueprintId, cvData) {
    const query = `
        INSERT INTO cv_data (
            user_id, blueprint_id, headline, profile_summary,
            skills, highlights, experience,
            email, phone, linkedin_url, location
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
            headline = EXCLUDED.headline,
            profile_summary = EXCLUDED.profile_summary,
            skills = EXCLUDED.skills,
            highlights = EXCLUDED.highlights,
            experience = EXCLUDED.experience,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            linkedin_url = EXCLUDED.linkedin_url,
            location = EXCLUDED.location,
            updated_at = NOW()
        RETURNING *
    `;

    const values = [
        userId,
        blueprintId,
        cvData.headline,
        cvData.profile_summary,
        JSON.stringify(cvData.skills || []),
        JSON.stringify(cvData.highlights || []),
        JSON.stringify(cvData.experience || []),
        cvData.email,
        cvData.phone,
        cvData.linkedin_url,
        cvData.location
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
}

/**
 * Get CV data for a user
 */
async function getCVData(userId) {
    const query = `
        SELECT * FROM cv_data
        WHERE user_id = $1
        ORDER BY updated_at DESC
        LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
}

/**
 * Save homework responses (upsert - creates or updates)
 * @param {string} userEmail - Client email address
 * @param {string} homeworkType - Type of homework (e.g., 'week2')
 * @param {object} responses - Homework responses object
 */
async function saveHomework(userEmail, homeworkType, responses) {
    // First, get the user by email
    const userResult = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [userEmail]
    );

    if (userResult.rows.length === 0) {
        throw new Error('User not found: ' + userEmail);
    }

    const userId = userResult.rows[0].id;
    const progress = responses.progress || 0;

    // Upsert homework record
    const query = `
        INSERT INTO homework (user_id, homework_type, responses, progress, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (user_id, homework_type)
        DO UPDATE SET
            responses = $3,
            progress = $4,
            updated_at = NOW()
        RETURNING *
    `;

    const result = await pool.query(query, [userId, homeworkType, JSON.stringify(responses), progress]);
    return result.rows[0];
}

/**
 * Get homework responses for a client
 * @param {string} userEmail - Client email address
 * @param {string} homeworkType - Type of homework (e.g., 'week2')
 */
async function getHomework(userEmail, homeworkType) {
    const query = `
        SELECT h.* FROM homework h
        JOIN users u ON h.user_id = u.id
        WHERE u.email = $1 AND h.homework_type = $2
    `;
    const result = await pool.query(query, [userEmail, homeworkType]);
    return result.rows[0] || null;
}

/**
 * Get all homework for a client
 * @param {string} userEmail - Client email address
 */
async function getAllHomework(userEmail) {
    const query = `
        SELECT h.* FROM homework h
        JOIN users u ON h.user_id = u.id
        WHERE u.email = $1
        ORDER BY h.updated_at DESC
    `;
    const result = await pool.query(query, [userEmail]);
    return result.rows;
}

/**
 * Save Spark Collector data (upsert)
 * @param {string} userEmail - Client email address
 * @param {object} data - { wins, firstSteps, stats }
 */
async function saveSparkCollector(userEmail, data) {
    // First, get the user by email
    const userResult = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [userEmail]
    );

    if (userResult.rows.length === 0) {
        throw new Error('User not found: ' + userEmail);
    }

    const userId = userResult.rows[0].id;

    // Upsert spark collector record
    const query = `
        INSERT INTO spark_collector (user_id, wins, first_steps, stats, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
            wins = $2,
            first_steps = $3,
            stats = $4,
            updated_at = NOW()
        RETURNING *
    `;

    const result = await pool.query(query, [
        userId,
        JSON.stringify(data.wins || {}),
        JSON.stringify(data.firstSteps || {}),
        JSON.stringify(data.stats || { totalWins: 0, bestStreak: 0, currentStreak: 0 })
    ]);
    return result.rows[0];
}

/**
 * Get Spark Collector data for a client
 * @param {string} userEmail - Client email address
 */
async function getSparkCollector(userEmail) {
    const query = `
        SELECT sc.* FROM spark_collector sc
        JOIN users u ON sc.user_id = u.id
        WHERE u.email = $1
    `;
    const result = await pool.query(query, [userEmail]);

    if (result.rows.length === 0) {
        return null;
    }

    // Parse JSONB fields
    const row = result.rows[0];
    return {
        id: row.id,
        wins: row.wins || {},
        firstSteps: row.first_steps || {},
        stats: row.stats || { totalWins: 0, bestStreak: 0, currentStreak: 0 },
        updatedAt: row.updated_at
    };
}

/**
 * Save Foundations data (upsert - creates or updates)
 * @param {string} userEmail - Client email address
 * @param {object} data - Foundations data (8 categories with colour, rules, exceptions, protected)
 */
async function saveFoundations(userEmail, data) {
    // First, get the user by email
    const userResult = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [userEmail]
    );

    if (userResult.rows.length === 0) {
        throw new Error('User not found: ' + userEmail);
    }

    const userId = userResult.rows[0].id;

    // Upsert foundations record
    const query = `
        INSERT INTO foundations (user_id, data, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
            data = $2,
            updated_at = NOW()
        RETURNING *
    `;

    const result = await pool.query(query, [userId, JSON.stringify(data)]);
    return result.rows[0];
}

/**
 * Get Foundations data for a client
 * @param {string} userEmail - Client email address
 */
async function getFoundations(userEmail) {
    const query = `
        SELECT f.* FROM foundations f
        JOIN users u ON f.user_id = u.id
        WHERE u.email = $1
    `;
    const result = await pool.query(query, [userEmail]);

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];
    return {
        id: row.id,
        data: row.data || {},
        updatedAt: row.updated_at
    };
}

// =============================================
// WEEKLY CHECKIN FUNCTIONS
// =============================================

/**
 * Save Weekly Check-in data (upsert)
 * @param {string} userEmail - Client email address
 * @param {string} checkinDate - Date in YYYY-MM-DD format
 * @param {object} data - Check-in data
 */
async function saveWeeklyCheckin(userEmail, checkinDate, data) {
    const userResult = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [userEmail]
    );

    if (userResult.rows.length === 0) {
        throw new Error('User not found: ' + userEmail);
    }

    const userId = userResult.rows[0].id;

    const query = `
        INSERT INTO weekly_checkins (user_id, checkin_date, data, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (user_id, checkin_date)
        DO UPDATE SET
            data = $3,
            updated_at = NOW()
        RETURNING *
    `;

    const result = await pool.query(query, [userId, checkinDate, JSON.stringify(data)]);
    return result.rows[0];
}

/**
 * Get Weekly Check-in data for a client
 * @param {string} userEmail - Client email address
 * @param {string} checkinDate - Optional specific date
 */
async function getWeeklyCheckin(userEmail, checkinDate = null) {
    let query, params;

    if (checkinDate) {
        query = `
            SELECT wc.* FROM weekly_checkins wc
            JOIN users u ON wc.user_id = u.id
            WHERE u.email = $1 AND wc.checkin_date = $2
        `;
        params = [userEmail, checkinDate];
    } else {
        query = `
            SELECT wc.* FROM weekly_checkins wc
            JOIN users u ON wc.user_id = u.id
            WHERE u.email = $1
            ORDER BY wc.checkin_date DESC
        `;
        params = [userEmail];
    }

    const result = await pool.query(query, params);

    if (checkinDate) {
        return result.rows[0] ? { id: result.rows[0].id, data: result.rows[0].data, checkinDate: result.rows[0].checkin_date, updatedAt: result.rows[0].updated_at } : null;
    }

    return result.rows.map(row => ({
        id: row.id,
        data: row.data,
        checkinDate: row.checkin_date,
        updatedAt: row.updated_at
    }));
}

// =============================================
// DECISIONS FUNCTIONS
// =============================================

/**
 * Save Decision Framework data (upsert)
 * @param {string} userEmail - Client email address
 * @param {array} decisionData - Array of decision objects
 */
async function saveDecisions(userEmail, decisionData) {
    const userResult = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [userEmail]
    );

    if (userResult.rows.length === 0) {
        throw new Error('User not found: ' + userEmail);
    }

    const userId = userResult.rows[0].id;

    const query = `
        INSERT INTO decisions (user_id, decision_data, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
            decision_data = $2,
            updated_at = NOW()
        RETURNING *
    `;

    const result = await pool.query(query, [userId, JSON.stringify(decisionData)]);
    return result.rows[0];
}

/**
 * Get Decision Framework data for a client
 * @param {string} userEmail - Client email address
 */
async function getDecisions(userEmail) {
    const query = `
        SELECT d.* FROM decisions d
        JOIN users u ON d.user_id = u.id
        WHERE u.email = $1
    `;
    const result = await pool.query(query, [userEmail]);

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];
    return {
        id: row.id,
        decisionData: row.decision_data || [],
        updatedAt: row.updated_at
    };
}

// =============================================
// SESSION NOTES FUNCTIONS
// =============================================

/**
 * Save Session Notes (upsert)
 * @param {string} userEmail - Client email address
 * @param {string} sessionDate - Date in YYYY-MM-DD format
 * @param {object} notes - Session notes data
 */
async function saveSessionNotes(userEmail, sessionDate, notes) {
    const userResult = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [userEmail]
    );

    if (userResult.rows.length === 0) {
        throw new Error('User not found: ' + userEmail);
    }

    const userId = userResult.rows[0].id;

    const query = `
        INSERT INTO session_notes (user_id, session_date, notes, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (user_id, session_date)
        DO UPDATE SET
            notes = $3,
            updated_at = NOW()
        RETURNING *
    `;

    const result = await pool.query(query, [userId, sessionDate, JSON.stringify(notes)]);
    return result.rows[0];
}

/**
 * Get Session Notes for a client
 * @param {string} userEmail - Client email address
 * @param {string} sessionDate - Optional specific date
 */
async function getSessionNotes(userEmail, sessionDate = null) {
    let query, params;

    if (sessionDate) {
        query = `
            SELECT sn.* FROM session_notes sn
            JOIN users u ON sn.user_id = u.id
            WHERE u.email = $1 AND sn.session_date = $2
        `;
        params = [userEmail, sessionDate];
    } else {
        query = `
            SELECT sn.* FROM session_notes sn
            JOIN users u ON sn.user_id = u.id
            WHERE u.email = $1
            ORDER BY sn.session_date DESC
        `;
        params = [userEmail];
    }

    const result = await pool.query(query, params);

    if (sessionDate) {
        return result.rows[0] ? { id: result.rows[0].id, notes: result.rows[0].notes, sessionDate: result.rows[0].session_date, updatedAt: result.rows[0].updated_at } : null;
    }

    return result.rows.map(row => ({
        id: row.id,
        notes: row.notes,
        sessionDate: row.session_date,
        updatedAt: row.updated_at
    }));
}

// =============================================
// CAREER DISCOVERY FUNCTIONS
// =============================================

/**
 * Save Career Discovery responses (upsert)
 * @param {string} userEmail - Client email address
 * @param {object} responses - Questionnaire responses
 */
async function saveCareerDiscovery(userEmail, responses) {
    const userResult = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [userEmail]
    );

    if (userResult.rows.length === 0) {
        throw new Error('User not found: ' + userEmail);
    }

    const userId = userResult.rows[0].id;

    const query = `
        INSERT INTO career_discovery (user_id, responses, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
            responses = $2,
            updated_at = NOW()
        RETURNING *
    `;

    const result = await pool.query(query, [userId, JSON.stringify(responses)]);
    return result.rows[0];
}

/**
 * Get Career Discovery responses for a client
 * @param {string} userEmail - Client email address
 */
async function getCareerDiscovery(userEmail) {
    const query = `
        SELECT cd.* FROM career_discovery cd
        JOIN users u ON cd.user_id = u.id
        WHERE u.email = $1
    `;
    const result = await pool.query(query, [userEmail]);

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];
    return {
        id: row.id,
        responses: row.responses || {},
        updatedAt: row.updated_at
    };
}

// =============================================
// SPARK IGNITION FUNCTIONS
// =============================================

/**
 * Save Spark Ignition data (upsert)
 * @param {string} userEmail - Client email address
 * @param {object} data - Spark ignition data
 */
async function saveSparkIgnition(userEmail, data) {
    const userResult = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [userEmail]
    );

    if (userResult.rows.length === 0) {
        throw new Error('User not found: ' + userEmail);
    }

    const userId = userResult.rows[0].id;

    const query = `
        INSERT INTO spark_ignition (user_id, data, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
            data = $2,
            updated_at = NOW()
        RETURNING *
    `;

    const result = await pool.query(query, [userId, JSON.stringify(data)]);
    return result.rows[0];
}

/**
 * Get Spark Ignition data for a client
 * @param {string} userEmail - Client email address
 */
async function getSparkIgnition(userEmail) {
    const query = `
        SELECT si.* FROM spark_ignition si
        JOIN users u ON si.user_id = u.id
        WHERE u.email = $1
    `;
    const result = await pool.query(query, [userEmail]);

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];
    return {
        id: row.id,
        data: row.data || {},
        updatedAt: row.updated_at
    };
}

// =============================================
// AGREEMENT FUNCTIONS
// =============================================

async function saveAgreement(agreementData) {
    // Ensure agreements table exists
    await pool.query(`
        CREATE TABLE IF NOT EXISTS agreements (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_email VARCHAR(255) NOT NULL UNIQUE,
            client_name VARCHAR(255),
            programme_type VARCHAR(50),
            signature TEXT,
            signature_type VARCHAR(20),
            signed_date DATE,
            agreed_to_terms BOOLEAN DEFAULT false,
            agreed_to_feedback BOOLEAN DEFAULT false,
            consent_to_recording BOOLEAN DEFAULT false,
            is_beta_tester BOOLEAN DEFAULT false,
            fee_status VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    const result = await pool.query(`
        INSERT INTO agreements (
            client_email, client_name, programme_type, signature, signature_type,
            signed_date, agreed_to_terms, agreed_to_feedback, consent_to_recording,
            is_beta_tester, fee_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (client_email) DO UPDATE SET
            client_name = EXCLUDED.client_name,
            programme_type = EXCLUDED.programme_type,
            signature = EXCLUDED.signature,
            signature_type = EXCLUDED.signature_type,
            signed_date = EXCLUDED.signed_date,
            agreed_to_terms = EXCLUDED.agreed_to_terms,
            agreed_to_feedback = EXCLUDED.agreed_to_feedback,
            consent_to_recording = EXCLUDED.consent_to_recording,
            is_beta_tester = EXCLUDED.is_beta_tester,
            fee_status = EXCLUDED.fee_status,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *
    `, [
        agreementData.client_email,
        agreementData.client_name,
        agreementData.programme_type,
        agreementData.signature,
        agreementData.signature_type,
        agreementData.signed_date,
        agreementData.agreed_to_terms || false,
        agreementData.agreed_to_feedback || false,
        agreementData.consent_to_recording || false,
        agreementData.is_beta_tester || false,
        agreementData.fee_status || 'paid'
    ]);

    return result.rows[0];
}

async function getAgreement(clientEmail) {
    const result = await pool.query(
        'SELECT * FROM agreements WHERE client_email = $1',
        [clientEmail]
    );

    if (result.rows.length === 0) return null;

    return result.rows[0];
}

/**
 * Create a password reset token
 * @param {string} email - User email
 * @returns {object} - { success, token, error }
 */
async function createPasswordResetToken(email) {
    // First check if user exists
    const userResult = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );

    if (userResult.rows.length === 0) {
        return { success: false, error: 'User not found' };
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Invalidate any existing tokens for this email
    await pool.query(
        'UPDATE password_reset_tokens SET used = true WHERE user_email = $1 AND used = false',
        [email]
    );

    // Create new token
    await pool.query(
        `INSERT INTO password_reset_tokens (user_email, token, expires_at)
         VALUES ($1, $2, $3)`,
        [email, token, expiresAt]
    );

    return { success: true, token };
}

/**
 * Verify and use a password reset token
 * @param {string} token - The reset token
 * @returns {object} - { success, email, error }
 */
async function verifyPasswordResetToken(token) {
    const result = await pool.query(
        `SELECT * FROM password_reset_tokens
         WHERE token = $1 AND used = false AND expires_at > NOW()`,
        [token]
    );

    if (result.rows.length === 0) {
        return { success: false, error: 'Invalid or expired token' };
    }

    return { success: true, email: result.rows[0].user_email };
}

/**
 * Mark a password reset token as used
 * @param {string} token - The reset token
 */
async function markTokenUsed(token) {
    await pool.query(
        'UPDATE password_reset_tokens SET used = true WHERE token = $1',
        [token]
    );
}

/**
 * Change user password and clear must_change_password flag
 * @param {string} email - User email
 * @param {string} newPassword - New password
 */
async function changePassword(email, newPassword) {
    const hashedPassword = hashPassword(newPassword);
    const result = await pool.query(
        `UPDATE users
         SET password_hash = $2, must_change_password = false, updated_at = NOW()
         WHERE email = $1
         RETURNING id, email, name, must_change_password`,
        [email, hashedPassword]
    );

    if (result.rows.length === 0) {
        return { success: false, error: 'User not found' };
    }

    return { success: true, user: result.rows[0] };
}

/**
 * Set must_change_password flag for a user
 * @param {string} email - User email
 * @param {boolean} mustChange - Whether password change is required
 */
async function setMustChangePassword(email, mustChange = true) {
    const result = await pool.query(
        `UPDATE users SET must_change_password = $2, updated_at = NOW()
         WHERE email = $1
         RETURNING *`,
        [email, mustChange]
    );

    if (result.rows.length === 0) {
        return { success: false, error: 'User not found' };
    }

    return { success: true, user: result.rows[0] };
}

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

/**
 * Save a notification for a client
 * @param {string} userEmail - Client email address
 * @param {object} notification - Notification data
 */
async function saveNotification(userEmail, notification) {
    const query = `
        INSERT INTO notifications (user_email, notification_type, subject, message, link, link_text, read, sent_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;
    const result = await pool.query(query, [
        userEmail,
        notification.type,
        notification.subject || null,
        notification.message || null,
        notification.link || null,
        notification.link_text || null,
        notification.read || false,
        notification.sent_at || new Date().toISOString()
    ]);
    return result.rows[0];
}

/**
 * Get unread notifications for a client
 * @param {string} userEmail - Client email address
 */
async function getNotifications(userEmail) {
    const query = `
        SELECT * FROM notifications
        WHERE user_email = $1 AND read = false
        ORDER BY sent_at DESC
        LIMIT 20
    `;
    const result = await pool.query(query, [userEmail]);
    return result.rows;
}

/**
 * Mark a notification as read
 * @param {string} userEmail - Client email address
 * @param {string} notificationId - Notification UUID
 */
async function markNotificationRead(userEmail, notificationId) {
    const query = `
        UPDATE notifications
        SET read = true
        WHERE id = $1 AND user_email = $2
        RETURNING *
    `;
    const result = await pool.query(query, [notificationId, userEmail]);
    return result.rows[0];
}

/**
 * Track client login for nudge system
 * @param {string} userEmail - Client email address
 */
async function trackLogin(userEmail) {
    const query = `
        INSERT INTO login_tracking (user_email, last_login, login_count)
        VALUES ($1, NOW(), 1)
        ON CONFLICT (user_email)
        DO UPDATE SET
            last_login = NOW(),
            login_count = login_tracking.login_count + 1
        RETURNING *
    `;
    const result = await pool.query(query, [userEmail]);
    return result.rows[0];
}

/**
 * Get clients who haven't logged in for X days
 * @param {number} days - Number of days of inactivity
 */
async function getInactiveClients(days = 7) {
    const query = `
        SELECT u.email, u.full_name, u.name, u.programme_access, u.programme_status,
               lt.last_login, lt.login_count
        FROM users u
        LEFT JOIN login_tracking lt ON u.email = lt.user_email
        WHERE u.is_admin = false
        AND (
            lt.last_login IS NULL
            OR lt.last_login < NOW() - INTERVAL '1 day' * $1
        )
        ORDER BY lt.last_login ASC NULLS FIRST
    `;
    const result = await pool.query(query, [days]);
    return result.rows;
}

// ============================================
// AUTOMATION SETTINGS FUNCTIONS
// ============================================

/**
 * Save or update automation settings
 * @param {string} settingKey - e.g., 'login_reminders', 'homework_alerts'
 * @param {object} settings - { enabled, frequency_days, config }
 */
async function saveAutomationSettings(settingKey, settings) {
    const query = `
        INSERT INTO automation_settings (setting_key, enabled, frequency_days, config, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (setting_key)
        DO UPDATE SET
            enabled = $2,
            frequency_days = $3,
            config = $4,
            updated_at = NOW()
        RETURNING *
    `;
    const result = await pool.query(query, [
        settingKey,
        settings.enabled || false,
        settings.frequency_days || 7,
        JSON.stringify(settings.config || {})
    ]);
    return result.rows[0];
}

/**
 * Get automation settings by key
 * @param {string} settingKey - e.g., 'login_reminders'
 */
async function getAutomationSettings(settingKey) {
    const query = `SELECT * FROM automation_settings WHERE setting_key = $1`;
    const result = await pool.query(query, [settingKey]);
    return result.rows[0] || null;
}

/**
 * Get all automation settings
 */
async function getAllAutomationSettings() {
    const query = `SELECT * FROM automation_settings ORDER BY setting_key`;
    const result = await pool.query(query);
    return result.rows;
}

/**
 * Update last_run timestamp for an automation
 * @param {string} settingKey - Automation key
 */
async function updateAutomationLastRun(settingKey) {
    const query = `
        UPDATE automation_settings
        SET last_run = NOW(), updated_at = NOW()
        WHERE setting_key = $1
        RETURNING *
    `;
    const result = await pool.query(query, [settingKey]);
    return result.rows[0];
}

/**
 * Log an automation action
 * @param {string} automationType - Type of automation (e.g., 'login_reminder')
 * @param {string} clientEmail - Client email
 * @param {string} status - 'sent', 'failed', 'skipped'
 * @param {object} details - Additional details
 */
async function logAutomation(automationType, clientEmail, status, details = {}) {
    const query = `
        INSERT INTO automation_log (automation_type, client_email, status, details)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const result = await pool.query(query, [
        automationType,
        clientEmail,
        status,
        JSON.stringify(details)
    ]);
    return result.rows[0];
}

/**
 * Get automation log entries
 * @param {object} options - { automation_type, client_email, limit }
 */
async function getAutomationLog(options = {}) {
    let query = `SELECT * FROM automation_log WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (options.automation_type) {
        query += ` AND automation_type = $${paramCount}`;
        params.push(options.automation_type);
        paramCount++;
    }

    if (options.client_email) {
        query += ` AND client_email = $${paramCount}`;
        params.push(options.client_email);
        paramCount++;
    }

    query += ` ORDER BY created_at DESC`;

    if (options.limit) {
        query += ` LIMIT $${paramCount}`;
        params.push(options.limit);
    }

    const result = await pool.query(query, params);
    return result.rows;
}

/**
 * Check if an automation was sent to a client recently
 * @param {string} automationType - Type of automation
 * @param {string} clientEmail - Client email
 * @param {number} days - Days to check back
 */
async function wasAutomationSentRecently(automationType, clientEmail, days = 7) {
    const query = `
        SELECT COUNT(*) as count FROM automation_log
        WHERE automation_type = $1
        AND client_email = $2
        AND status = 'sent'
        AND created_at > NOW() - INTERVAL '1 day' * $3
    `;
    const result = await pool.query(query, [automationType, clientEmail, days]);
    return parseInt(result.rows[0].count) > 0;
}

module.exports = {
    pool,
    initDatabase,
    saveBlueprint,
    getLatestBlueprint,
    getBlueprintById,
    getOrCreateUser,
    loginUser,
    createClientAccount,
    createCoachAccount,
    getAllUsers,
    isAdmin,
    updateClient,
    deleteClient,
    saveCVData,
    getCVData,
    saveHomework,
    getHomework,
    getAllHomework,
    saveSparkCollector,
    getSparkCollector,
    saveFoundations,
    getFoundations,
    saveWeeklyCheckin,
    getWeeklyCheckin,
    saveDecisions,
    getDecisions,
    saveSessionNotes,
    getSessionNotes,
    saveCareerDiscovery,
    getCareerDiscovery,
    saveSparkIgnition,
    getSparkIgnition,
    saveAgreement,
    getAgreement,
    changePassword,
    setMustChangePassword,
    createPasswordResetToken,
    verifyPasswordResetToken,
    markTokenUsed,
    saveNotification,
    getNotifications,
    markNotificationRead,
    trackLogin,
    getInactiveClients,
    saveAutomationSettings,
    getAutomationSettings,
    getAllAutomationSettings,
    updateAutomationLastRun,
    logAutomation,
    getAutomationLog,
    wasAutomationSentRecently
};
