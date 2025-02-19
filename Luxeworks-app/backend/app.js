const express = require('express');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const membersRoutes = require('./routes/members');
const schedulingRoutes = require('./routes/scheduling');
const invoicesRoutes = require('./routes/invoices');
const workoutPlansRoutes = require('./routes/workout-plans');
const dashboardRoutes = require('./routes/dashboard');
const campaignsRoutes = require('./routes/campaigns');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:8080', credentials: true }));
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/workout-plans', workoutPlansRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/campaigns', campaignsRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));