/**
 * Spark Your Potential - Express Server
 * Career positioning toolkit with PostgreSQL persistence
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const db = require('./db');

// ============================================
// GOOGLE OAUTH CONFIGURATION
// ============================================

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://potential.harnessthespark.com/api/gmail/callback';

// Gmail API scopes
const GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
];

// Create OAuth2 client
function createOAuth2Client() {
    return new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
    );
}

// Get authenticated Gmail client for a coach
async function getGmailClient(coachEmail) {
    const settings = await db.getOrCreateCoachSettings(coachEmail);

    if (!settings.gmail_access_token) {
        throw new Error('Gmail not connected');
    }

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
        access_token: settings.gmail_access_token,
        refresh_token: settings.gmail_refresh_token,
        expiry_date: settings.gmail_token_expires ? new Date(settings.gmail_token_expires).getTime() : null
    });

    // Handle token refresh
    oauth2Client.on('tokens', async (tokens) => {
        console.log('Gmail tokens refreshed for:', coachEmail);
        await db.updateCoachSettings(coachEmail, {
            gmail_access_token: tokens.access_token,
            gmail_token_expires: tokens.expiry_date ? new Date(tokens.expiry_date) : null
        });
    });

    return google.gmail({ version: 'v1', auth: oauth2Client });
}

const app = express();

// ============================================
// EMAIL CONFIGURATION
// ============================================

// Configure nodemailer transporter
// Uses SMTP settings from environment variables
const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Send password reset email
async function sendPasswordResetEmail(toEmail, resetToken, clientName) {
    const resetUrl = `${process.env.APP_URL || 'https://potential.harnessthespark.com'}/reset-password.html?token=${resetToken}`;

    const mailOptions = {
        from: `"Harness the Spark" <${process.env.SMTP_USER || 'lisa@harnessthespark.com'}>`,
        to: toEmail,
        subject: 'Reset Your Password - Spark Your Potential',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #2d1b4e; font-size: 24px; margin: 0; }
        .content { background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white !important; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 14px; }
        .warning { color: #dc2626; font-size: 13px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reset Your Password</h1>
        </div>
        <div class="content">
            <p>Hi${clientName ? ` ${clientName}` : ''},</p>
            <p>We received a request to reset your password for your Spark Your Potential account.</p>
            <p>Click the button below to set a new password:</p>
            <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #8B5CF6;">${resetUrl}</p>
            <p class="warning">⏰ This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>Harness the Spark<br>
            <a href="mailto:lisa@harnessthespark.com">lisa@harnessthespark.com</a></p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
Hi${clientName ? ` ${clientName}` : ''},

We received a request to reset your password for your Spark Your Potential account.

Click the link below to set a new password:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, you can safely ignore this email.

Harness the Spark
lisa@harnessthespark.com
        `
    };

    return emailTransporter.sendMail(mailOptions);
}

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

// Home - Redirect to Login
app.get('/', (req, res) => {
    res.redirect('/login.html');
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

// Login with email and password - authenticates via Django backend
const DJANGO_BACKEND = process.env.DJANGO_BACKEND || 'https://api.harnessthespark.ai';

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        console.log(`🔐 Login attempt for: ${email}`);

        // Step 1: Authenticate via Django backend
        // Django login accepts 'username' field which can be email or username
        const authResponse = await fetch(`${DJANGO_BACKEND}/api/accounts/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password })
        });

        const authData = await authResponse.json();

        // Django returns { tokens: { access, refresh }, user: { ... } }
        const jwtToken = authData.tokens?.access || authData.token;

        if (!authResponse.ok || !jwtToken) {
            console.log(`❌ Django auth failed for ${email}: ${authData.error || 'Invalid credentials'}`);
            return res.status(401).json({
                success: false,
                error: authData.error || 'Invalid credentials'
            });
        }

        console.log(`✅ Django auth successful for ${email}`);

        // Step 2: Fetch SYPClient data using the JWT token
        const clientResponse = await fetch(`${DJANGO_BACKEND}/api/crm/syp/clients/me/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        let clientData = null;
        if (clientResponse.ok) {
            clientData = await clientResponse.json();
            console.log(`📋 SYPClient data retrieved for ${email}: ${clientData.programme_type || 'career'}`);
        } else {
            console.log(`⚠️ No SYPClient record for ${email}, using defaults`);
        }

        // Step 3: Fetch client_tools from local PostgreSQL (if exists)
        let localUserData = null;
        try {
            const localResult = await db.pool.query(
                'SELECT client_tools FROM users WHERE email = $1',
                [email]
            );
            if (localResult.rows.length > 0) {
                localUserData = localResult.rows[0];
            }
        } catch (dbErr) {
            // Ignore - local users table may not have this user
        }

        // Step 4: Build user response combining Django auth + SYPClient data + local data
        const user = {
            id: authData.user?.id || authData.id,
            email: email,
            name: clientData?.full_name || authData.user?.first_name || email.split('@')[0],
            is_admin: authData.user?.is_staff || false,
            programme_access: clientData?.programme_type || 'career',
            programme_status: clientData?.programme_status || 'enrolled',
            must_change_password: clientData?.must_change_password || false,
            jwt_token: jwtToken,
            client_tools: localUserData?.client_tools || null
        };

        // Ensure user exists in local PostgreSQL (for Spark Collector, Foundations, etc.)
        try {
            await db.pool.query(
                `INSERT INTO users (email, name, last_login, created_at)
                 VALUES ($1, $2, NOW(), NOW())
                 ON CONFLICT (email) DO UPDATE SET
                     name = COALESCE(EXCLUDED.name, users.name),
                     last_login = NOW()`,
                [email, user.name]
            );
            console.log(`📦 User synced to local PostgreSQL: ${email}`);
        } catch (dbErr) {
            console.warn(`⚠️ Failed to sync user to local DB: ${dbErr.message}`);
        }

        console.log(`🎉 Login successful for ${email} - programme: ${user.programme_access}`);
        res.json({ success: true, user });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Setup coach account (one-time setup)
app.post('/api/setup-coach', async (req, res) => {
    try {
        const { email, name, password, setupKey } = req.body;

        // Simple setup key for security - only works once
        if (setupKey !== 'spark2025setup') {
            return res.status(403).json({ success: false, error: 'Invalid setup key' });
        }

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const user = await db.createCoachAccount(email, name || email.split('@')[0], password);
        console.log(`🔥 Coach account created/updated: ${email}`);

        res.json({ success: true, user: { email: user.email, name: user.name, is_admin: user.is_admin } });
    } catch (error) {
        console.error('Coach setup error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Password validation helper
function validatePasswordStrength(password) {
    const errors = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('an uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('a lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('a number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('a special character');
    return errors;
}

// Change password (used after first login with temp password)
app.post('/api/change-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ success: false, error: 'Email and new password are required' });
        }

        // Validate password strength
        const passwordErrors = validatePasswordStrength(newPassword);
        if (passwordErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Password must include: ${passwordErrors.join(', ')}`
            });
        }

        const result = await db.changePassword(email, newPassword);
        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Request password reset - generates token and sends email
app.post('/api/request-password-reset', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        console.log(`🔐 Password reset requested for: ${email} at ${new Date().toISOString()}`);

        // Try to create a reset token (will fail silently if email doesn't exist)
        const tokenResult = await db.createPasswordResetToken(email);

        if (tokenResult.success) {
            // Get client name for personalised email
            const userResult = await db.pool.query(
                'SELECT name, full_name FROM users WHERE email = $1',
                [email]
            );
            const clientName = userResult.rows[0]?.full_name || userResult.rows[0]?.name || null;

            // Send the reset email
            try {
                await sendPasswordResetEmail(email, tokenResult.token, clientName);
                console.log(`✉️ Password reset email sent to: ${email}`);
            } catch (emailError) {
                console.error('❌ Failed to send password reset email:', emailError.message);
                // Log for Lisa to handle manually
                console.log(`📝 MANUAL RESET NEEDED for ${email} - Token: ${tokenResult.token}`);
            }
        } else {
            // Email doesn't exist - log but don't reveal
            console.log(`⚠️ Password reset requested for non-existent email: ${email}`);
        }

        // Always return success (don't reveal if email exists for security)
        res.json({ success: true, message: 'If this email exists, a reset link will be sent.' });
    } catch (error) {
        console.error('Password reset request error:', error);
        // Still return success for security
        res.json({ success: true, message: 'If this email exists, a reset link will be sent.' });
    }
});

// Reset password using token (from email link)
app.post('/api/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, error: 'Token and new password are required' });
        }

        // Validate password strength
        const passwordErrors = validatePasswordStrength(newPassword);
        if (passwordErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Password must include: ${passwordErrors.join(', ')}`
            });
        }

        // Verify the token
        const tokenResult = await db.verifyPasswordResetToken(token);
        if (!tokenResult.success) {
            return res.status(400).json({ success: false, error: tokenResult.error });
        }

        // Change the password in Django (source of truth for authentication)
        const djangoResponse = await fetch(`${DJANGO_BACKEND}/api/accounts/admin-set-password/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: tokenResult.email,
                new_password: newPassword,
                secret: process.env.PASSWORD_RESET_SECRET
            })
        });

        const djangoResult = await djangoResponse.json();
        if (!djangoResponse.ok || !djangoResult.success) {
            console.error(`❌ Django password reset failed for ${tokenResult.email}:`, djangoResult.message);
            return res.status(400).json({ success: false, error: djangoResult.message || 'Failed to reset password' });
        }

        // Also update local DB for consistency (optional, keeps local cache in sync)
        try {
            await db.changePassword(tokenResult.email, newPassword);
        } catch (localErr) {
            // Non-fatal - Django is source of truth
            console.warn(`⚠️ Local password sync failed for ${tokenResult.email}:`, localErr.message);
        }

        // Mark the token as used
        await db.markTokenUsed(token);

        console.log(`✅ Password reset successful for: ${tokenResult.email} (Django + local)`);
        res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ success: false, error: 'Failed to reset password' });
    }
});

// Verify reset token (check if valid before showing form)
app.get('/api/verify-reset-token/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const result = await db.verifyPasswordResetToken(token);
        res.json({ success: result.success, error: result.error });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ success: false, error: 'Failed to verify token' });
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

// Set must_change_password flag (admin only)
app.post('/api/admin/set-must-change-password', async (req, res) => {
    try {
        const { email, mustChange, adminKey } = req.body;

        const ADMIN_KEY = process.env.ADMIN_KEY || 'spark-admin-2025';
        if (adminKey !== ADMIN_KEY) {
            return res.status(403).json({ success: false, error: 'Invalid admin key' });
        }

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        const result = await db.setMustChangePassword(email, mustChange !== false);
        res.json(result);
    } catch (error) {
        console.error('Set must change password error:', error);
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
            'SELECT id, email, name, full_name, programme_access, programme_status, created_at, last_login, client_tools FROM users ORDER BY created_at DESC'
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
                homework_updated: latestHomeworkUpdate,
                client_tools: user.client_tools || null
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
            homework: homework,
            client_tools: user.client_tools || null
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
        const { programme_status, programme_type, name, full_name, client_tools } = req.body;

        console.log(`📝 Updating client ${email}:`, { programme_status, programme_type, name, full_name, client_tools: client_tools ? 'provided' : 'not provided' });

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

        // Update client_tools (JSONB for per-client tool customisation)
        if (client_tools !== undefined) {
            updates.push(`client_tools = $${paramCount}`);
            // Pass the object directly - pg driver handles JSONB conversion
            values.push(client_tools);
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

// Send homework email to Lisa (POST)
app.post('/api/send-homework-email', async (req, res) => {
    try {
        const { client_name, client_email, homework_type, content } = req.body;

        if (!client_name || !content) {
            return res.status(400).json({
                success: false,
                error: 'client_name and content are required'
            });
        }

        const mailOptions = {
            from: `"Lisa Gills - Harness the Spark" <${process.env.SMTP_USER || 'lisa@harnessthespark.com'}>`,
            to: 'lisa@harnessthespark.com',
            subject: `${homework_type || 'Homework'} - ${client_name}`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 650px; margin: 0 auto; background: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 600;">📝 ${homework_type || 'Homework Submission'}</h1>
        </div>

        <!-- Client Info Box -->
        <div style="background: #f8f9fa; padding: 20px 30px; border-bottom: 1px solid #e9ecef;">
            <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Client:</strong> ${client_name}</p>
            <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Email:</strong> <a href="mailto:${client_email}" style="color: #7c3aed;">${client_email || 'Not provided'}</a></p>
            <p style="margin: 0; font-size: 15px;"><strong>Submitted:</strong> ${new Date().toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px; font-size: 15px; line-height: 1.7; color: #333; white-space: pre-wrap;">
${content}
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; color: #888; font-size: 13px;">
                Sent via Harness the Spark<br>
                <a href="https://www.harnessthespark.com" style="color: #7c3aed;">www.harnessthespark.com</a>
            </p>
        </div>
    </div>
</body>
</html>
            `,
            text: `${homework_type || 'Homework'} - ${client_name}\n\nClient: ${client_name}\nEmail: ${client_email || 'Not provided'}\nSubmitted: ${new Date().toLocaleString('en-GB')}\n\n${'='.repeat(50)}\n\n${content}`
        };

        await emailTransporter.sendMail(mailOptions);
        console.log(`📧 Homework email sent: ${client_name} - ${homework_type}`);

        res.json({ success: true, message: 'Homework sent to Lisa' });
    } catch (error) {
        console.error('Homework email error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// CLIENT NOTIFICATION SYSTEM
// ============================================

// Send notification email to client (homework ready, reminders, etc.)
app.post('/api/send-client-notification', async (req, res) => {
    try {
        const { client_email, client_name, notification_type, subject, message, link, link_text } = req.body;

        if (!client_email || !client_name || !notification_type) {
            return res.status(400).json({
                success: false,
                error: 'client_email, client_name, and notification_type are required'
            });
        }

        // Build email based on notification type
        let emailSubject, emailContent;

        switch (notification_type) {
            case 'homework_ready':
                emailSubject = subject || `New Homework Ready - Spark Your Potential`;
                emailContent = `
                    <h2 style="color: #4ECDC4; margin-bottom: 20px;">New Content Ready! ✨</h2>
                    <p>Hi ${client_name},</p>
                    <p>${message || 'You have new homework waiting for you in your Career Toolkit.'}</p>
                    ${link ? `
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${link}" style="background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">${link_text || 'View Homework'}</a>
                    </div>
                    ` : ''}
                    <p style="color: #666; font-size: 14px;">Looking forward to seeing your insights!</p>
                `;
                break;

            case 'login_reminder':
                emailSubject = subject || `Your Career Toolkit is Waiting - Spark Your Potential`;
                emailContent = `
                    <h2 style="color: #4ECDC4; margin-bottom: 20px;">Still Here For You! 💪</h2>
                    <p>Hi ${client_name},</p>
                    <p>${message || "Just a gentle reminder that your Career Toolkit is ready and waiting. All your tools, homework, and resources are there whenever you need them."}</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${link || 'https://potential.harnessthespark.com/client-portal.html'}" style="background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">${link_text || 'Access Your Toolkit'}</a>
                    </div>
                    <p style="color: #666; font-size: 14px;">No rush - I'm here when you're ready.</p>
                `;
                break;

            case 'custom':
                emailSubject = subject || `Update from Spark Your Potential`;
                emailContent = `
                    <p>Hi ${client_name},</p>
                    <p>${message}</p>
                    ${link ? `
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${link}" style="background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">${link_text || 'View'}</a>
                    </div>
                    ` : ''}
                `;
                break;

            default:
                return res.status(400).json({ success: false, error: 'Invalid notification_type' });
        }

        const mailOptions = {
            from: '"Lisa Gills - Harness the Spark" <lisa@harnessthespark.com>',
            to: client_email,
            subject: emailSubject,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">
                ⚡ <span style="color: #FFB627;">Spark</span> Your Potential
            </h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            ${emailContent}
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #888; font-size: 12px;">
                Lisa Gills | Career Coach<br>
                <a href="https://www.harnessthespark.com" style="color: #4ECDC4;">www.harnessthespark.com</a>
            </p>
        </div>
    </div>
</body>
</html>
            `
        };

        await emailTransporter.sendMail(mailOptions);
        console.log(`📧 Client notification sent: ${client_email} (${notification_type})`);

        // Also save notification to database for portal display
        await db.saveNotification(client_email, {
            type: notification_type,
            subject: emailSubject,
            message: message,
            link: link,
            link_text: link_text,
            sent_at: new Date().toISOString(),
            read: false
        });

        res.json({ success: true, message: `Notification sent to ${client_name}` });
    } catch (error) {
        console.error('Client notification error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get pending notifications for a client
app.get('/api/notifications/:clientEmail', async (req, res) => {
    try {
        const { clientEmail } = req.params;
        const notifications = await db.getNotifications(clientEmail);
        res.json({ success: true, notifications: notifications || [] });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Mark notification as read
app.patch('/api/notifications/:clientEmail/:notificationId', async (req, res) => {
    try {
        const { clientEmail, notificationId } = req.params;
        await db.markNotificationRead(clientEmail, notificationId);
        res.json({ success: true });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Track last login for nudge system
app.post('/api/track-login', async (req, res) => {
    try {
        const { client_email } = req.body;
        if (!client_email) {
            return res.status(400).json({ success: false, error: 'client_email required' });
        }
        await db.trackLogin(client_email);
        res.json({ success: true });
    } catch (error) {
        console.error('Track login error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get clients who haven't logged in recently (for coach nudge list)
app.get('/api/inactive-clients', async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const clients = await db.getInactiveClients(parseInt(days));
        res.json({ success: true, clients: clients || [] });
    } catch (error) {
        console.error('Get inactive clients error:', error);
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
// FOUNDATIONS ENDPOINTS (PostgreSQL)
// ============================================

// Save Foundations data (POST)
app.post('/api/foundations', async (req, res) => {
    try {
        const { client_email, data } = req.body;

        if (!client_email || !data) {
            return res.status(400).json({
                success: false,
                error: 'client_email and data are required'
            });
        }

        const result = await db.saveFoundations(client_email, data);
        console.log(`🏗️ Foundations saved: ${client_email}`);

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Foundations save error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Foundations data (GET)
app.get('/api/foundations/:clientEmail', async (req, res) => {
    try {
        const { clientEmail } = req.params;

        const data = await db.getFoundations(clientEmail);

        res.json({
            success: true,
            data: data || null
        });
    } catch (error) {
        console.error('Foundations fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// WEEKLY CHECKIN ENDPOINTS (PostgreSQL)
// ============================================

// Save Weekly Check-in (POST)
app.post('/api/weekly-checkin', async (req, res) => {
    try {
        const { client_email, checkin_date, data } = req.body;

        if (!client_email || !data) {
            return res.status(400).json({
                success: false,
                error: 'client_email and data are required'
            });
        }

        // Use today's date if not provided
        const date = checkin_date || new Date().toISOString().split('T')[0];
        const result = await db.saveWeeklyCheckin(client_email, date, data);
        console.log(`📋 Weekly check-in saved: ${client_email} (${date})`);

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Weekly check-in save error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Weekly Check-ins (GET)
app.get('/api/weekly-checkin/:clientEmail', async (req, res) => {
    try {
        const { clientEmail } = req.params;
        const { date } = req.query;

        const data = await db.getWeeklyCheckin(clientEmail, date);

        res.json({
            success: true,
            data: data || (date ? null : [])
        });
    } catch (error) {
        console.error('Weekly check-in fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// DECISIONS ENDPOINTS (PostgreSQL)
// ============================================

// Save Decisions (POST)
app.post('/api/decisions', async (req, res) => {
    try {
        const { client_email, decision_data } = req.body;

        if (!client_email || !decision_data) {
            return res.status(400).json({
                success: false,
                error: 'client_email and decision_data are required'
            });
        }

        const result = await db.saveDecisions(client_email, decision_data);
        console.log(`⚖️ Decisions saved: ${client_email}`);

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Decisions save error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Decisions (GET)
app.get('/api/decisions/:clientEmail', async (req, res) => {
    try {
        const { clientEmail } = req.params;

        const data = await db.getDecisions(clientEmail);

        res.json({
            success: true,
            data: data || null
        });
    } catch (error) {
        console.error('Decisions fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// SESSION NOTES ENDPOINTS (PostgreSQL)
// ============================================

// Save Session Notes (POST)
app.post('/api/session-notes', async (req, res) => {
    try {
        const { client_email, session_date, notes } = req.body;

        if (!client_email || !notes) {
            return res.status(400).json({
                success: false,
                error: 'client_email and notes are required'
            });
        }

        const date = session_date || new Date().toISOString().split('T')[0];
        const result = await db.saveSessionNotes(client_email, date, notes);
        console.log(`📝 Session notes saved: ${client_email} (${date})`);

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Session notes save error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Session Notes (GET)
app.get('/api/session-notes/:clientEmail', async (req, res) => {
    try {
        const { clientEmail } = req.params;
        const { date } = req.query;

        const data = await db.getSessionNotes(clientEmail, date);

        res.json({
            success: true,
            data: data || (date ? null : [])
        });
    } catch (error) {
        console.error('Session notes fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// CAREER DISCOVERY ENDPOINTS (PostgreSQL)
// ============================================

// Save Career Discovery (POST)
app.post('/api/career-discovery', async (req, res) => {
    try {
        const { client_email, responses } = req.body;

        if (!client_email || !responses) {
            return res.status(400).json({
                success: false,
                error: 'client_email and responses are required'
            });
        }

        const result = await db.saveCareerDiscovery(client_email, responses);
        console.log(`🎯 Career discovery saved: ${client_email}`);

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Career discovery save error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Career Discovery (GET)
app.get('/api/career-discovery/:clientEmail', async (req, res) => {
    try {
        const { clientEmail } = req.params;

        const data = await db.getCareerDiscovery(clientEmail);

        res.json({
            success: true,
            data: data || null
        });
    } catch (error) {
        console.error('Career discovery fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// SPARK IGNITION ENDPOINTS (PostgreSQL)
// ============================================

// Save Spark Ignition (POST)
app.post('/api/spark-ignition', async (req, res) => {
    try {
        const { client_email, data } = req.body;

        if (!client_email || !data) {
            return res.status(400).json({
                success: false,
                error: 'client_email and data are required'
            });
        }

        const result = await db.saveSparkIgnition(client_email, data);
        console.log(`🔥 Spark Ignition saved: ${client_email}`);

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Spark Ignition save error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Spark Ignition (GET)
app.get('/api/spark-ignition/:clientEmail', async (req, res) => {
    try {
        const { clientEmail } = req.params;

        const data = await db.getSparkIgnition(clientEmail);

        res.json({
            success: true,
            data: data || null
        });
    } catch (error) {
        console.error('Spark Ignition fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// AGREEMENT ENDPOINTS (PostgreSQL)
// ============================================

// Save signed agreement
app.post('/api/agreement', async (req, res) => {
    try {
        const agreementData = req.body;

        if (!agreementData.client_email || !agreementData.signature) {
            return res.status(400).json({
                success: false,
                error: 'client_email and signature are required'
            });
        }

        const result = await db.saveAgreement(agreementData);
        console.log(`📝 Agreement signed: ${agreementData.client_name} (${agreementData.programme_type})`);

        res.json({ success: true, agreement: result });
    } catch (error) {
        console.error('Agreement save error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get agreement by email
app.get('/api/agreement/:clientEmail', async (req, res) => {
    try {
        const { clientEmail } = req.params;

        const agreement = await db.getAgreement(clientEmail);

        if (!agreement) {
            return res.json({ success: true, agreement: null });
        }

        res.json({ success: true, agreement });
    } catch (error) {
        console.error('Agreement fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// CLIENT DOCUMENTS ENDPOINTS (for Coach Hub document viewer)
// ============================================

// Get all documents for a client (by user UUID)
app.get('/api/client-documents/:clientId', async (req, res) => {
    try {
        const { clientId } = req.params;
        const documents = await db.getClientDocuments(clientId);
        res.json(documents);
    } catch (error) {
        console.error('Client documents fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single document by client ID and document type
app.get('/api/client-documents/:clientId/:docType', async (req, res) => {
    try {
        const { clientId, docType } = req.params;
        const document = await db.getClientDocument(clientId, docType);

        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        res.json(document);
    } catch (error) {
        console.error('Client document fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Save/update a client document (upsert)
app.post('/api/client-documents', async (req, res) => {
    try {
        const { client_id, document_type, file_content, client_name, document_type_display } = req.body;

        if (!client_id || !document_type || !file_content) {
            return res.status(400).json({
                success: false,
                error: 'client_id, document_type, and file_content are required'
            });
        }

        const result = await db.saveClientDocument(
            client_id,
            document_type,
            file_content,
            client_name || '',
            document_type_display || null
        );

        console.log(`📄 Document saved: ${document_type} for ${client_name || client_id}`);
        res.json({ success: true, document: result });
    } catch (error) {
        console.error('Client document save error:', error);
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
            const sparkHubResponse = await fetch('https://api.harnessthespark.ai/api/email/send/', {
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
// GMAIL OAUTH & EMAIL API (Coach Hub)
// ============================================

// Start Gmail OAuth flow
app.get('/api/gmail/auth', (req, res) => {
    try {
        const coachEmail = req.query.email;
        if (!coachEmail) {
            return res.status(400).json({ success: false, error: 'email parameter required' });
        }

        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
            return res.status(500).json({
                success: false,
                error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.'
            });
        }

        const oauth2Client = createOAuth2Client();
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: GMAIL_SCOPES,
            prompt: 'consent',
            state: Buffer.from(JSON.stringify({ email: coachEmail })).toString('base64')
        });

        console.log('Gmail OAuth started for:', coachEmail);
        res.redirect(authUrl);
    } catch (error) {
        console.error('Gmail auth error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Gmail OAuth callback
app.get('/api/gmail/callback', async (req, res) => {
    try {
        const { code, state } = req.query;

        if (!code) {
            return res.redirect('/coach-hub.html?gmail=error&reason=no_code');
        }

        // Decode state to get coach email
        let coachEmail;
        try {
            const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
            coachEmail = stateData.email;
        } catch (e) {
            return res.redirect('/coach-hub.html?gmail=error&reason=invalid_state');
        }

        const oauth2Client = createOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);

        // Get user info to verify email
        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();

        // Store tokens in database
        await db.updateCoachSettings(coachEmail, {
            gmail_connected: true,
            gmail_access_token: tokens.access_token,
            gmail_refresh_token: tokens.refresh_token,
            gmail_token_expires: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            gmail_email: userInfo.data.email
        });

        console.log('✅ Gmail connected for:', coachEmail, '- Gmail account:', userInfo.data.email);
        res.redirect('/coach-hub.html?gmail=success');
    } catch (error) {
        console.error('Gmail callback error:', error);
        res.redirect('/coach-hub.html?gmail=error&reason=' + encodeURIComponent(error.message));
    }
});

// Check Gmail connection status
app.get('/api/gmail/status', async (req, res) => {
    try {
        const coachEmail = req.query.email;
        if (!coachEmail) {
            return res.status(400).json({ success: false, error: 'email parameter required' });
        }

        const settings = await db.getOrCreateCoachSettings(coachEmail);
        res.json({
            success: true,
            connected: settings.gmail_connected || false,
            gmail_email: settings.gmail_email || null,
            oauth_configured: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)
        });
    } catch (error) {
        console.error('Gmail status error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Disconnect Gmail
app.post('/api/gmail/disconnect', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: 'email required' });
        }

        await db.updateCoachSettings(email, {
            gmail_connected: false,
            gmail_access_token: null,
            gmail_refresh_token: null,
            gmail_token_expires: null,
            gmail_email: null
        });

        console.log('Gmail disconnected for:', email);
        res.json({ success: true });
    } catch (error) {
        console.error('Gmail disconnect error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Fetch emails for MailMatrix (Eisenhower Matrix)
app.get('/api/gmail/emails', async (req, res) => {
    try {
        const coachEmail = req.query.email;
        const maxResults = parseInt(req.query.max) || 50;
        const includeAll = req.query.all === 'true'; // Option to include promotional/social

        if (!coachEmail) {
            return res.status(400).json({ success: false, error: 'email parameter required' });
        }

        console.log(`📧 Fetching emails for: ${coachEmail}`);

        const gmail = await getGmailClient(coachEmail);

        // Build query - optionally include promotional/social emails
        const query = includeAll ? 'in:inbox' : 'in:inbox -category:promotions -category:social';
        console.log(`📧 Gmail query: ${query}`);

        // Fetch emails from inbox
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: maxResults,
            q: query
        });

        console.log(`📧 Gmail API returned ${response.data.messages?.length || 0} messages`);

        if (!response.data.messages || response.data.messages.length === 0) {
            return res.json({ success: true, emails: [], total: 0 });
        }

        // Fetch details for each email
        const emails = await Promise.all(
            response.data.messages.map(async (msg) => {
                const detail = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id,
                    format: 'metadata',
                    metadataHeaders: ['From', 'Subject', 'Date']
                });

                const headers = detail.data.payload.headers;
                const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

                // Parse sender
                const fromHeader = getHeader('From');
                const senderMatch = fromHeader.match(/^(.+?)\s*<(.+?)>$/) || [null, fromHeader, fromHeader];

                return {
                    id: msg.id,
                    threadId: msg.threadId,
                    subject: getHeader('Subject'),
                    sender_name: senderMatch[1]?.trim().replace(/"/g, '') || '',
                    sender_email: senderMatch[2]?.trim() || fromHeader,
                    snippet: detail.data.snippet,
                    date: getHeader('Date'),
                    timestamp: detail.data.internalDate,
                    is_unread: detail.data.labelIds?.includes('UNREAD') || false,
                    labels: detail.data.labelIds || []
                };
            })
        );

        // Get email preferences for classification
        const prefs = await db.getEmailKeywordPreferences(coachEmail);

        // Get any cached quadrant overrides
        const cachedEmails = await db.getCachedEmails(coachEmail);
        const cachedQuadrants = {};
        cachedEmails.forEach(e => {
            if (e.quadrant) cachedQuadrants[e.email_id] = e.quadrant;
        });

        // Classify emails into quadrants (cached override takes precedence)
        const classifiedEmails = emails.map(email => {
            const quadrant = cachedQuadrants[email.id] || classifyEmail(email, prefs);
            return { ...email, quadrant };
        });

        res.json({
            success: true,
            emails: classifiedEmails,
            total: classifiedEmails.length
        });
    } catch (error) {
        console.error('Gmail fetch error:', error);
        if (error.message === 'Gmail not connected') {
            return res.status(401).json({ success: false, error: 'Gmail not connected', code: 'NOT_CONNECTED' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

// Email classification function (Eisenhower Matrix)
function classifyEmail(email, prefs) {
    const subject = (email.subject || '').toLowerCase();
    const senderEmail = (email.sender_email || '').toLowerCase();
    const senderName = (email.sender_name || '').toLowerCase();

    const urgentKeywords = prefs?.urgent_keywords || ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'deadline'];
    const importantKeywords = prefs?.important_keywords || ['invoice', 'payment', 'contract', 'meeting', 'proposal', 'client'];
    const importantDomains = prefs?.important_domains || ['gov.uk', 'nhs.uk', 'hmrc.gov.uk'];
    const lowPrioritySenders = prefs?.low_priority_senders || ['noreply', 'newsletter', 'marketing', 'notifications'];
    const lowPriorityKeywords = prefs?.low_priority_keywords || ['unsubscribe', 'promotional', 'sale', 'offer'];

    // Check for urgent signals
    const isUrgent = urgentKeywords.some(kw => subject.includes(kw)) ||
                     email.labels?.includes('IMPORTANT');

    // Check for important signals
    const isImportant = importantKeywords.some(kw => subject.includes(kw)) ||
                        importantDomains.some(domain => senderEmail.includes(domain)) ||
                        email.labels?.includes('STARRED');

    // Check for low priority signals
    const isLowPriority = lowPrioritySenders.some(sender => senderEmail.includes(sender) || senderName.includes(sender)) ||
                          lowPriorityKeywords.some(kw => subject.includes(kw));

    // Eisenhower Matrix classification
    if (isUrgent && isImportant) return 'Q1'; // Urgent & Important - Do First
    if (!isUrgent && isImportant) return 'Q2'; // Important Not Urgent - Schedule
    if (isUrgent && !isImportant) return 'Q3'; // Urgent Not Important - Delegate
    if (isLowPriority) return 'Q4'; // Neither - Consider deleting
    return 'Q2'; // Default to Important Not Urgent
}

// Mark email as done (archive/read)
app.post('/api/gmail/mark-done', async (req, res) => {
    try {
        const { email, message_id, action } = req.body;

        if (!email || !message_id) {
            return res.status(400).json({ success: false, error: 'email and message_id required' });
        }

        const gmail = await getGmailClient(email);

        if (action === 'archive') {
            // Remove from inbox (archive)
            await gmail.users.messages.modify({
                userId: 'me',
                id: message_id,
                requestBody: {
                    removeLabelIds: ['INBOX', 'UNREAD']
                }
            });
        } else {
            // Just mark as read
            await gmail.users.messages.modify({
                userId: 'me',
                id: message_id,
                requestBody: {
                    removeLabelIds: ['UNREAD']
                }
            });
        }

        // Update cache
        await db.markEmailCompleted(email, message_id);

        res.json({ success: true });
    } catch (error) {
        console.error('Mark email done error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Move email to different quadrant (drag-and-drop)
app.post('/api/gmail/move-quadrant', async (req, res) => {
    try {
        const { email, message_id, quadrant } = req.body;

        if (!email || !message_id || !quadrant) {
            return res.status(400).json({ success: false, error: 'email, message_id, and quadrant required' });
        }

        // Validate quadrant
        if (!['Q1', 'Q2', 'Q3', 'Q4'].includes(quadrant)) {
            return res.status(400).json({ success: false, error: 'Invalid quadrant (must be Q1, Q2, Q3, or Q4)' });
        }

        // Store the override in the email_cache table
        await db.updateEmailQuadrant(email, message_id, quadrant);

        console.log(`📧 Email ${message_id} moved to ${quadrant} for ${email}`);
        res.json({ success: true, quadrant });
    } catch (error) {
        console.error('Move quadrant error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get/update email preferences
app.get('/api/gmail/preferences', async (req, res) => {
    try {
        const coachEmail = req.query.email;
        if (!coachEmail) {
            return res.status(400).json({ success: false, error: 'email parameter required' });
        }

        const prefs = await db.getEmailKeywordPreferences(coachEmail);
        res.json({ success: true, preferences: prefs });
    } catch (error) {
        console.error('Get email preferences error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/gmail/preferences', async (req, res) => {
    try {
        const { email, ...preferences } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: 'email required' });
        }

        const prefs = await db.updateEmailKeywordPreferences(email, preferences);
        res.json({ success: true, preferences: prefs });
    } catch (error) {
        console.error('Update email preferences error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// AUTOMATION SETTINGS & SCHEDULER
// ============================================

// Save automation settings
app.post('/api/automation-settings', async (req, res) => {
    try {
        const { setting_key, enabled, frequency_days, config } = req.body;

        if (!setting_key) {
            return res.status(400).json({ success: false, error: 'setting_key is required' });
        }

        const settings = await db.saveAutomationSettings(setting_key, {
            enabled,
            frequency_days,
            config
        });

        console.log(`⚙️ Automation settings saved: ${setting_key} (enabled: ${enabled})`);
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Save automation settings error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all automation settings
app.get('/api/automation-settings', async (req, res) => {
    try {
        const settings = await db.getAllAutomationSettings();
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Get automation settings error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get specific automation setting
app.get('/api/automation-settings/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await db.getAutomationSettings(key);
        res.json({ success: true, setting });
    } catch (error) {
        console.error('Get automation setting error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get automation log
app.get('/api/automation-log', async (req, res) => {
    try {
        const { type, email, limit } = req.query;
        const log = await db.getAutomationLog({
            automation_type: type,
            client_email: email,
            limit: limit ? parseInt(limit) : 50
        });
        res.json({ success: true, log });
    } catch (error) {
        console.error('Get automation log error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Manually trigger automation check (for testing)
app.post('/api/run-automations', async (req, res) => {
    try {
        const results = await runAutomations();
        res.json({ success: true, results });
    } catch (error) {
        console.error('Run automations error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Run all enabled automations
 * Called by scheduler or manually via API
 */
async function runAutomations() {
    console.log('\n🤖 Running automated checks...');
    const results = {
        login_reminders: { sent: 0, skipped: 0, failed: 0 },
        homework_alerts: { sent: 0, skipped: 0, failed: 0 },
        timestamp: new Date().toISOString()
    };

    try {
        // Get all automation settings
        const settings = await db.getAllAutomationSettings();
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.setting_key] = s;
        });

        // 1. Login Reminders
        const loginReminderSetting = settingsMap['login_reminders'];
        if (loginReminderSetting && loginReminderSetting.enabled) {
            const frequencyDays = loginReminderSetting.frequency_days || 7;
            console.log(`📧 Checking login reminders (inactive ${frequencyDays}+ days)...`);

            const inactiveClients = await db.getInactiveClients(frequencyDays);
            console.log(`   Found ${inactiveClients.length} inactive clients`);

            for (const client of inactiveClients) {
                try {
                    // Check if we already sent a reminder recently
                    const alreadySent = await db.wasAutomationSentRecently(
                        'login_reminder',
                        client.email,
                        frequencyDays
                    );

                    if (alreadySent) {
                        console.log(`   ⏭️ Skipped ${client.email} (already reminded recently)`);
                        results.login_reminders.skipped++;
                        continue;
                    }

                    // Send the reminder
                    const clientName = client.full_name || client.name || client.email.split('@')[0];

                    await sendAutomatedNotification(client.email, clientName, 'login_reminder', {
                        message: "Just a gentle reminder that your Career Toolkit is ready and waiting. All your tools, homework, and resources are there whenever you need them.",
                        link: 'https://potential.harnessthespark.com/client-portal.html',
                        link_text: 'Access Your Toolkit'
                    });

                    // Log the automation
                    await db.logAutomation('login_reminder', client.email, 'sent', {
                        client_name: clientName,
                        days_inactive: frequencyDays
                    });

                    console.log(`   ✅ Sent reminder to ${client.email}`);
                    results.login_reminders.sent++;
                } catch (err) {
                    console.error(`   ❌ Failed to send to ${client.email}:`, err.message);
                    await db.logAutomation('login_reminder', client.email, 'failed', {
                        error: err.message
                    });
                    results.login_reminders.failed++;
                }
            }

            // Update last run timestamp
            await db.updateAutomationLastRun('login_reminders');
        }

        // 2. Weekly Progress Summaries (placeholder for future)
        const weeklySummarySetting = settingsMap['weekly_summaries'];
        if (weeklySummarySetting && weeklySummarySetting.enabled) {
            console.log(`📊 Weekly summaries automation enabled (not yet implemented)`);
        }

        console.log(`🤖 Automation check complete:`, results);
        return results;
    } catch (error) {
        console.error('❌ Automation runner error:', error);
        throw error;
    }
}

/**
 * Send automated notification email
 */
async function sendAutomatedNotification(clientEmail, clientName, notificationType, options = {}) {
    let emailSubject, emailContent;

    switch (notificationType) {
        case 'login_reminder':
            emailSubject = options.subject || `Your Career Toolkit is Waiting - Spark Your Potential`;
            emailContent = `
                <h2 style="color: #4ECDC4; margin-bottom: 20px;">Still Here For You! 💪</h2>
                <p>Hi ${clientName},</p>
                <p>${options.message || "Just a gentle reminder that your Career Toolkit is ready and waiting."}</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${options.link || 'https://potential.harnessthespark.com/client-portal.html'}" style="background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">${options.link_text || 'Access Your Toolkit'}</a>
                </div>
                <p style="color: #666; font-size: 14px;">No rush - I'm here when you're ready.</p>
                <p style="color: #888; font-size: 12px; margin-top: 30px;">This is an automated reminder. You can manage notification preferences in your settings.</p>
            `;
            break;

        case 'homework_ready':
            emailSubject = options.subject || `New Homework Ready - Spark Your Potential`;
            emailContent = `
                <h2 style="color: #4ECDC4; margin-bottom: 20px;">New Content Ready! ✨</h2>
                <p>Hi ${clientName},</p>
                <p>${options.message || 'You have new homework waiting for you in your Career Toolkit.'}</p>
                ${options.link ? `
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${options.link}" style="background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">${options.link_text || 'View Homework'}</a>
                </div>
                ` : ''}
                <p style="color: #666; font-size: 14px;">Looking forward to seeing your insights!</p>
            `;
            break;

        default:
            emailSubject = options.subject || `Update from Spark Your Potential`;
            emailContent = `
                <p>Hi ${clientName},</p>
                <p>${options.message}</p>
                ${options.link ? `
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${options.link}" style="background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">${options.link_text || 'View'}</a>
                </div>
                ` : ''}
            `;
    }

    const mailOptions = {
        from: '"Lisa Gills - Harness the Spark" <lisa@harnessthespark.com>',
        to: clientEmail,
        subject: emailSubject,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">
                ⚡ <span style="color: #FFB627;">Spark</span> Your Potential
            </h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            ${emailContent}
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #888; font-size: 12px;">
                Lisa Gills | Career Coach<br>
                <a href="https://www.harnessthespark.com" style="color: #4ECDC4;">www.harnessthespark.com</a>
            </p>
        </div>
    </div>
</body>
</html>
        `
    };

    await emailTransporter.sendMail(mailOptions);

    // Also save to notifications table for portal display
    await db.saveNotification(clientEmail, {
        type: notificationType,
        subject: emailSubject,
        message: options.message,
        link: options.link,
        link_text: options.link_text,
        sent_at: new Date().toISOString(),
        read: false
    });
}

/**
 * Start the automation scheduler
 * Runs every hour to check for automations to run
 */
function startAutomationScheduler() {
    // Run every hour (3600000 ms)
    const SCHEDULER_INTERVAL = 60 * 60 * 1000;

    console.log('🕐 Automation scheduler started (runs every hour)');

    // Run immediately on startup (after a short delay to let DB init)
    setTimeout(async () => {
        try {
            await runAutomations();
        } catch (error) {
            console.error('Initial automation run failed:', error.message);
        }
    }, 5000);

    // Then run every hour
    setInterval(async () => {
        try {
            await runAutomations();
        } catch (error) {
            console.error('Scheduled automation run failed:', error.message);
        }
    }, SCHEDULER_INTERVAL);
}

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

            // Start automation scheduler after database is ready
            startAutomationScheduler();
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
        console.log(`   GET  /health     → Health check`);
        console.log(`\n🤖 Automation Endpoints:`);
        console.log(`   GET  /api/automation-settings → Get all settings`);
        console.log(`   POST /api/automation-settings → Save settings`);
        console.log(`   GET  /api/automation-log → View automation history`);
        console.log(`   POST /api/run-automations → Manually trigger automations\n`);
    });
}

startServer();
