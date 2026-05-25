const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const aiRoutes = require('./routes/ai');
const transactionRoutes = require('./routes/transactions');

app.use('/api/ai', aiRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Aura API is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
