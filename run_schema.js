const sql = require('mssql');
require('dotenv').config({ path: './backend/.env' });

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: 'master', // Start with master to create CineDiary
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const fs = require('fs');
const schema = fs.readFileSync('./database_schema.sql', 'utf8');

async function run() {
    try {
        let pool = await sql.connect(config);
        console.log('Connected to MSSQL');
        
        // Split script by GO
        const batches = schema.split(/^GO/m);
        
        for (let batch of batches) {
            if (batch.trim()) {
                await pool.request().query(batch);
            }
        }
        
        console.log('Database schema applied successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error applying schema:', err);
        process.exit(1);
    }
}

run();
