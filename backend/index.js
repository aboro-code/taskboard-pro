require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('./firebase');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const automationRoutes = require('./routes/automationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/automations', automationRoutes);

app.get('/', (req, res) => {
  res.send('TaskBoard Pro API is running!');
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });