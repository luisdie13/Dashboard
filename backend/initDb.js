const fs = require('fs');
const pool = require('./src/config/database');
require('dotenv').config();

async function initializeDatabase() {
  try {
    const sqlScript = fs.readFileSync('./database/init.sql', 'utf8');
    
    console.log('🔄 Initializing database...');
    await pool.query(sqlScript);
    console.log('✅ Database initialized successfully!');
    
    // Verify by checking if nodos table has data
    const result = await pool.query('SELECT COUNT(*) FROM nodos');
    console.log(`📊 Nodes in database: ${result.rows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
