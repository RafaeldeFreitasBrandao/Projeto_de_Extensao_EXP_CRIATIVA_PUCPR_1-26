const express = require('express');
const router = express.Router();

const autenticar = require('../middleware/auth_middleware.js');
const controller = require('../controllers/forms_controller.js');
<<<<<<< HEAD
const controller_behavior = require('../controllers/controller_behavior.js');
=======
>>>>>>> 9e6aaaea807d92b1e5c54881a0042a2716ba74af

router.get('/', autenticar, controller.listarFormularios);
router.post('/', autenticar, controller.criarFormulario);
router.get('/:id', autenticar, controller.detalharFormulario);
router.put('/:id', autenticar, controller.editarFormulario);
<<<<<<< HEAD
=======
router.delete('/:id', autenticar, controller.deletarFormulario);
>>>>>>> 9e6aaaea807d92b1e5c54881a0042a2716ba74af

module.exports = router;