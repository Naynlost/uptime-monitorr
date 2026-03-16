require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { startWorker } = require('./services/worker.service');
const { startCronJobs } = require('./services/cron.service');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('Yeni bir kullanıcı WebSocket ile bağlandı:', socket.id);
  
  socket.on('disconnect', () => {
    console.log(`Kullanıcı ayrıldı: ${socket.id}`);
  });
});

server.on('error', (err) => {
  console.error('Sunucu başlatılırken bir hata oluştu:', err.message);
});

server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda başarıyla başlatıldı...`);

  startWorker(io); 
  console.log('Monitoring worker aktif edildi.');

  startCronJobs();
  console.log('Cron joblar aktif edildi.');
});