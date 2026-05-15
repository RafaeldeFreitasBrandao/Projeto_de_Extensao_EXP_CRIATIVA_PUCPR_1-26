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

exports.