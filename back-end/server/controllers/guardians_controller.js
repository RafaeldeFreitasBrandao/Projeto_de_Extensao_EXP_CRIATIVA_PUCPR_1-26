const db = require('../db/connection.js');

//Função que vai exibir todos os responsáveis da tabela 

exports.listaResponsaveis = async (req, res) => {

    try {
        //Puxa todos os responsáveis da tabela, ordenado por ordem alfabética
        const[rows] = await db.query(
            `SELECT nome, CPF, email, telefone, grau FROM responsaveis ORDER BY nome ASC`
        );

        res.json(rows);


    } catch (err) {

        console.error(err);
        return res.status(500).json({erro:'Erro interno no servidor'});

    }

};

//Registra um novo responsável no banco de dados

exports.criaResponsavel = async (req, res) => {

    const {nome, CPF, email, telefone, grau} = req.body;


    if(!nome ||!CPF || !email || !telefone || !grau) 
        return res.status(400).json({erro: 'Preencha todos os campos'});

    try {
        const [existente] = await db.query(
            `SELECT id_responsavel FROM responsaveis WHERE CPF = ?`, [cpf]
        );

        if (existente.length > 0) 
            return res.status(409).json({erro:'Já existe um responsável com esse CPF'});

    
        const [result] = await db.query (
            `INSERT INTO responsaveis (nome, CPF, email, telefone, grau)`, [nome, CPF, email, telefone, grau]
        );

        res.status(201).json({
            ok:true,
            id_responsavel: result.insertId, 
            nome, cpf, email, telefone, grau
        });


    } catch (err) {
        console.error(err)
        return res.status(500).json({erro: 'Erro no servidor.'});
    }

    //edita um responsável já existente
};
    exports.editarResponsavel = async (req, res) => {

        const {id} = req.params;
        const {nome, email, telefone, grau} =req.body;

        if(!nome && !email && !telefone && !grau) 
            return res.status(400).json({erro:'Nenhum dado para atualizar'});

        try {
            const campos = [];
            const valores = [];

            if (nome)     { campos.push('nome = ?');     valores.push(nome); }
            if (email)    { campos.push('email = ?');    valores.push(email); }
            if (telefone) { campos.push('telefone = ?'); valores.push(telefone); }
            if (grau)     { campos.push('grau = ?');     valores.push(grau); }

            valores.push(id);

            await db.query (
                `UPDATE responsaveis SET ${campos.join(', ')} WHERE id_responsavel = ?`, valores
            );

            res.json({
                ok:true,
                mensagem: 'Responsável atualizado com sucesso'
            });


        } catch (err) {
            console.error(err)
            return res.status(500).json({erro: 'Erro interno no servidor'});
        }
};