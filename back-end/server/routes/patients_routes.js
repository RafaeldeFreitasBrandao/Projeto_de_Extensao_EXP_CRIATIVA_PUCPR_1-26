const express = require('express');
const router  = express.Router();
const controller = require('../controllers/pacients_controller.js');
const autenticar = require('../middleware/auth_middleware.js');

router.get('/', autenticar, controller.listarPacientes);
router.post('/',autenticar, controller.criarPaciente);
router.put('/:id', autenticar, controller.editarPaciente);

module.exports = router;