const db = require('../db/connection.js');

//Função que busca os dados do usuáriodo banco de dados
exports.buscarMinhaConta = async (req, res) => {

    const id = req.usuario.id;

    try {
        //Executa uma QUERY no banco de dados, e puxa as informações de acordo com o id do token
        const[rows] = await db.query (
            `SELECT * FROM usuarios_saude WHERE id_usuario_saude = ?`, [id]
        );
        //Se não houver um usuário com o id referenciado, da erro
        if (rows.length === 0)
          return res.status(404).json({erro: 'usuário não encontrado'});

        //Se existir um usuário, manda as informações em formato json para o frontend
        res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({erro: 'Erro interno no servidor'});
    }
}

exports.verificaSenha = async (req, res) => {

    const id = req.usuario.id;

    //Armazena a senha digitada pelo usuário no frontend
    const {senha} = req.body;

    //Verifica se a senha não é vazia 
    if(!senha)
        return res.status(400).json({erro:"Informe a senha atual"});

    try {
        const [rows] = await db.query (
            `SELECT senha_hash FROM usuarios_saude WHERE id_usuario_saude = ?`, [id]
        );

        if (rows.length === 0)
            return res.status(404).json({erro:'Usuário não encontrado'});

        const senhaCorreta = senha === rows[0].senha_hash;

        if (!senhaCorreta)
            return res.status(401).json({erro:"Senha incorreta!"});


        res.json({ok: true, senha: rows[0].senha_hash});

    } catch (err) {
        return res.status(500).json({erro: "Erro interno no sevidor"});
    }

}

exports.atualizarMinhaConta = async (req, res) => {

    const id = req.usuario.id;

    //Armazena os dado enviados pelo fontend, 
    //(não incluir o CPF e a profissão impedem de eles serem modificados, mesmo que enviados)
    const {nome, unidade, email, telefone, senha} = req.body;

    //Verifica se pelo menos um campo foi enviado
    if (!nome && !unidade && !email && !telefone && !senha)
        return res.status(400).json({erro: 'Nenhum dado para atualizar.'});

    //Monta QUERY dinamicamente, apenas com os campos enviados
    try {

        const campos = []; // vai virar "nome = ?", "unidade = ?" etc
        const valores = []; // vai virar os valores correspondentes

        if (nome) {campos.push('nome = ?'); valores.push(nome);}
        if (unidade) {campos.push('unidade = ?'); valores.push(unidade);}
        if (email) {campos.push('email = ?'); valores.push(email);}
        if (telefone) {campos.push('telefone = ?'); valores.push(telefone);}
        if (senha) {campos.push('senha_hash = ?'); valores.push(senha);}

        valores.push(id);

        //Executa o UPDATE na tabela com os campos modificados
        await db.query (
            `UPDATE usuarios_saude SET ${campos.join(', ')}  WHERE id_usuario_saude = ?`, valores
        );

        res.json({ok: true, mensagem: 'Dados atualizados com sucesso.'});


    } catch (err) {
        return res.status(500).json({erro: 'Erro interno no servidor'})
    }
};