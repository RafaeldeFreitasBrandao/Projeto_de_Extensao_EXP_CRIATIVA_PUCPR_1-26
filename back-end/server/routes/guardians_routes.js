const express = require('express');
const router = express.Router();
const controller = require('../controllers/guardians_controller.js');
const autenticar = require('../middleware/auth_middleware.js');

router.get('/', autenticar, controller.listarResponsaveis);
router.post('/', autenticar, controller.criarResponsaveis);
router.put('/:id', autenticar, controller.editarResponsaveis);

module.exports = router;

