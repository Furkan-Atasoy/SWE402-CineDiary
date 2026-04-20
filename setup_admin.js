// Run from: cd backend && node ../setup_admin.js
const sql = require('mssql');
const bcrypt = require('bcryptjs');

const dbConfig = {
    user: 'sa', password: 'furk@n1726', server: 'localhost', database: 'CineDiary',
    options: { encrypt: false, trustServerCertificate: true }
};

async function setupAdmin() {
    const pool = await sql.connect(dbConfig);

    // Check existing admins
    const existing = await pool.request()
        .query("SELECT UserID, Username, Email FROM Users WHERE Role = 'Admin'");

    if (existing.recordset.length > 0) {
        console.log('Existing admin accounts:');
        existing.recordset.forEach(u => console.log(`  ID:${u.UserID} | ${u.Username} | ${u.Email}`));
        console.log('\nUpdating all admin passwords to "123"...');
        const hash = await bcrypt.hash('123', 10);
        await pool.request()
            .input('h', sql.NVarChar, hash)
            .query("UPDATE Users SET PasswordHash = @h WHERE Role = 'Admin'");
        console.log('✅ Admin password updated to: 123');
    } else {
        console.log('No admin found. Creating admin account...');
        const hash = await bcrypt.hash('123', 10);
        await pool.request()
            .input('h', sql.NVarChar, hash)
            .query(`
                INSERT INTO Users (Username, Email, PasswordHash, Role, IsBanned)
                VALUES ('admin', 'admin@cinediary.com', @h, 'Admin', 0)
            `);
        console.log('✅ Admin created:\n  Email: admin@cinediary.com\n  Password: 123');
    }
    process.exit(0);
}

setupAdmin().catch(err => { console.error(err.message); process.exit(1); });
