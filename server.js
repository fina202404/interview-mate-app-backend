const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const questionRoutes = require('./routes/questionRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const progressRoutes = require('./routes/progressRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const interviewRoutes = require('./routes/interviewRoutes');

const { handleStripeWebhook } = require('./controllers/webhookController');


// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
}));

app.use((req, res, next) => {
  console.log(`--- SERVER RECEIVED REQUEST --- Method: [${req.method}], URL: [${req.originalUrl}]`);
  next();
});


app.post('/api/checkout/webhook', express.raw({type: 'application/json'}), handleStripeWebhook);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/get-questions', questionRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/checkout', checkoutRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err.message || err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `File Upload Error: ${err.message}`,
      code: err.code
    });
  }
  if (err.message === 'Only PDF files are allowed!') {
    return res.status(400).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    message: message,
  });
});


const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message || err}`);
  server.close(() => process.exit(1));
});