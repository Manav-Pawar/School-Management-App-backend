const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const corsOptions = {
  origin:['https://school-management-app-frontend-l4yc-hoypwi60a.vercel.app','https://school-management-app-frontend-azzc.vercel.app/','https://school-management-app-front-git-bdd816-manavs-projects-94a598ca.vercel.app/'],
  credentials:true
}

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Routes
const classRoutes = require('./routes/classes');
const teacherRoutes = require('./routes/teachers');
const studentRoutes = require('./routes/students');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/classes', classRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));