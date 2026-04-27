import express from 'express';
import cors from 'cors';

// ✅ import your actual route file
import projectRoutes from './routes/projects.js';

const app = express();

// ✅ CORS
app.use(cors({
  origin: '*'
}));

// ✅ JSON parser
app.use(express.json());

// ✅ test route
app.get('/api', (req, res) => {
  res.json({ message: "API working ✅" });
});

// ✅ connect your routes
app.use('/api/projects', projectRoutes);

export default app;