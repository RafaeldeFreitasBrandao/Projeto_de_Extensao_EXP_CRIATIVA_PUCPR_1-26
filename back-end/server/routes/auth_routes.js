const express = require('express');
const router  = express.Router(); //cria um mini-roteador, agrupando todas as rotas de autenticação
const controller = require('../controllers/auth_controller.js'); //importa o arquivo onde a lógica de autenticação acontece

router.post('/login', controller.login) // define que quando chegar uma requisição POST, o express deve escutar a função 
// login do controller, fazendo o caminho virar '/api/auth/login'

module.exports = router;