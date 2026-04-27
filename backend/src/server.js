import express from 'express';
import cors from 'cors';

const app = express();

// ✅ CORS FIX (this solves your error)
app.use(cors({
  origin: '*'
}));

// ✅ JSON middleware
app.use(express.json());

// ✅ Test route
app.get('/api', (req, res) => {
  res.json({ message: 'API is working 🚀' });
});

// ✅ KEEP YOUR EXISTING ROUTES BELOW
// IMPORTANT: do NOT remove your routes
// Example:
// import projectRoutes from './routes/projectRoutes.js';
// app.use('/api/projects', projectRoutes);

export default app;