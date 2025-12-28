/**
 * Spark Your Potential - Express Server
 * Career positioning toolkit with PostgreSQL persistence
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ============================================
// PAGES
// ============================================

// Home - Redirect to Dashboard (login required)
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// Questionnaire (accessed from dashboard after login)
app.get('/questionnaire', (req, res) => {
    res.sendFile(path.join(__dirname, 'ability-recognition-visual.html'));
});

// Dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// CV Builder
app.get('/cv-builder', (req, res) => {
    res.sendFile(path.join(__dirname, 'cv-builder.html'));
});

// Blueprint View
app.get('/blueprint', (req, res) => {
    res.sendFile(path.join(__dirname, 'blueprint.html'));
});

// Donald's Blueprint (direct access)
app.get('/donald-blueprint', (req, res) => {
    res.sendFile(path.join(__dirname, 'donald-blueprint.html'));
});

// Donald's Questionnaire Responses (completed view)
app.get('/donald-questionnaire', (req, res) => {
    res.sendFile(path.join(__dirname, 'donald-questionnaire-responses.html'));
});

// ============================================
// API ENDPOINTS
// ============================================

// Health check
app.get('/health', async (req, res) => {
    let dbStatus = 'not configured';
    if (process.env.DATABASE_URL) {
        try {
            await db.pool.query('SELECT 1');
            dbStatus = 'connected';
        } catch (error) {
            dbStatus = 'error: ' + error.message;
        }
    }

    res.json({
        status: 'healthy',
        aiConfigured: !!process.env.ANTHROPIC_API_KEY,
        databaseStatus: dbStatus,
        timestamp: new Date().toISOString()
    });
});

// Login with email and password
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const result = await db.loginUser(email, password);
        if (!result.success) {
            return res.status(401).json(result);
        }

        res.json({ success: true, user: result.user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Legacy: Get or create user (simple email-based - for demo mode)
app.post('/api/user', async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        const user = await db.getOrCreateUser(email, name);
        res.json({ success: true, user });
    } catch (error) {
        console.error('User error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

// Admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Create client account (admin only)
app.post('/api/admin/create-client', async (req, res) => {
    try {
        const { email, name, password, adminKey, programmeAccess } = req.body;

        // Simple admin key check (set in environment variable)
        const ADMIN_KEY = process.env.ADMIN_KEY || 'spark-admin-2025';
        if (adminKey !== ADMIN_KEY) {
            return res.status(403).json({ success: false, error: 'Invalid admin key' });
        }

        if (!email || !name || !password) {
            return res.status(400).json({ success: false, error: 'Email, name, and password are required' });
        }

        // programmeAccess: 'career' (Career Booster), 'audhd' (AuDHD Coaching), or 'both'
        const access = programmeAccess || 'career';
        const user = await db.createClientAccount(email, name, password, access);
        res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, programme_access: user.programme_access } });
    } catch (error) {
        console.error('Create client error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all users (admin only)
app.post('/api/admin/users', async (req, res) => {
    try {
        const { adminKey } = req.body;

        const ADMIN_KEY = process.env.ADMIN_KEY || 'spark-admin-2025';
        if (adminKey !== ADMIN_KEY) {
            return res.status(403).json({ success: false, error: 'Invalid admin key' });
        }

        const users = await db.getAllUsers();
        res.json({ success: true, users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Reset password (admin only)
app.post('/api/admin/reset-password', async (req, res) => {
    try {
        const { email, password, adminKey } = req.body;

        const ADMIN_KEY = process.env.ADMIN_KEY || 'spark-admin-2025';
        if (adminKey !== ADMIN_KEY) {
            return res.status(403).json({ success: false, error: 'Invalid admin key' });
        }

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        // Use createClientAccount which updates password if user exists
        const user = await db.createClientAccount(email, null, password);
        res.json({ success: true, user: { id: user.id, email: user.email } });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update client (admin only)
app.post('/api/admin/update-client', async (req, res) => {
    try {
        const { userId, name, email, programmeAccess, adminKey } = req.body;

        const ADMIN_KEY = process.env.ADMIN_KEY || 'spark-admin-2025';
        if (adminKey !== ADMIN_KEY) {
            return res.status(403).json({ success: false, error: 'Invalid admin key' });
        }

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const user = await db.updateClient(userId, { name, email, programmeAccess });
        res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, programme_access: user.programme_access } });
    } catch (error) {
        console.error('Update client error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete client (admin only)
app.post('/api/admin/delete-client', async (req, res) => {
    try {
        const { userId, adminKey } = req.body;

        const ADMIN_KEY = process.env.ADMIN_KEY || 'spark-admin-2025';
        if (adminKey !== ADMIN_KEY) {
            return res.status(403).json({ success: false, error: 'Invalid admin key' });
        }

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        await db.deleteClient(userId);
        res.json({ success: true, message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Delete client error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Save Blueprint
app.post('/api/blueprint', async (req, res) => {
    try {
        const { user_id, blueprint_data } = req.body;

        if (!user_id || !blueprint_data) {
            return res.status(400).json({
                success: false,
                error: 'user_id and blueprint_data are required'
            });
        }

        const blueprint = await db.saveBlueprint(user_id, blueprint_data);
        res.json({ success: true, blueprint });
    } catch (error) {
        console.error('Blueprint save error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get latest Blueprint for user
app.get('/api/blueprint/:userId', async (req, res) => {
    try {
        const blueprint = await db.getLatestBlueprint(req.params.userId);
        if (!blueprint) {
            return res.status(404).json({
                success: false,
                error: 'No blueprint found for this user'
            });
        }
        res.json({ success: true, blueprint });
    } catch (error) {
        console.error('Blueprint fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Blueprint by ID
app.get('/api/blueprint/id/:blueprintId', async (req, res) => {
    try {
        const blueprint = await db.getBlueprintById(req.params.blueprintId);
        if (!blueprint) {
            return res.status(404).json({
                success: false,
                error: 'Blueprint not found'
            });
        }
        res.json({ success: true, blueprint });
    } catch (error) {
        console.error('Blueprint fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Save CV Data
app.post('/api/cv', async (req, res) => {
    try {
        const { user_id, blueprint_id, cv_data } = req.body;

        if (!user_id || !cv_data) {
            return res.status(400).json({
                success: false,
                error: 'user_id and cv_data are required'
            });
        }

        const cvData = await db.saveCVData(user_id, blueprint_id, cv_data);
        res.json({ success: true, cv_data: cvData });
    } catch (error) {
        console.error('CV save error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get CV Data for user
app.get('/api/cv/:userId', async (req, res) => {
    try {
        const cvData = await db.getCVData(req.params.userId);
        if (!cvData) {
            return res.status(404).json({
                success: false,
                error: 'No CV data found for this user'
            });
        }
        res.json({ success: true, cv_data: cvData });
    } catch (error) {
        console.error('CV fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// DEMO DATA - Sarah Mitchell
// ============================================
const { SARAH_MITCHELL, SARAH_BLUEPRINT } = require('./sample-data');

// Get demo Blueprint (no database required)
app.get('/api/demo/blueprint', (req, res) => {
    res.json({
        success: true,
        blueprint: {
            id: 'demo-sarah-mitchell',
            user_id: 'demo-user',
            ...SARAH_BLUEPRINT,
            questionnaire_responses: SARAH_MITCHELL,
            created_at: new Date().toISOString()
        }
    });
});

// Get demo user (for testing without database)
app.post('/api/demo/user', (req, res) => {
    res.json({
        success: true,
        user: {
            id: 'demo-user',
            email: SARAH_MITCHELL.email,
            name: SARAH_MITCHELL.name,
            created_at: new Date().toISOString()
        }
    });
});

// Load demo into session (creates demo user and returns Blueprint)
app.get('/api/demo/load', (req, res) => {
    res.json({
        success: true,
        user: {
            id: 'demo-user',
            email: SARAH_MITCHELL.email,
            name: SARAH_MITCHELL.name
        },
        blueprint: {
            id: 'demo-sarah-mitchell',
            ...SARAH_BLUEPRINT,
            questionnaire_responses: SARAH_MITCHELL
        }
    });
});

// ============================================
// IMPORT EXCEL RESPONSES
// ============================================
const XLSX = require('xlsx');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Import page
app.get('/import', (req, res) => {
    res.sendFile(path.join(__dirname, 'import.html'));
});

// Upload Excel and import responses
app.post('/api/import-excel', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Headers are in row 1, data in row 0
        const headers = data[1];
        const values = data[0];

        // Map headers to values
        const getField = (fieldName) => {
            const index = headers.findIndex(h => h && h.includes(fieldName));
            return index >= 0 ? values[index] : '';
        };

        // Extract questionnaire responses
        const imported = {
            timestamp: getField('Timestamp'),
            name: getField('Client Name'),
            outcomes: [
                getField('Outcome #1'),
                getField('Outcome #2'),
                getField('Outcome #3'),
                getField('Outcome #4'),
                getField('Outcome #5')
            ].filter(o => o),
            thread: getField('Thread'),
            intuition: getField('When You Knew'),
            questions: getField('Questions Only You'),
            noticing: getField('What You Notice'),
            whatFeelsEasy: getField('What Feels Easy'),
            ofCourseMoments: getField('Of Course'),
            clientBefore: getField('Client Before'),
            clientAfter: getField('Client After'),
            problemMagnet: getField('Problem Magnet'),
            howOthersSeeYou: getField('How Others See'),
            underestimatedAbility: getField('Underestimated'),
            patternRecognised: getField('Pattern Recognised'),
            transformationEnabled: getField('Transformation I Enable'),
            permission: getField('Permission')
        };

        res.json({
            success: true,
            imported: imported,
            message: `Imported responses for ${imported.name || 'Unknown'}`
        });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// AI ANALYSIS ENDPOINT (existing)
// ============================================
app.post('/api/analyze', async (req, res) => {
    try {
        const { outcomes, type, name } = req.body;

        if (!outcomes || outcomes.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No outcomes provided for analysis'
            });
        }

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return res.status(503).json({
                success: false,
                error: 'AI service not configured. Please add ANTHROPIC_API_KEY environment variable.'
            });
        }

        let systemPrompt = '';
        let userPrompt = '';

        if (type === 'patterns') {
            systemPrompt = `You are an expert coach helping people recognise their extraordinary abilities.
Analyse the client outcomes provided and identify:
1. The core ability or skill thread running through all examples
2. What makes this ability special or valuable
3. How this ability creates transformation for clients

Be warm, encouraging, and specific. Focus on the "invisible" abilities people underestimate.`;

            userPrompt = `Analyse these client outcomes and reveal the pattern:

${outcomes.map((o, i) => `Outcome ${i + 1}: ${o}`).join('\n\n')}

What ability keeps showing up? What's the thread connecting all these outcomes?`;

        } else if (type === 'unlock') {
            systemPrompt = `You are an insightful coach who helps people see their unique transformation pattern.
Analyse how this person enables change in others. Look for:
1. The specific type of transformation they create
2. What makes their approach unique
3. The "unlock moment" they provide

Be specific and affirming. Help them see what they do that others can't.`;

            userPrompt = `Based on these outcomes, what's this person's unique "unlock pattern"?

${outcomes.map(o => `• ${o}`).join('\n')}

What transformation do they consistently create? What's their unique unlock?`;

        } else if (type === 'instincts') {
            systemPrompt = `You are an expert in intuitive and pattern-recognition abilities.
Analyse someone's instinct examples to reveal their specific intuitive strengths.
Be specific about what type of intuition they have and how it shows up.`;

            const instinctData = req.body.instinct_data || {};
            userPrompt = `Analyse these instinct examples:

When they knew before they knew: ${instinctData.intuition || ''}
Questions they ask: ${instinctData.questions || ''}
What they notice first: ${instinctData.noticing || ''}

What's their specific intuitive ability? How does their radar work?`;

        } else if (type === 'cv_extract') {
            // Extract experience from uploaded CV content
            systemPrompt = `You are an expert CV parser. Extract work experience from the provided CV text.

Return a JSON object with this structure:
{
    "experience": [
        {
            "title": "Job Title",
            "company": "Company Name",
            "dates": "Start - End",
            "bullets": ["Achievement 1", "Achievement 2", "Achievement 3"]
        }
    ]
}

Extract up to 5 most recent/relevant roles. Focus on achievements and results.
Return ONLY valid JSON, no markdown.`;

            userPrompt = `Extract work experience from this CV:

${outcomes[0]}

Return structured JSON with experience array.`;

        } else if (type === 'blueprint') {
            // NEW: Generate full Blueprint from questionnaire responses
            systemPrompt = `You are an expert career coach who helps people discover their unique professional positioning.

Based on the questionnaire responses, generate a comprehensive Career Blueprint in JSON format with these fields:
- core_pattern: A sentence describing what they do (e.g., "You unlock creative potential in clients and teams")
- thread: The connecting theme across all their work (e.g., "Connecting creativity with commercial reality")
- role_identity: A 2-3 word title (e.g., "Creative Catalyst")
- what_you_do: What they do for others (e.g., "unlocks creative potential")
- who_you_serve: Their ideal clients (e.g., "clients and teams that have forgotten what they're capable of")
- unique_approach: How they do it differently (e.g., "connect creativity with commercial reality")
- background: Career summary (e.g., "15 years helping brands like Nike, Spotify and Barclays")
- where_heading: What they're seeking (e.g., "seeking roles where I can transform teams")
- evidence: Array of {company, description, result} objects from their outcomes
- belief_moments: Array of {title, story} objects - key moments that prove their pattern
- red_flags: Array of {flag, description} objects - what to avoid in roles
- green_flags: Array of {flag, description} objects - what to pursue in roles

Return ONLY valid JSON, no markdown.`;

            const responses = req.body.questionnaire_responses || {};
            userPrompt = `Generate a Career Blueprint from these questionnaire responses:

Name: ${name || 'Unknown'}

Client Outcomes:
${outcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}

The Thread (their connecting pattern):
${responses.thread || ''}

What Finds Them:
${responses.what_finds_you || ''}

Instincts:
- Intuition: ${responses.intuition || ''}
- Questions they ask: ${responses.questions || ''}
- What they notice: ${responses.noticing || ''}

Generate a complete Career Blueprint JSON.`;

        } else {
            return res.status(400).json({
                success: false,
                error: `Unknown analysis type: ${type}`
            });
        }

        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2048,
                temperature: 0.7,
                system: systemPrompt,
                messages: [{ role: 'user', content: userPrompt }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Anthropic API error:', response.status, errorText);
            return res.status(response.status).json({
                success: false,
                error: 'AI analysis failed. Please try again.',
                details: response.status === 401 ? 'Authentication error' : undefined
            });
        }

        const data = await response.json();
        const analysisText = data.content[0].text;

        console.log(`AI Analysis - Type: ${type}, Tokens: ${JSON.stringify(data.usage)}`);

        // For blueprint type, try to parse as JSON
        let parsedBlueprint = null;
        let parsedExperience = null;

        if (type === 'blueprint') {
            try {
                parsedBlueprint = JSON.parse(analysisText);
            } catch (e) {
                console.error('Failed to parse blueprint JSON:', e);
            }
        }

        if (type === 'cv_extract') {
            try {
                const parsed = JSON.parse(analysisText);
                parsedExperience = parsed.experience || [];
            } catch (e) {
                console.error('Failed to parse CV extract JSON:', e);
            }
        }

        res.json({
            success: true,
            analysis: analysisText,
            blueprint: parsedBlueprint,
            experience: parsedExperience,
            type: type,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            error: 'An unexpected error occurred'
        });
    }
});

// ============================================
// CLIENT ENDPOINTS (Coach access)
// ============================================

// Get all clients (for Coach Hub)
app.get('/api/clients', async (req, res) => {
    try {
        // Get all users from database with full details
        const result = await db.pool.query(
            'SELECT id, email, name, full_name, programme_access, programme_status, created_at, last_login FROM users ORDER BY created_at DESC'
        );
        const users = result.rows;

        // Get homework for all clients
        const homeworkResult = await db.pool.query(
            `SELECT h.*, u.email
             FROM homework h
             JOIN users u ON h.user_id = u.id
             ORDER BY h.updated_at DESC`
        );

        // Create homework lookup by email
        const homeworkByEmail = {};
        homeworkResult.rows.forEach(hw => {
            if (!homeworkByEmail[hw.email]) {
                homeworkByEmail[hw.email] = [];
            }
            homeworkByEmail[hw.email].push(hw);
        });

        // Transform to client format expected by coach-hub
        const clients = users.map(user => {
            const clientHomework = homeworkByEmail[user.email] || [];

            // Calculate homework progress
            let homeworkProgress = 0;
            let latestHomeworkUpdate = null;

            clientHomework.forEach(hw => {
                if (hw.progress > homeworkProgress) {
                    homeworkProgress = hw.progress;
                }
                if (!latestHomeworkUpdate || new Date(hw.updated_at) > new Date(latestHomeworkUpdate)) {
                    latestHomeworkUpdate = hw.updated_at;
                }
            });

            return {
                id: user.id,
                full_name: user.full_name || user.name || user.email.split('@')[0],
                name: user.full_name || user.name || user.email.split('@')[0],
                email: user.email,
                programme_type: user.programme_access || 'career',
                programme_status: user.programme_status || 'enrolled',
                status: user.programme_status || 'enrolled',
                enrolled_date: user.created_at,
                last_login: user.last_login,
                folder: (user.full_name || user.name || user.email.split('@')[0]).replace(/\s+/g, '_'),
                homework: clientHomework,
                homework_progress: homeworkProgress,
                homework_updated: latestHomeworkUpdate
            };
        });

        console.log(`📋 Returning ${clients.length} clients with homework data from PostgreSQL`);
        res.json({ success: true, clients });
    } catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single client by email
app.get('/api/clients/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const result = await db.pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Client not found' });
        }

        const user = result.rows[0];

        // Get their latest blueprint and homework
        const blueprint = await db.getLatestBlueprint(user.id);
        const homework = await db.getAllHomework(email);

        const client = {
            id: user.id,
            full_name: user.full_name || user.name || user.email.split('@')[0],
            name: user.full_name || user.name || user.email.split('@')[0],
            email: user.email,
            programme_type: user.programme_access || 'career',
            programme_status: user.programme_status || 'enrolled',
            status: user.programme_status || 'enrolled',
            enrolled_date: user.created_at,
            last_login: user.last_login,
            folder: (user.full_name || user.name || user.email.split('@')[0]).replace(/\s+/g, '_'),
            blueprint: blueprint,
            homework: homework
        };

        res.json({ success: true, client });
    } catch (error) {
        console.error('Get client error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update client status
app.patch('/api/clients/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { programme_status, programme_type, name, full_name } = req.body;

        console.log(`📝 Updating client ${email}:`, { programme_status, programme_type, name, full_name });

        // Find user
        const userResult = await db.pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Client not found' });
        }

        const userId = userResult.rows[0].id;

        // Update user - build dynamic UPDATE query
        const updates = [];
        const values = [];
        let paramCount = 1;

        // Update name
        if (name) {
            updates.push(`name = $${paramCount}`);
            values.push(name);
            paramCount++;
        }

        // Update full_name
        if (full_name) {
            updates.push(`full_name = $${paramCount}`);
            values.push(full_name);
            paramCount++;
        }

        // Update programme_type (stored as programme_access)
        if (programme_type) {
            updates.push(`programme_access = $${paramCount}`);
            values.push(programme_type);
            paramCount++;
        }

        // Update programme_status - THIS WAS MISSING!
        if (programme_status) {
            updates.push(`programme_status = $${paramCount}`);
            values.push(programme_status);
            paramCount++;
        }

        if (updates.length > 0) {
            updates.push(`updated_at = NOW()`);
            values.push(userId);

            const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`;
            console.log(`📝 SQL: ${query}`, values);

            await db.pool.query(query, values);
        }

        console.log(`✅ Updated client: ${email}`);
        res.json({ success: true, message: 'Client updated' });
    } catch (error) {
        console.error('Update client error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// HOMEWORK ENDPOINTS
// ============================================

// Save homework responses (POST)
app.post('/api/homework', async (req, res) => {
    try {
        const { client_email, homework_type, responses } = req.body;

        if (!client_email || !homework_type || !responses) {
            return res.status(400).json({
                success: false,
                error: 'client_email, homework_type, and responses are required'
            });
        }

        const homework = await db.saveHomework(client_email, homework_type, responses);
        console.log(`✅ Homework saved: ${client_email} - ${homework_type} (${responses.progress || 0}% complete)`);

        res.json({ success: true, homework });
    } catch (error) {
        console.error('Homework save error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get homework responses (GET)
app.get('/api/homework/:clientEmail/:homeworkType', async (req, res) => {
    try {
        const { clientEmail, homeworkType } = req.params;

        const homework = await db.getHomework(clientEmail, homeworkType);

        if (!homework) {
            return res.json({
                success: true,
                homework: null,
                message: 'No homework found for this client and type'
            });
        }

        res.json({ success: true, homework });
    } catch (error) {
        console.error('Homework fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all homework for a client (GET)
app.get('/api/homework/:clientEmail', async (req, res) => {
    try {
        const { clientEmail } = req.params;

        const homeworkList = await db.getAllHomework(clientEmail);

        res.json({ success: true, homework: homeworkList });
    } catch (error) {
        console.error('Homework list error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// SPARK COLLECTOR ENDPOINTS
// ============================================

// Save Spark Collector data (POST)
app.post('/api/spark-collector', async (req, res) => {
    try {
        const { client_email, data } = req.body;

        if (!client_email || !data) {
            return res.status(400).json({
                success: false,
                error: 'client_email and data are required'
            });
        }

        const result = await db.saveSparkCollector(client_email, data);
        console.log(`✨ Spark Collector saved: ${client_email} (${data.stats?.totalWins || 0} total wins)`);

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Spark Collector save error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Spark Collector data (GET)
app.get('/api/spark-collector/:clientEmail', async (req, res) => {
    try {
        const { clientEmail } = req.params;

        const data = await db.getSparkCollector(clientEmail);

        res.json({
            success: true,
            data: data || { wins: {}, firstSteps: {}, stats: { totalWins: 0, bestStreak: 0, currentStreak: 0 } }
        });
    } catch (error) {
        console.error('Spark Collector fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// EMERGENCY SUPPORT ENDPOINT
// ============================================

// Emergency alert - sends email to Lisa
app.post('/api/emergency-alert', async (req, res) => {
    try {
        const { clientName, clientEmail, timestamp, type } = req.body;

        console.log('🆘 EMERGENCY ALERT RECEIVED:');
        console.log(`   Client: ${clientName}`);
        console.log(`   Email: ${clientEmail}`);
        console.log(`   Time: ${timestamp}`);
        console.log(`   Type: ${type}`);

        // For now, log the alert - email integration can be added later
        // Options for email:
        // 1. Use SendGrid API
        // 2. Use Nodemailer with SMTP
        // 3. Use SparkHub backend /api/email/ endpoint

        // Try to send via SparkHub backend if available
        try {
            const fetch = (await import('node-fetch')).default;
            const sparkHubResponse = await fetch('https://sparkhub-be-qtmmb.ondigitalocean.app/api/email/send/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: 'lisa@harnessthespark.com',
                    subject: `🆘 URGENT: Emergency Support Request from ${clientName}`,
                    body: `
EMERGENCY SUPPORT REQUEST

Client: ${clientName}
Email: ${clientEmail}
Time: ${new Date(timestamp).toLocaleString('en-GB')}

A client has pressed the emergency support button on the AuDHD Coaching Portal.

Please respond as soon as possible.

---
This alert was sent automatically from the AuDHD Coaching Portal.
                    `.trim()
                })
            });

            if (sparkHubResponse.ok) {
                console.log('✅ Emergency alert email sent via SparkHub backend');
            }
        } catch (emailError) {
            console.log('⚠️ Could not send via SparkHub backend, alert logged only:', emailError.message);
        }

        // Always return success - the alert was logged
        res.json({
            success: true,
            message: 'Emergency alert received and logged',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Emergency alert error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// ADMIN: Clear test account data
// ============================================
app.post('/api/admin/clear-test-data', async (req, res) => {
    try {
        const { email, adminKey } = req.body;

        // Simple admin key check (set in environment)
        const expectedKey = process.env.ADMIN_KEY || 'sparkhub2025';
        if (adminKey !== expectedKey) {
            return res.status(401).json({ success: false, error: 'Invalid admin key' });
        }

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email required' });
        }

        console.log(`🧹 Clearing test data for: ${email}`);

        // Find user
        const userResult = await db.pool.query(
            'SELECT id, email, name FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.json({ success: true, message: 'No user found - nothing to clear' });
        }

        const user = userResult.rows[0];
        console.log(`   Found user: ${user.id}`);

        // Delete blueprints
        const blueprintResult = await db.pool.query(
            'DELETE FROM blueprints WHERE user_id = $1 RETURNING id',
            [user.id]
        );
        console.log(`   Deleted ${blueprintResult.rowCount} blueprints`);

        // Delete homework
        const homeworkResult = await db.pool.query(
            'DELETE FROM homework WHERE user_id = $1 RETURNING id',
            [user.id]
        );
        console.log(`   Deleted ${homeworkResult.rowCount} homework records`);

        res.json({
            success: true,
            message: `Cleared data for ${email}`,
            deleted: {
                blueprints: blueprintResult.rowCount,
                homework: homeworkResult.rowCount
            }
        });
    } catch (error) {
        console.error('Clear test data error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all users (for debugging)
app.get('/api/admin/all-users', async (req, res) => {
    try {
        const result = await db.pool.query(
            'SELECT id, email, name, is_admin, created_at FROM users ORDER BY created_at DESC LIMIT 50'
        );
        res.json({ success: true, users: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Set user as admin
app.post('/api/admin/set-admin', async (req, res) => {
    try {
        const { email, isAdmin, adminKey } = req.body;

        const expectedKey = process.env.ADMIN_KEY || 'sparkhub2025';
        if (adminKey !== expectedKey) {
            return res.status(401).json({ success: false, error: 'Invalid admin key' });
        }

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email required' });
        }

        const result = await db.pool.query(
            'UPDATE users SET is_admin = $1, updated_at = NOW() WHERE email = $2 RETURNING id, email, name, is_admin',
            [isAdmin !== false, email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error('Set admin error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 8080;

async function startServer() {
    // Initialise database if configured
    if (process.env.DATABASE_URL) {
        try {
            await db.initDatabase();
            console.log('📦 Database: Connected and initialised');
        } catch (error) {
            console.error('❌ Database initialisation failed:', error.message);
            console.log('⚠️  Server will run without database persistence');
        }
    } else {
        console.log('⚠️  DATABASE_URL not set - running without persistence');
    }

    app.listen(PORT, () => {
        console.log(`\n✅ Spark Your Potential server running on port ${PORT}`);
        console.log(`🤖 AI Analysis: ${process.env.ANTHROPIC_API_KEY ? 'ENABLED' : 'DISABLED'}`);
        console.log(`📦 Database: ${process.env.DATABASE_URL ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
        console.log(`\n📍 Endpoints:`);
        console.log(`   GET  /           → Questionnaire`);
        console.log(`   GET  /dashboard  → Dashboard`);
        console.log(`   GET  /cv-builder → CV Builder`);
        console.log(`   GET  /blueprint  → Blueprint View`);
        console.log(`   POST /api/user   → Create/get user`);
        console.log(`   POST /api/blueprint → Save blueprint`);
        console.log(`   GET  /api/blueprint/:userId → Get blueprint`);
        console.log(`   POST /api/cv     → Save CV data`);
        console.log(`   GET  /api/cv/:userId → Get CV data`);
        console.log(`   POST /api/homework → Save homework responses`);
        console.log(`   GET  /api/homework/:email/:type → Get homework`);
        console.log(`   POST /api/analyze → AI analysis`);
        console.log(`   GET  /health     → Health check\n`);
    });
}

startServer();
