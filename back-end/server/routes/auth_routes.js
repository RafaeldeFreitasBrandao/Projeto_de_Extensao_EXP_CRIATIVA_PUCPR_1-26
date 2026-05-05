const express = require('express');
const router  = express.Router();
const controller = require('..controllers/auth_controller');

router.post('/login', controller.login) // definindo o endpoint do login

module.exports = router;