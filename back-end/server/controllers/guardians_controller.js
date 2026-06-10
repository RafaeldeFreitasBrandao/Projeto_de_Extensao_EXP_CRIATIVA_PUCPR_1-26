const db = require('../db/connection.js');
const { registrarLog } = require('../utils/logs_edition.js');

//Função que vai exibir todos os responsáveis da tabela 

exports.listarResponsaveis = async (req, res) => {

    try {
        //Puxa todos os responsáveis da tabela, ordenado por ordem alfabética
        const[rows] = await db.query(
            `SELECT id_responsavel, nome, CPF, email, telefone, grau FROM responsaveis ORDER BY nome ASC`
        );

        res.json(rows);


    } catch (err) {

        console.error(err);
        return res.status(500).json({erro:'Erro interno no servidor'});

    }

};

//Registra um novo responsável no banco de dados

exports.criarResponsavel = async (req, res) => {

    const {nome, cpf, email, telefone, grau} = req.body;


    if(!nome ||!cpf || !email || !telefone || !grau) 
        return res.status(400).json({erro: 'Preencha todos os campos'});

    try {
        const [existente] = await db.query(
            `SELECT id_responsavel FROM responsaveis WHERE CPF = ?`, [cpf]
        );

        if (existente.length > 0) 
            return res.status(409).json({erro:'Já existe um responsável com esse CPF'});

    
        const [result] = await db.query (
            `INSERT INTO responsaveis (nome, CPF, email, telefone, grau) VALUES (?, ?, ?, ?, ?)`, [nome, cpf, email, telefone, grau]
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
    const {nome, email, telefone, grau} = req.body;

    if(!nome && !email && !telefone && !grau) 
        return res.status(400).json({erro:'Nenhum dado para atualizar'});

    try {
        // Busca os dados atuais (para comparar e gerar o log)
        const [oldRows] = await db.query('SELECT * FROM responsaveis WHERE id_responsavel = ?', [id]);

        if (oldRows.length === 0)
            return res.status(404).json({erro:'Responsável não encontrado'});

        const old = oldRows[0];

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

        // ===== LOG DE EDIÇÃO =====
        const camposMap = {
            nome: 'Nome',
            email: 'Email',
            telefone: 'Telefone',
            grau: 'Grau'
        };

        const novosValores = { nome, email, telefone, grau };

        const camposEditados = Object.keys(camposMap).filter(k =>
            novosValores[k] !== undefined && String(novosValores[k]) !== String(old[k])
        ).map(k => camposMap[k]);

        if (camposEditados.length > 0) {
            const id_usuario = req.usuario.id;
            const tipo_usuario = req.usuario.perfil === 'admin' ? 'admin' : 'saude';

            let nome_usuario = 'Desconhecido';
            if (req.usuario.perfil === 'admin') {
                const [adm] = await db.query('SELECT nome_usuario FROM administradores WHERE id_administrador = ?', [id_usuario]);
                nome_usuario = adm[0]?.nome_usuario || nome_usuario;
            } else {
                const [usu] = await db.query('SELECT nome FROM usuarios_saude WHERE id_usuario_saude = ?', [id_usuario]);
                nome_usuario = usu[0]?.nome || nome_usuario;
            }

            await registrarLog({
                id_usuario,
                nome_usuario,
                tipo_usuario,
                entidade: 'responsavel',
                id_entidade: id,
                nome_entidade: old.nome,
                campos_editados: camposEditados
            });
        }

        res.json({
            ok:true,
            mensagem: 'Responsável atualizado com sucesso'
        });

    } catch (err) {
        console.error(err)
        return res.status(500).json({erro: 'Erro interno no servidor'});
    }
};

exports.detalharResponsavel = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT id_responsavel, nome, CPF, email, telefone, grau 
             FROM responsaveis 
             WHERE id_responsavel = ?`,
            [id]
        );

        if (rows.length === 0)
            return res.status(404).json({ erro: 'Responsável não encontrado' });

        res.json(rows[0]);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};