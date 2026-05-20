const express = require('express');
const router  = express.Router();
const controller = require('../controllers/pacients_controller.js');
const autenticar = require('../middleware/auth_middleware.js');

route.get('/', autenticar, controller.listarPacientes);
route.post('/', autenticar, controller.criarPaciente);
route.put('/:id', autenticar, controller.editarPaciente);

module.exports = router;