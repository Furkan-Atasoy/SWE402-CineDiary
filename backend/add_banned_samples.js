const sql = require('mssql');
require('dotenv').config({ path: './backend/.env' });

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function addBannedSamples() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to database.');

        const bannedUsers = [
            { username: 'banned_24h', email: 'banned24@example.com', banCount: 1, banUntil: 'DATEADD(hour, 20, GETDATE())', isPermanent: 0 },
            { username: 'banned_7d', email: 'banned7d@example.com', banCount: 2, banUntil: 'DATEADD(day, 5, GETDATE())', isPermanent: 0 },
            { username: 'banned_30d', email: 'banned30d@example.com', banCount: 3, banUntil: 'DATEADD(day, 25, GETDATE())', isPermanent: 0 },
            { username: 'banned_perm', email: 'perm@example.com', banCount: 4, banUntil: 'NULL', isPermanent: 1 }
        ];

        console.log(`Adding ${bannedUsers.length} banned sample users...`);

        for (const u of bannedUsers) {
            await pool.request()
                .input('name', sql.NVarChar, u.username)
                .input('email', sql.NVarChar, u.email)
                .input('bc', sql.Int, u.banCount)
                .input('perm', sql.Bit, u.isPermanent)
                .query(`
                    IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = @name)
                    BEGIN
                        INSERT INTO Users (Username, Email, PasswordHash, BanCount, IsBanned, BannedUntil)
                        VALUES (@name, @email, 'dummyhash', @bc, @perm, ${u.banUntil});
                    END
                    ELSE
                    BEGIN
                         UPDATE Users SET BanCount = @bc, IsBanned = @perm, BannedUntil = ${u.banUntil} WHERE Username = @name;
                    END
                `);
        }

        console.log('✅ Banned samples added successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

addBannedSamples();
