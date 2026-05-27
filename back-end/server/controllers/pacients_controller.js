const db = require('../db/connection.js');

//Função que vai exibir todos os pacientes da tabela 

exports.listarPacientes = async (req, res) => {

    try {
        //Puxa todos os Pacientes da tabela, ordenado por ordem alfabética
        const[rows] = await db.query(
            `SELECT id_paciente, nome, CPF AS cpf, id_usuario_saude FROM pacientes ORDER BY nome ASC`
        );

        res.json(rows);

    } catch (err) {

        console.error(err);
        return res.status(500).json({erro:'Erro interno no servidor'});

    }

};

//Permite ver os detalhes do paciente 

exports.detalharPaciente = async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.usuario.id;

    try {
        const [rows] = await db.query(
            `SELECT p.id_paciente, p.nome,
                    p.CPF             AS cpf,
                    p.RG              AS rg,
                    p.data_nascimento AS dataNascimento,
                    p.sexo,
                    p.id_usuario_saude,
                    r.nome AS nomeResponsavel
                    FROM pacientes p
                    LEFT JOIN formularios f   ON f.id_paciente = p.id_paciente
                    LEFT JOIN responsaveis r  ON r.id_responsavel = f.id_responsavel
                    WHERE p.id_paciente = ?
                    ORDER BY f.data_preenchimento DESC
                    LIMIT 1`,
                    [id]
        );

        if (rows.length === 0)
            return res.status(404).json({ erro: 'Paciente não encontrado' });

        // Bloqueia se o usuário logado não for o dono
        if (rows[0].id_usuario_saude !== id_usuario)
            return res.status(403).json({ erro: 'Você não tem permissão para ver este paciente' });

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

//Registra um novo paciente no banco de dados

exports.criarPaciente = async (req, res) => {

    const id_usuario = req.usuario.id;
    const {nome, cpf, rg, dataNascimento, sexo} = req.body;

    console.log('REQ.BODY RECEBIDO:', req.body);
    console.log('id_usuario:', req.usuario.id);


    if(!nome ||!cpf || !rg || !dataNascimento || !sexo) 
        return res.status(400).json({erro: 'Preencha todos os campos'});

    try {
        const [existente] = await db.query(
            `SELECT id_paciente FROM pacientes WHERE CPF = ?`, [cpf]
        );

        if (existente.length > 0) 
            return res.status(409).json({erro:'Já existe um paciente com esse CPF'});

    
        const [result] = await db.query (
            `INSERT INTO pacientes (nome, CPF, RG, data_nascimento, sexo, id_usuario_saude) VALUES (?, ?, ?, ?, ?, ?)`, [nome, cpf, rg, dataNascimento, sexo, id_usuario]
        );

        res.status(201).json({
            ok:true,
            id_paciente: result.insertId, 
            nome, cpf, rg, dataNascimento, sexo
        });


    } catch (err) {
        console.error(err)
        return res.status(500).json({erro: 'Erro no servidor.'});
    }

    //edita um paciente já existente
};
    exports.editarPaciente = async (req, res) => {

        const {id} = req.params;
        const id_usuario = req.usuario.id;
        const {nome, cpf, rg, dataNascimento, sexo} =req.body;

        if(!nome && !dataNascimento && !sexo) 
            return res.status(400).json({erro:'Nenhum dado para atualizar'});

        try {

            const [check] = await db.query(
                `SELECT id_usuario_saude FROM pacientes WHERE id_paciente = ?`, [id]
            );

            if (check.length === 0)
                return res.status(404).json({ erro: 'Paciente não encontrado' });
            if (check[0].id_usuario_saude !== id_usuario)
                return res.status(403).json({ erro: 'Você não tem permissão para editar este paciente' });

            const campos = [];
            const valores = [];

            if (nome)     { campos.push('nome = ?');     valores.push(nome); }
            if (dataNascimento) { campos.push('data_nascimento = ?'); valores.push(dataNascimento); }
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