const db = require('../db/connection.js');
const { registrarLog } = require('../utils/logs_edition.js');

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
                    p.foto,
                    p.id_usuario_saude,
                    (SELECT r.nome
                     FROM formularios f
                     JOIN responsaveis r ON r.id_responsavel = f.id_responsavel
                     WHERE f.id_paciente = p.id_paciente
                     ORDER BY f.data_preenchimento DESC
                     LIMIT 1) AS nomeResponsavel
                    FROM pacientes p
                    WHERE p.id_paciente = ?`,
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
    const foto = req.file ? req.file.filename : null;

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
            `INSERT INTO pacientes (nome, CPF, RG, data_nascimento, sexo, id_usuario_saude, foto) VALUES (?, ?, ?, ?, ?, ?, ?)`, [nome, cpf, rg, dataNascimento, sexo, id_usuario, foto]
        );

        res.status(201).json({
            ok:true,
            id_paciente: result.insertId, 
            nome, cpf, rg, dataNascimento, sexo, foto
        });


    } catch (err) {
        console.error(err)
        return res.status(500).json({erro: 'Erro no servidor.'});
    }

    //edita um paciente já existente
};
    exports.editarPaciente = async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.usuario.id;
    const { nome, cpf, rg, dataNascimento, sexo } = req.body;

    try {
        const [oldRows] = await db.query('SELECT * FROM pacientes WHERE id_paciente = ?', [id]);
        if (oldRows.length === 0)
            return res.status(404).json({ erro: 'Paciente não encontrado' });

        const old = oldRows[0];

        // Bloqueia se o usuário logado não for o dono
        if (old.id_usuario_saude !== id_usuario)
            return res.status(403).json({ erro: 'Você não tem permissão para editar este paciente' });

        // Mapa dos campos monitorados
        const camposMap = {
            nome: 'Nome',
            sexo: 'Sexo',
            data_nascimento: 'Data de Nascimento',
            CPF: 'CPF'
        };

        // Normaliza data antiga (Date -> 'YYYY-MM-DD') para comparar corretamente
        const dataNascAntiga = old.data_nascimento instanceof Date
            ? old.data_nascimento.toISOString().slice(0, 10)
            : old.data_nascimento;

        const novosValores = {
            nome,
            sexo,
            data_nascimento: dataNascimento,
            CPF: cpf
        };

        const valoresAntigos = {
            nome: old.nome,
            sexo: old.sexo,
            data_nascimento: dataNascAntiga,
            CPF: old.CPF
        };

        const camposEditados = Object.keys(camposMap).filter(k =>
            novosValores[k] !== undefined && String(novosValores[k]) !== String(valoresAntigos[k])
        ).map(k => camposMap[k]);

        await db.query(
            `UPDATE pacientes SET nome = ?, CPF = ?, RG = ?, data_nascimento = ?, sexo = ? WHERE id_paciente = ?`,
            [nome, cpf, rg, dataNascimento, sexo, id]
        );

        if (camposEditados.length > 0) {
            const tipo_usuario = req.usuario.perfil === 'admin' ? 'admin' : 'saude';

            let nome_usuario = 'Desconhecido';
            if (req.usuario.perfil === 'admin') {
                const [adm] = await db.query(
                    'SELECT nome_usuario FROM administradores WHERE id_administrador = ?', [id_usuario]
                );
                nome_usuario = adm[0]?.nome_usuario || nome_usuario;
            } else {
                const [usu] = await db.query(
                    'SELECT nome FROM usuarios_saude WHERE id_usuario_saude = ?', [id_usuario]
                );
                nome_usuario = usu[0]?.nome || nome_usuario;
            }

            await registrarLog({
                id_usuario,
                nome_usuario,
                tipo_usuario,
                entidade: 'paciente',
                id_entidade: id,
                nome_entidade: old.nome,
                campos_editados: camposEditados
            });
        }

        res.json({ mensagem: 'Paciente atualizado com sucesso' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

exports.atualizarFotoPaciente = async (req, res) => {

    const {id} = req.params;
    const id_usuario = req.usuario.id;

    if (!req.file)
        return res.status(400).json({erro:'Nenhuma imagem enviada'});

    try {
        const [check] = await db.query(
            `SELECT id_usuario_saude, foto FROM pacientes WHERE id_paciente = ?`, [id]
        );

        if (check.length === 0)
            return res.status(404).json({erro:'Paciente não encontrado'});

        if(check[0].id_usuario_saude !== id_usuario)
            return res.status(403).json({erro:'Sem permissão'});

        if (check[0].foto) {

            const fs = require('fs');
            const path = require('path');
            const old = path.join(__dirname, '..', 'uploads', check[0].foto);

            if (fs.existsSync(old)) fs.unlinkSync(old);

        }

        await db.query(`
            UPDATE pacientes SET foto = ? WHERE id_paciente = ?`, [req.file.filename, id]
        );

        res.json ({ok: true, foto: req.file.filename});

    } catch (err) {
        console.error(err);
        res.status(500).json({erro: 'Erro no servidor'});
    }
}