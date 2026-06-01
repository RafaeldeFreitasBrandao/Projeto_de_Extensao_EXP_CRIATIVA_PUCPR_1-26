const express = require('express');
const router = express.Router();

const autenticar = require('../middleware/auth_middleware.js');
const controller = require('../controllers/forms_controller.js');


router.get('/', autenticar, controller.listarFormularios);
router.post('/', autenticar, controller.criarFormulario);
router.get('/:id', autenticar, controller.detalharFormulario);
router.put('/:id', autenticar, controller.editarFormulario);



module.exports = router;