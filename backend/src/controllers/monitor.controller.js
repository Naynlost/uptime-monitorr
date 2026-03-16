const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createMonitor = async (req, res, next) => { 
  try {
    const { name, url, interval } = req.body;
    const userId = req.userData.userId; 

    const monitor = await prisma.monitor.create({
      data: {
        name,
        url,
        interval: parseInt(interval) || 5, 
        userId
      }
    });

    res.status(201).json({ message: 'İzleyici başarıyla eklendi', monitor });
  } catch (error) {
    next(error);
  }
};

exports.getMonitors = async (req, res, next) => {
  try {
    const userId = req.userData.userId;
    
    const monitors = await prisma.monitor.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' } 
    });
    
    res.status(200).json(monitors);
  } catch (error) {
    next(error);
  }
};

exports.deleteMonitor = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const userId = req.userData.userId;

    const monitor = await prisma.monitor.findFirst({
      where: { id: id, userId } 
    });

    if (!monitor) {
      const error = new Error('Monitör bulunamadı veya yetkiniz yok.');
      error.status = 404;
      throw error;
    }

    await prisma.monitor.delete({ where: { id: id } }); 

    res.status(200).json({ message: 'İzleyici başarıyla silindi.' });
  } catch (error) {
    next(error);
  }
};