const db = require('../db/connection.js');

//Função que busca os dados do usuáriodo banco de dados
exports.buscarMinhaConta = async (req, res) => {

    const id = req.usuario.id;

    try {
        //Executa uma QUERY no banco de dados, e puxa as informações de acordo com o id do token
        const[rows] = await db.query (
            'SELECT * FROM usuarios_saude WHERE id_usuario_saude = ?'[id]
        );
        //Se não houver um usuário com o id referenciado, da erro
        if (rows.length === 0)
          return req.status(404).json({erro: 'usuário não encontrado'});

        //Se existir um usuário, manda as informações em formato json para o frontend
        res.json(row[0]);

    } catch (err) {
        return req.status(500).json({erro: 'Erro interno no servidor'});
    }
}

exports.verificaSenha = async (req, res) => {

    const id = req.usuario.id;

    //Armazena a senha digitada pelo usuário no frontend
    const {senha} = req.body;

    //Verifica se a senha não é vazia 
    if(!senha)
        return req.status(400).json({erro:"Informe a senha atual"});

    try {
        const [rows] = await db.query (
            'SELECT senha_hash FROM usuarios_saude WHERE id_usuario_saude = ?' [id]
        );

        if (rows === 0)
            return req.status(404).json({erro:'Usuário não encontrado'});

        const senhaCorreta = senha === rows[0].senha_hash;

        if (!senhaCorreta)
            return req.status(401).json({erro:"Senha incorreta!"});


        res.json({ok: true, senha: rows[0].senha_hash});

    } catch (err) {
        return req.status(500).json({erro: "Erro interno no sevidor"});
    }

}

exports.atualizarMinhaConta = async (req, res) => {

    const id = req.usuario.id;

    const {nome, unidade}
}