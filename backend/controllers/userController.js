const { poolPromise, sql } = require('../config/db');

// Search users by username
exports.searchUsers = async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length < 1) return res.json([]);

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('query', sql.NVarChar, `%${q.trim()}%`)
            .query(`
                SELECT u.UserID, u.Username, u.CreatedAt,
                       COUNT(r.ReviewID) AS ReviewCount
                FROM Users u
                LEFT JOIN Reviews r ON r.UserID = u.UserID AND r.Visibility = 'Public' AND r.Status = 'Published'
                WHERE u.Username LIKE @query AND u.IsBanned = 0
                GROUP BY u.UserID, u.Username, u.CreatedAt
                ORDER BY ReviewCount DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get public profile of a user by ID
exports.getUserProfile = async (req, res) => {
    const { userId } = req.params;
    try {
        const pool = await poolPromise;

        // Get user info
        const userResult = await pool.request()
            .input('uid', sql.Int, userId)
            .query('SELECT UserID, Username, CreatedAt FROM Users WHERE UserID = @uid AND IsBanned = 0');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get their public published reviews
        const reviewsResult = await pool.request()
            .input('uid', sql.Int, userId)
            .query(`
                SELECT r.ReviewID, r.Rating, r.Comment, r.CreatedAt, m.TitleNormalized, u.Username
                FROM Reviews r
                JOIN Movies m ON r.MovieID = m.MovieID
                JOIN Users u ON r.UserID = u.UserID
                WHERE r.UserID = @uid AND r.Visibility = 'Public' AND r.Status = 'Published'
                ORDER BY r.CreatedAt DESC
            `);

        res.json({ user: userResult.recordset[0], reviews: reviewsResult.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
