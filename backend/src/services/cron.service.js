const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const startCronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('🧹 [CRON] Veritabanı temizliği başlatılıyor...');
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = await prisma.pingLog.deleteMany({
        where: {
          createdAt: { 
            lt: sevenDaysAgo,
          },
        },
      });

      console.log(` [CRON] Temizlik bitti. Silinen eski log sayısı: ${result.count}`);
    } catch (error) {
      console.error('[CRON] Temizlik sırasında hata oluştu:', error);
    }
  });

  console.log(' Zamanlanmış görevler (Cron Jobs) aktif edildi.');
};

module.exports = { startCronJobs };