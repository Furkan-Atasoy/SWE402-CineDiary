const { poolPromise, sql } = require('../config/db');
const redisClient = require('../config/redis');

// Normalization function
const normalize = (title) => {
    return title.trim()
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

exports.getTrending = async (req, res) => {
    try {
        const cacheKey = 'trending_movies';
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            return res.json(JSON.parse(cachedData));
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT TOP 10 * FROM Movies ORDER BY ReviewCount DESC, LastReviewAt DESC');

        const trending = result.recordset;
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(trending)); // Cache for 1 hour

        res.json(trending);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.findOrCreateMovie = async (title) => {
    const normalizedTitle = normalize(title);
    const pool = await poolPromise;

    // Check if exists
    let result = await pool.request()
        .input('title', sql.NVarChar, normalizedTitle)
        .query('SELECT MovieID FROM Movies WHERE TitleNormalized = @title');

    if (result.recordset.length > 0) {
        // Increment count
        const movieId = result.recordset[0].MovieID;
        await pool.request()
            .input('id', sql.Int, movieId)
            .query('UPDATE Movies SET ReviewCount = ReviewCount + 1, LastReviewAt = GETDATE() WHERE MovieID = @id');
        return movieId;
    } else {
        // Create new
        const insertResult = await pool.request()
            .input('title', sql.NVarChar, normalizedTitle)
            .query('INSERT INTO Movies (TitleNormalized, ReviewCount) OUTPUT INSERTED.MovieID VALUES (@title, 1)');
        return insertResult.recordset[0].MovieID;
    }
};
