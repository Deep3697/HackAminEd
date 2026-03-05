const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());

// Routes
// app.use('/api', require('./routes/api'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
