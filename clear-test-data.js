/**
 * Clear test account data from SYP database
 * Run with: node clear-test-data.js
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function clearTestData() {
    const testEmail = 'lisa.gills@icloud.com';

    console.log('Looking for user:', testEmail);

    // Find user
    const userResult = await pool.query(
        'SELECT id, email, name FROM users WHERE email = $1',
        [testEmail]
    );

    if (userResult.rows.length === 0) {
        console.log('No user found with that email in SYP database');
        process.exit(0);
        return;
    }

    const user = userResult.rows[0];
    console.log('Found user:', user.id, '-', user.name || 'No name');

    // Check blueprints
    const blueprintResult = await pool.query(
        'SELECT id, name, created_at FROM blueprints WHERE user_id = $1',
        [user.id]
    );

    console.log('Found', blueprintResult.rows.length, 'blueprints:');
    blueprintResult.rows.forEach(bp => {
        console.log('  -', bp.id, ':', bp.name || 'Unnamed', '(' + bp.created_at + ')');
    });

    // Delete blueprints for this user
    if (blueprintResult.rows.length > 0) {
        await pool.query('DELETE FROM blueprints WHERE user_id = $1', [user.id]);
        console.log('Deleted', blueprintResult.rows.length, 'blueprints');
    }

    console.log('Done! Test account data cleared.');
    process.exit(0);
}

clearTestData().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
