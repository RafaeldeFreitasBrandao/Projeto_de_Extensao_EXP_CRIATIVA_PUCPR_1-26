const express = require('express');
const router = express.Router();
const controller = require('../controllers/guardians_controller.js');
const autenticar = require('../middleware/auth_middleware.js');

router.get('/', autenticar, controller.listarResponsaveis);
router.post('/', autenticar, controller.criarResponsavel);
router.get('/:id', autenticar, controller.detalharResponsavel);
router.put('/:id', autenticar, controller.editarResponsavel);

router.delete('/:id', autenticar, controller.excluirResponsavel);

module.exports = router;

