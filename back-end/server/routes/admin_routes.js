const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/admin_controller');
const autenticar = require('../middleware/auth_middleware');

router.get('/minha-conta', autenticar, controller.buscarMinhaConta);

router.post('/verificar-senha', autenticar, controller.verificaSenha);

router.put('/minha-conta', autenticar, controller.atualizarMinhaConta);

module.exports = router;