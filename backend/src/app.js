const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const monitorRoutes = require('./routes/monitor.routes');
const checkAuth = require('./middlewares/auth.middleware.js');

const app = express();

app.use(helmet()); 
app.use(cors({
  origin: "*" 
})); 
app.use(express.json()); 
app.use(morgan('dev')); 

app.use('/api/auth', authRoutes);

app.use('/api/monitors', checkAuth, monitorRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API sorunsuz çalışıyor.' });
});

app.use((req, res, next) => {
  res.status(404).json({ 
    status: 'error', 
    message: 'İstenilen kaynak (endpoint) bulunamadı.' 
  });
});

app.use((err, req, res, next) => {
  console.error('Sunucu Hatası:', err.stack);
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Sunucu tarafında beklenmedik bir hata oluştu.'
  });
});

module.exports = app;