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
            const admins = admin[0];
            const senhaCorreta = senha === admins.senha_hash;

            if (!senhaCorreta) 
                return res.status(401).json({erro: "Usuário ou senha inválidos."});

            const token = jwt.sign(
                { id: admins.id_administrador, perfil: 'admin' },
                process.env.SECRET_KEY,
                {expiresIn: '8h'});
            return res.json({token, perfil: 'admin'});
        }

        // Tenta encontrar na tabela dos usuários de saúde
        const[usuarios] = await db.query
        ('SELECT * FROM usuarios_saude WHERE nome = ?', [
        nome_usuario]);

        if(usuarios.length === 0) 
            return res.status(401).json({erro:"Usuário ou senha inválidos"});

            const usuario = usuarios[0];
            const senhaCorreta = senha === usuario.senha_hash;

            if(!senhaCorreta)
                return res.status(401).json({erro: "Usuário ou senha inválidos."});

            const token = jwt.sign(
                { id: usuario.id_usuario_saude, perfil: 'usuario'},
                process.env.SECRET_KEY,
                {expiresIn: '8h'}
            );
            return res.json({token, perfil: 'usuario'});


    } catch (err) {
        console.error(err);
        res.status(500).json({erro: "Erro interno no servidor"});
        
    }

};


