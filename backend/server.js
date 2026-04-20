const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Database and Redis connections are handled in their respective config files
// which are imported within the controllers/routes.

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`CineDiary Backend listening on port ${PORT}`);
});
