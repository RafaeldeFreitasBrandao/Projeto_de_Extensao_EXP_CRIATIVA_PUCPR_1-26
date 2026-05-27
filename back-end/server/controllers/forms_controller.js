const db = require('../db/connection.js');


exports.listarFormularios = async (req, res) => {

    const id_usuario = req.usuario.id;

    try {
        const [rows] = await db.query(
            `SELECT f.id_formulario,
            f.data_preenchimento,
            f.status,
            p.nome AS nome_paciente,
            p.CPF AS cpf_paciente
            FROM formularios f
            JOIN pacientes p ON f.id_paciente = p.id_paciente
            WHERE f.id_usuario_saude = ?
            ORDER BY f.data_preechimento DESC`,
            [id_usuario]
        );
        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({erro:'Erro interno no servidor'})
    }

};

exports.criarFormulario = async (req, res) => {

    const id_usuario = req.usuario.id;
    const {cpf_paciente, cpf_responsavel,comportamentos} = req.body;

    if (!cpf_paciente || !cpf_responsavel || !Array.isArray.(comportamentos))
        return res.status(400).json({erro:'Dados incompletos'});

    //Busca o paciente pelo CPF 
    try {

        const [pacRows] = await db.query(
            `SELECT id_paciente, sexo, id_usuario_saude FROM pacientes WHERE CPF =?`,
            [cpf_paciente]
        );

        if (pacRows.length === 0)
            return res.status(404).json({erro: 'Paciente não encontrado'});
        if (pacRows[0].id_usuario_saude !== id_usuario)
            return res.status(403).json({erro:'O paciente não pertence a você'});

        //Busca o responsável pelo CPF

        const [resRows] = await db.query(
            `SELECT id_responsavel, FROM responsavel WHERE CPF = ?`
        )
    }

}