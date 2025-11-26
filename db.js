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
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
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

        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_blueprints_user_id ON blueprints(user_id);
            CREATE INDEX IF NOT EXISTS idx_cv_data_user_id ON cv_data(user_id);
            CREATE INDEX IF NOT EXISTS idx_cv_data_blueprint_id ON cv_data(blueprint_id);
            CREATE INDEX IF NOT EXISTS idx_decision_frameworks_user_id ON decision_frameworks(user_id);
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
 */
async function createClientAccount(email, name, password) {
    // Check if user already exists
    const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );

    if (existing.rows.length > 0) {
        // Update existing user with password
        const hashedPassword = hashPassword(password);
        const result = await pool.query(
            `UPDATE users SET name = $2, password_hash = $3, updated_at = NOW()
             WHERE email = $1
             RETURNING *`,
            [email, name, hashedPassword]
        );
        return result.rows[0];
    }

    // Create new user with password
    const hashedPassword = hashPassword(password);
    const result = await pool.query(
        `INSERT INTO users (email, name, password_hash, last_login)
         VALUES ($1, $2, $3, NOW())
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
        `SELECT id, email, name, is_admin, created_at, last_login, subscription_tier
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

module.exports = {
    pool,
    initDatabase,
    saveBlueprint,
    getLatestBlueprint,
    getBlueprintById,
    getOrCreateUser,
    loginUser,
    createClientAccount,
    getAllUsers,
    isAdmin,
    saveCVData,
    getCVData
};
