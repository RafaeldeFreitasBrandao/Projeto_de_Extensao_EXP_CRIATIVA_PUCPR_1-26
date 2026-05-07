const express = require('express');
const router  = express.Router();
const controller = require('../controllers/auth_controller.js');

router.post('/login', controller.login) // definindo o endpoint do login

module.exports = router;