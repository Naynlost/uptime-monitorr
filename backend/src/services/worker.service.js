const cron = require('node-cron');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { sendDiscordNotification } = require('./notification.service'); 

const prisma = new PrismaClient();

const startWorker = (io) => {
  cron.schedule('* * * * *', async () => {
    console.log('--- Arka plan kontrolü başlıyor ---');
    
    try {
      const monitors = await prisma.monitor.findMany({
        where: { isActive: true }
      });

      for (const monitor of monitors) {
        const startTime = Date.now();
        let status, isUp, responseTime;

        try {
          const response = await axios.get(monitor.url, { timeout: 10000 });
          status = response.status;
          isUp = true;
          responseTime = Date.now() - startTime;
        } catch (error) {
          status = error.response ? error.response.status : 500;
          isUp = false;
          responseTime = Date.now() - startTime;
        }

        const newLog = await prisma.pingLog.create({
          data: {
            monitorId: monitor.id,
            status: status,
            responseTime: responseTime,
            isUp: isUp
          }
        });

        io.emit('newPingResult', {
          monitorId: monitor.id,
          log: newLog
        });

        if (monitor.lastStatus !== null && monitor.lastStatus !== isUp) {
          await sendDiscordNotification(monitor.name, monitor.url, isUp);
        }

        await prisma.monitor.update({
          where: { id: monitor.id },
          data: { lastStatus: isUp }
        });

        console.log(`Kontrol Bitti: ${monitor.url} - ${isUp ? 'UP' : 'DOWN'} (${responseTime}ms)`);
      } 
    } catch (error) {
      console.error('Worker genel hatası:', error.message);
    }
  });
};

module.exports = { startWorker };