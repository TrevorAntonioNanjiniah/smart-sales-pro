import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/Users.js';
import webhookRoutes from './routes/webhooks.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json())

app.use('/api/users', userRoutes);
app.use('/api/webhooks', webhookRoutes);



// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    port: port
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Sales Assistant API',
    status: 'running',
    endpoints: [
      '/api/test',
      '/api/users',
      '/api/users/:clerkId'
    ]
  });
});

// MongoDB connection event listeners
mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.log('🔴 MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 MongoDB disconnected');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.DB_NAME || 'smart_sales_db',
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📍 Test endpoint: http://localhost:${port}/api/test`);
    console.log(`📍 Users endpoint: http://localhost:${port}/api/users`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port} (without database)`);
  });


});