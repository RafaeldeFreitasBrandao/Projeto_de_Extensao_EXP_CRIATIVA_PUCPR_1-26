const db = require('../db/connection.js');

//Função que vai exibir todos os pacientes da tabela 

exports.listarPacientes = async (req, res) => {

    try {
        //Puxa todos os Pacientes da tabela, ordenado por ordem alfabética
        const[rows] = await db.query(
            `SELECT nome, CPF, RG, data_nascimento, sexo FROM pacientes ORDER BY nome ASC`
        );

        res.json(rows);


    } catch (err) {

        console.error(err);
        return res.status(500).json({erro:'Erro interno no servidor'});

    }

};

//Registra um novo paciente no banco de dados

exports.criarPaciente = async (req, res) => {

    const {nome, CPF, RG, data_nascimento, sexo} = req.body;


    if(!nome ||!CPF || !RG || !data_nascimento || !sexo) 
        return res.status(400).json({erro: 'Preencha todos os campos'});

    try {
        const [existente] = await db.query(
            `SELECT id_paciente FROM pacientes WHERE CPF = ?`, [CPF]
        );

        if (existente.length > 0) 
            return res.status(409).json({erro:'Já existe um paciente com esse CPF'});

    
        const [result] = await db.query (
            `INSERT INTO pacientes (nome, CPF, RG, data_nascimento, sexo) VALUES (?, ?, ?, ?, ?)`, [nome, CPF, RG, data_nascimento, sexo]
        );

        res.status(201).json({
            ok:true,
            id_paciente: result.insertId, 
            nome, CPF, RG, data_nascimento, sexo
        });


    } catch (err) {
        console.error(err)
        return res.status(500).json({erro: 'Erro no servidor.'});
    }

    //edita um paciente já existente
};
    exports.editarPaciente = async (req, res) => {

        const {id} = req.params;
        const {nome, CPF, RG, data_nascimento, sexo} =req.body;

        if(!nome && !data_nascimento && !sexo) 
            return res.status(400).json({erro:'Nenhum dado para atualizar'});

        try {
            const campos = [];
            const valores = [];

            if (nome)     { campos.push('nome = ?');     valores.push(nome); }
            if (data_nascimento) { campos.push('data_nascimento = ?'); valores.push(data_nascimento); }
            if (sexo)      { campos.push('sexo = ?');      valores.push(sexo); }

            valores.push(id);

            await db.query (
                `UPDATE pacientes SET ${campos.join(', ')} WHERE id_paciente = ?`, valores
            );

            res.json({
                ok:true,
                mensagem: 'Paciente atualizado com sucesso'
            });


        } catch (err) {
            console.error(err)
            return res.status(500).json({erro: 'Erro interno no servidor'});
        }
};