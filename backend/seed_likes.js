// Run from: cd backend && node ../seed_likes.js
const sql = require('mssql');

const dbConfig = {
    user: 'sa', password: 'furk@n1726', server: 'localhost', database: 'CineDiary',
    options: { encrypt: false, trustServerCertificate: true }
};

async function seedLikes() {
    console.log('Connecting to seed likes...');
    const pool = await sql.connect(dbConfig);
    
    // 1. Clear existing likes
    await pool.request().query("DELETE FROM ReviewLikes");
    await pool.request().query("UPDATE Reviews SET LikeCount = 0");
    
    // 2. Get all users and all public published reviews
    const usersRes = await pool.request().query("SELECT UserID FROM Users WHERE Role = 'User'");
    const reviewsRes = await pool.request().query("SELECT ReviewID FROM Reviews WHERE Visibility = 'Public' AND Status = 'Published'");
    
    const users = usersRes.recordset;
    const reviews = reviewsRes.recordset;
    
    console.log(`Seeding likes for ${reviews.length} reviews from ${users.length} users...`);
    
    for (const review of reviews) {
        // Randomly decide how many likes this review gets: 
        // 40% chance: 0-2 likes
        // 40% chance: 3-10 likes
        // 20% chance: 15-35 likes (viral)
        let likeTarget = 0;
        const rand = Math.random();
        if (rand < 0.4) {
            likeTarget = Math.floor(Math.random() * 3); // 0, 1, 2
        } else if (rand < 0.8) {
            likeTarget = Math.floor(Math.random() * 8) + 3; // 3-10
        } else {
            likeTarget = Math.floor(Math.random() * 20) + 15; // 15-35
        }
        
        // Ensure we don't try to exceed user count minus self if we cared, but let's just pick random users
        const shufflers = [...users].sort(() => 0.5 - Math.random());
        const likers = shufflers.slice(0, Math.min(likeTarget, users.length));
        
        for (const liker of likers) {
            await pool.request()
                .input('rid', sql.Int, review.ReviewID)
                .input('uid', sql.Int, liker.UserID)
                .query("INSERT INTO ReviewLikes (ReviewID, UserID) VALUES (@rid, @uid)");
        }
        
        await pool.request()
            .input('rid', sql.Int, review.ReviewID)
            .input('count', sql.Int, likers.length)
            .query("UPDATE Reviews SET LikeCount = @count WHERE ReviewID = @rid");
            
        process.stdout.write(`\r  Review ${review.ReviewID}: ${likers.length} likes`);
    }
    
    console.log('\n✅ Likes seeded successfully.');
    process.exit(0);
}

seedLikes().catch(err => { console.error(err); process.exit(1); });
