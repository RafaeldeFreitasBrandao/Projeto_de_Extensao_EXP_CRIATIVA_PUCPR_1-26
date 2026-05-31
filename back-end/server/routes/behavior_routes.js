const express = require('express');
const router = express.Router();

const autenticar = require('../middleware/auth_middleware.js');
const controller = require('../controllers/controller_behavior.js');

router.get('/', autenticar, controller.listarComportamentos);

module.exports = router;