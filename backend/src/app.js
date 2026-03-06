// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();



const webhookRoutes = require('./routes/webhooks');

const app = express();

// IMPORTANT: Webhook route must come BEFORE express.json() middleware [citation:2][citation:10]
// Webhooks need the raw body for signature verification
app.use('/api/webhooks', webhookRoutes);

// Regular middleware for all other routes
app.use(express.json());

// Your other routes here...

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.DB_NAME,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});