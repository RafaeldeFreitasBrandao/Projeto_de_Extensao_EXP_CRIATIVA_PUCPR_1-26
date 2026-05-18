const express = require('express');
const router = express.Router();
const controller = require('../controllers/guardian_controller.js');
const autenticar = require('../middleware/auth_middleware.js');

router.get('/', autenticar, controller.listarResponsaveis);
router.put('/', autenticar, controller.criarResponsaveis);
router.post('/', autenticar, controller.editarResponsaveis);

module.exports = router;

