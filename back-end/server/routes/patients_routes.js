const express = require('express');
const router  = express.Router();
const controller = require('../controllers/pacients_controller.js');
const autenticar = require('../middleware/auth_middleware.js');
const upload = require('../middleware/upload_middleware.js');

router.get('/', autenticar, controller.listarPacientes);
router.post('/', autenticar, upload.single('foto'), controller.criarPaciente);
router.put('/:id', autenticar, controller.editarPaciente);
router.get('/:id', autenticar, controller.detalharPaciente);
router.patch('/:id/foto', autenticar, upload.single('foto'), controller.atualizarFotoPaciente);
router.delete('/:id', autenticar, controller.excluirPaciente);

module.exports = router;