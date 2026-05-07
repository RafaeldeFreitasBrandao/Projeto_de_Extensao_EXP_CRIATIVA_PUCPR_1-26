const db = require('../db/connection.js')
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const{ nome_usuario, senha } = req.body; 

    if (!nome_usuario || !senha)
        return res.status(400).json({ erro: "Preencha todos os campos"});

    try {
        //Tenta encontrar na tabela de administradores 
        const [admin] = await db.query
        ('SELECT * FROM administradores WHERE nome_usuario = ?',
        [nome_usuario]);

        if (admin.length > 0) {
            const admin = admin[0];
            const senhaCorreta = admin.senha_hash

            if (!senhaCorreta) 
                return res.status(401).json({erro: "Usuário ou senha inválidos."})

            const token = jwt.sign(
                { id: admin.id_adminsitra}
            )
        }
    }
}

