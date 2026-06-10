const express = require('express');
const router = express.Router();
const controller = require('../controllers/logs_controller');
const autenticar  = require('../middleware/auth_middleware');

router.get('/', autenticar, controller.listarLogs);

module.exports = router;