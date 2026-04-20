// Run from: cd backend && node ../seed_db.js
const sql = require('mssql');
const bcrypt = require('bcryptjs');

const dbConfig = {
    user: 'sa',
    password: 'furk@n1726',
    server: 'localhost',
    database: 'CineDiary',
    options: { encrypt: false, trustServerCertificate: true }
};

// --- Natural, realistic usernames ---
const userPool = [
    { username: 'james_miller',    email: 'james.miller@gmail.com' },
    { username: 'sophie_turner',   email: 'sophie.turner@hotmail.com' },
    { username: 'alex_morgan',     email: 'alex.morgan@yahoo.com' },
    { username: 'emma_watson',     email: 'emmawatson82@gmail.com' },
    { username: 'liam_johnson',    email: 'liam.j1995@gmail.com' },
    { username: 'olivia_scott',    email: 'olivia.scott@outlook.com' },
    { username: 'noah_davis',      email: 'noahdavis44@gmail.com' },
    { username: 'ava_martinez',    email: 'ava.martinez@gmail.com' },
    { username: 'william_brown',   email: 'will.brown@hotmail.com' },
    { username: 'isabelle_clark',  email: 'isabelle.clark@yahoo.com' },
    { username: 'ethan_wilson',    email: 'ethanwilson@gmail.com' },
    { username: 'mia_anderson',    email: 'mia.anderson99@gmail.com' },
    { username: 'lucas_taylor',    email: 'lucas.taylor@outlook.com' },
    { username: 'charlotte_lee',   email: 'charlotte.lee@gmail.com' },
    { username: 'mason_harris',    email: 'mason.harris@hotmail.com' },
    { username: 'amelia_white',    email: 'amelia.white@gmail.com' },
    { username: 'henry_walker',    email: 'henry.walker@yahoo.com' },
    { username: 'grace_hall',      email: 'grace.hall@gmail.com' },
    { username: 'jack_robinson',   email: 'jack.robinson91@gmail.com' },
    { username: 'zoe_king',        email: 'zoe.king@outlook.com' },
];

const movieTitles = [
    "The Matrix", "Inception", "Interstellar", "The Godfather", "Pulp Fiction",
    "The Dark Knight", "Schindler's List", "Forrest Gump", "Fight Club", "The Shawshank Redemption",
    "Goodfellas", "Seven", "The Silence of the Lambs", "Saving Private Ryan", "The Green Mile",
    "Gladiator", "The Departed", "The Prestige", "Whiplash", "Parasite"
];

const comments = [
    "Genuinely one of the best films I have seen in years. The pacing is perfect.",
    "I watched this with my roommate last weekend and we could not stop talking about it.",
    "The acting is outstanding, especially in the third act. Highly recommend.",
    "Not quite what I expected but still a very solid watch overall.",
    "The cinematography alone makes this worth watching. Absolutely stunning visuals.",
    "I have seen this three times now and I notice something new every time.",
    "A bit slow in the first half but the ending completely makes up for it.",
    "This is exactly the kind of film that reminds you why cinema is an art form.",
    "Watched this on a whim and was completely blown away. What a ride.",
    "The score is phenomenal. Even without the visuals, the music tells a story.",
    "Slightly overrated in my opinion but still a genuinely enjoyable experience.",
    "Could not look away from the screen for two hours. That is the mark of great filmmaking.",
    "My favourite part was the way they built tension without relying on cheap jump scares.",
    "Rewatched this for the third time. Gets better every single viewing without exception.",
    "The writing is so sharp. Every line of dialogue feels deliberate and meaningful."
];

const normalizeTitle = (title) => {
    return title.trim().toLowerCase().split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
};

// Returns a random MSSQL-compatible datetime string between March 20 and April 19, 2026
const randomDate = () => {
    const start = new Date('2026-03-20T08:00:00');
    const end   = new Date('2026-04-19T23:59:00');
    const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    // Format: YYYY-MM-DD HH:MM:SS
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

async function reseed() {
    console.log('Connecting...');
    let pool;
    try {
        pool = await sql.connect(dbConfig);
        console.log('Connected.');

        // --- Clean old seed data ---
        console.log('Removing old FilmFan_ seed data...');
        // Delete reviews by old users first (FK constraint)
        await pool.request().query(`
            DELETE FROM BlockedReviewsLogs WHERE ReviewerID IN (SELECT UserID FROM Users WHERE Username LIKE 'FilmFan_%')
        `);
        await pool.request().query(`
            DELETE FROM Reviews WHERE UserID IN (SELECT UserID FROM Users WHERE Username LIKE 'FilmFan_%')
        `);
        await pool.request().query(`
            DELETE FROM Users WHERE Username LIKE 'FilmFan_%'
        `);
        // Reset movie review counts
        await pool.request().query(`UPDATE Movies SET ReviewCount = 0`);
        console.log('Old data removed.');

        const passwordHash = await bcrypt.hash('Password123!', 10);

        // --- Create 20 natural users with random join dates ---
        console.log('Creating 20 users with real names...');
        for (const u of userPool) {
            const joinDate = randomDate();
            await pool.request()
                .input('username', sql.NVarChar, u.username)
                .input('email',    sql.NVarChar, u.email)
                .input('password', sql.NVarChar, passwordHash)
                .input('date',     sql.DateTime, new Date(joinDate))
                .query(`
                    IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = @email)
                    INSERT INTO Users (Username, Email, PasswordHash, Role, IsBanned, CreatedAt)
                    VALUES (@username, @email, @password, 'User', 0, @date)
                `);
        }

        // Fetch new user IDs
        const usersResult = await pool.request()
            .query(`SELECT UserID FROM Users WHERE Username IN (${userPool.map(u => `'${u.username}'`).join(',')})`);
        const users = usersResult.recordset;
        console.log(`Fetched ${users.length} users.`);

        // Ensure 20 movies exist
        console.log('Ensuring movies exist...');
        const movieIds = {};
        for (const title of movieTitles) {
            const norm = normalizeTitle(title);
            let res = await pool.request()
                .input('t', sql.NVarChar, norm)
                .query('SELECT MovieID FROM Movies WHERE TitleNormalized = @t');
            if (res.recordset.length === 0) {
                res = await pool.request()
                    .input('t', sql.NVarChar, norm)
                    .query('INSERT INTO Movies (TitleNormalized, ReviewCount) OUTPUT INSERTED.MovieID VALUES (@t, 0)');
            }
            movieIds[norm] = res.recordset[0].MovieID;
        }

        // --- 10 reviews per user with random dates ---
        console.log('Inserting 200 reviews with random dates...');
        let count = 0;
        for (const user of users) {
            const chosen = [...movieTitles].sort(() => 0.5 - Math.random()).slice(0, 10);
            for (const title of chosen) {
                const norm     = normalizeTitle(title);
                const movieId  = movieIds[norm];
                const rating   = Math.floor(Math.random() * 4) + 7; // 7-10
                const comment  = comments[Math.floor(Math.random() * comments.length)];
                const reviewAt = randomDate();

                await pool.request()
                    .input('uid',  sql.Int,      user.UserID)
                    .input('mid',  sql.Int,      movieId)
                    .input('r',    sql.Int,      rating)
                    .input('c',    sql.NVarChar, comment)
                    .input('date', sql.DateTime, new Date(reviewAt))
                    .query(`
                        INSERT INTO Reviews (UserID, MovieID, Rating, Comment, Visibility, Status, CreatedAt)
                        VALUES (@uid, @mid, @r, @c, 'Public', 'Published', @date)
                    `);

                await pool.request()
                    .input('mid',  sql.Int,      movieId)
                    .input('date', sql.DateTime, new Date(reviewAt))
                    .query(`UPDATE Movies SET ReviewCount = ReviewCount + 1, LastReviewAt = @date WHERE MovieID = @mid`);

                count++;
            }
            process.stdout.write(`\r  Progress: ${count}/200`);
        }

        // Show top 5
        const top5 = await pool.request()
            .query('SELECT TOP 5 TitleNormalized, ReviewCount FROM Movies ORDER BY ReviewCount DESC');
        console.log(`\n\n✅ Done! ${count} reviews inserted.\n\nTop 5 Trending:`);
        top5.recordset.forEach((m, i) => console.log(`  #${i+1} ${m.TitleNormalized} — ${m.ReviewCount} reviews`));

        process.exit(0);
    } catch (err) {
        console.error('\nFailed:', err.message);
        process.exit(1);
    }
}

reseed();
