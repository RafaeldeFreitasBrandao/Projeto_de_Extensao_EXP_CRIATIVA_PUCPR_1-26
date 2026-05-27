const express = require('express');
const router  = express.Router();

const autenticar = require('../middleware/auth_middleware.js');
const controller = require('../controllers/forms_controller.js');
const controller_behavior = require('../controllers/behaviors_controlle');

route.get('/', autenticar, controller.listarFormularios);
route.post('/', autenticar, controller.criarFormulario);
route.get('/', autenticar, controller.detalharFormulario);
route.put('/', autenticar, controller.editarFormulario);

module.exports = router;