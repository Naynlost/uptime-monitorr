const express = require('express');
const router = express.Router();
const { createMonitor, getMonitors, deleteMonitor } = require('../controllers/monitor.controller'); 
const checkAuth = require('../middlewares/auth.middleware');

router.post('/', checkAuth, createMonitor);
router.get('/', checkAuth, getMonitors);
router.delete('/:id', checkAuth, deleteMonitor); 

module.exports = router;