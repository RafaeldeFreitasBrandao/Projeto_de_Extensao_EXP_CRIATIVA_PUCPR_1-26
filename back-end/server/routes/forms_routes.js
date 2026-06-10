const express = require('express');
const router = express.Router();

const autenticar = require('../middleware/auth_middleware.js');
const controller = require('../controllers/forms_controller.js');


router.get('/', autenticar, controller.listarFormularios);
router.post('/', autenticar, controller.criarFormulario);
router.get('/admin/todos', autenticar, controller.listarTodosFormularios);
router.get('/admin/:id', autenticar, controller.detalharFormularioAdmin);
router.get('/:id', autenticar, controller.detalharFormulario);
router.put('/:id', autenticar, controller.editarFormulario);
router.delete('/:id', autenticar, controller.excluirFormulario);


module.exports = router;