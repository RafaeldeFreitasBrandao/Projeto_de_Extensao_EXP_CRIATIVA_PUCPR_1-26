const db = require('../db/connection.js')
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const{ nome_usuario, senha } = req.body; 
}

