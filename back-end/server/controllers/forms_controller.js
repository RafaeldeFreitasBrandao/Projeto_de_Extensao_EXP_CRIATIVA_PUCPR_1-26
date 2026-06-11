const db = require('../db/connection.js');
const { registrarLog } = require('../utils/logs_edition.js');

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
            ORDER BY f.data_preenchimento DESC`,
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

    if (!cpf_paciente || !cpf_responsavel || !Array.isArray(comportamentos))
        return res.status(400).json({erro:'Dados incompletos'});
 
    try {

         //Busca o paciente pelo CPF
        const [pacRows] = await db.query(
            `SELECT id_paciente, sexo, id_usuario_saude FROM pacientes WHERE CPF =?`,
            [cpf_paciente]
        );

        if (pacRows.length === 0)
            return res.status(404).json({erro: 'Paciente não encontrado'});

        if (req.usuario.perfil !== 'admin' && pacRows[0].id_usuario_saude !== id_usuario)
            return res.status(403).json({erro:'O paciente não pertence a você'});
        const { id_paciente, sexo } = pacRows[0];
        //Busca o responsável pelo CPF
        const [resRows] = await db.query(
            `SELECT id_responsavel FROM responsaveis WHERE CPF = ?`, 
            [cpf_responsavel]
        );

        if (resRows.length === 0)
            return res.status(404).json({erro: 'Responsável não encontrado'});
        
        const {id_responsavel} = resRows[0];

        //Cria o formulario
        // Define o vínculo do formulário de acordo com quem está preenchendo
        const idUsuarioSaude  = req.usuario.perfil === 'admin' ? null : id_usuario;
        const idAdministrador = req.usuario.perfil === 'admin' ? id_usuario : null;

        //Cria o formulario
        const [formResult] = await db.query(
            `INSERT INTO formularios (id_paciente, id_usuario_saude, id_administrador, id_responsavel) VALUES (?, ?, ?, ?)`,
            [id_paciente, idUsuarioSaude, idAdministrador, id_responsavel]
        );

        const id_formulario = formResult.insertId;

        if (comportamentos.length > 0) {
            const valores = comportamentos.map(id => [id_formulario, id]);

            await db.query(
                `INSERT INTO formulario_comportamento (id_formulario, id_comportamento) VALUES ?`,
                [valores]
            );
        }

        //Cálculo da pontuação de acordo com sexo do paciente 

        const coluna = sexo === 'masculino'? 'valor_masculino' : 'valor_feminino';

        let soma_total = 0;

        if (comportamentos.length > 0) {

            const placeholders = comportamentos.map(() => '?').join(',');
            const [campRows] = await db.query(
                `SELECT ${coluna} AS valor FROM comportamentos
                WHERE id_comportamento in (${placeholders})`, comportamentos
            );

            soma_total = campRows.reduce((acc, r) => acc + parseFloat(r.valor), 0);
        }

        //Salva o resultado
        await db.query(
            `INSERT INTO resultado (id_formulario, soma_total) VALUES (?, ?)`,
            [id_formulario, soma_total]
        );

        const status  = soma_total >= 0.50 ? 'Indicado para exame' : 'Não indicado para exame';
        await db.query(
            `UPDATE formularios SET status = ? WHERE id_formulario = ?`, 
            [status, id_formulario]
        );

        res.status(201).json({ok: true, id_formulario, soma_total, status});

    } catch (err) {
        console.error(err);
        res.status(500).json({erro: 'Erro interno no servidor'});
    }
};

exports.detalharFormulario = async (req, res) => {
    
    const { id } = req.params;
    const id_usuario = req.usuario.id;

    try {
        const [formRows] = await db.query(
            `SELECT f.id_formulario, f.data_preenchimento, f.status,
            p.nome AS nome_paciente, p.CPF AS cpf_paciente, p.sexo, p.foto AS foto_paciente,
            r.nome AS nome_responsavel, r.CPF AS cpf_responsavel, r.grau
            FROM formularios f 
            JOIN pacientes p ON f.id_paciente = p.id_paciente
            JOIN responsaveis r ON f.id_responsavel = r.id_responsavel
            WHERE f.id_formulario = ? AND f.id_usuario_saude = ?`,
            [id, id_usuario]
        );

        if(formRows.length === 0) 
            return res.status(404).json({erro:'Formulário não encontrado'});

        const [compRows] = await db.query(`
          SELECT c.id_comportamento, c.nome
          FROM formulario_comportamento fc
          JOIN comportamentos c ON fc.id_comportamento = c.id_comportamento
          WHERE fc.id_formulario = ?`,
        [id]
        );

        const [resRows] = await db.query(
        `SELECT soma_total FROM resultado WHERE id_formulario = ?`,
        [id]
        );

        res.json({

            ...formRows[0],
            comportamentos: compRows,
            soma_total: resRows[0]?.soma_total ?? 0

        });

    } catch (err) {
        console.error(err)
        res.status(500).json({erro:'Erro no servidor'});
    }
};

exports.editarFormulario = async (req, res) => {

    const {id} = req.params;
    const id_usuario = req.usuario.id;
    const {comportamentos} = req.body;

    if (!Array.isArray(comportamentos))
        return res.status(400).json({erro:'Dados inválidos'});

    try {

        const [check] = await db.query(
            `SELECT p.sexo, p.nome AS nome_paciente FROM formularios f 
            JOIN pacientes p ON f.id_paciente = p.id_paciente
            WHERE f.id_formulario = ? AND f.id_usuario_saude = ?`,
            [id, id_usuario]
        );

        if (check.length === 0)
            return res.status(404).json({erro:'Formulário não encontrado'});

        const {sexo, nome_paciente} = check[0];

        // Sintomas marcados ANTES da edição (para comparar depois)
        const [oldCompRows] = await db.query(`
            SELECT c.id_comportamento, c.nome
            FROM formulario_comportamento fc
            JOIN comportamentos c ON fc.id_comportamento = c.id_comportamento
            WHERE fc.id_formulario = ?`,
            [id]
        );

        await db.query(`
            DELETE FROM formulario_comportamento WHERE id_formulario = ?`,
            [id]
        );

        if (comportamentos.length > 0) {
            const valores = comportamentos.map(cid => [id, cid]);
            await db.query(`INSERT INTO formulario_comportamento (id_formulario, id_comportamento) VALUES ?`, [valores]);
            }

        const coluna = sexo === 'masculino' ? 'valor_masculino' : 'valor_feminino';
        let soma_total = 0;

        if (comportamentos.length > 0) {
            const placeholders = comportamentos.map(() => '?').join(',');
            const [compRows] = await db.query(`
                SELECT ${coluna} AS valor 
                FROM comportamentos
                WHERE id_comportamento IN (${placeholders})`,
            comportamentos
        );

        soma_total = compRows.reduce((acc, r) => acc + parseFloat(r.valor), 0); 
        }

        await db.query(
            `UPDATE resultado  SET soma_total = ?, data_calculo = CURRENT_TIMESTAMP
            WHERE id_formulario = ?`,
            [soma_total, id]
        );

        const status  = soma_total >= 0.50 ? 'Indicado para exame':'Não indicado para exame';

        await db.query(
            `UPDATE formularios SET status = ? WHERE id_formulario = ?`,
            [status, id]
        );

        // ===== LOG DE EDIÇÃO =====
        const oldIds = oldCompRows.map(c => String(c.id_comportamento));
        const newIds = comportamentos.map(cid => String(cid));

        // IDs que foram desmarcados ou marcados (mudaram de estado)
        const idsAlterados = [
            ...oldIds.filter(cid => !newIds.includes(cid)),
            ...newIds.filter(cid => !oldIds.includes(cid))
        ];

        let camposEditados = [];
        if (idsAlterados.length > 0) {
            const placeholders = idsAlterados.map(() => '?').join(',');
            const [nomesAlterados] = await db.query(
                `SELECT nome FROM comportamentos WHERE id_comportamento IN (${placeholders})`,
                idsAlterados
            );
            camposEditados = nomesAlterados.map(c => c.nome);
        }

        if (camposEditados.length > 0) {
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
                entidade: 'formulario',
                id_entidade: id,
                nome_entidade: nome_paciente,
                campos_editados: camposEditados
            });
        }

        res.json({ok:true, soma_total, status});

    } catch (err) {

        console.error(err)
        res.status(500).json({erro:'Erro interno no servidor'});
    }

};
exports.listarTodosFormularios = async (req, res) => {

    if (req.usuario.perfil !== 'admin')
        return res.status(403).json({ erro: 'Acesso negado.' });

    try {
        const [rows] = await db.query(
            `SELECT f.id_formulario,
            f.data_preenchimento,
            f.status,
            p.nome AS nome_paciente,
            p.CPF AS cpf_paciente,
            COALESCE(u.nome, a.nome_usuario) AS nome_usuario
            FROM formularios f
            JOIN pacientes p ON f.id_paciente = p.id_paciente
            LEFT JOIN usuarios_saude u ON f.id_usuario_saude = u.id_usuario_saude
            LEFT JOIN administradores a ON f.id_administrador = a.id_administrador
            ORDER BY f.data_preenchimento DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};
exports.detalharFormularioAdmin = async (req, res) => {

    if (req.usuario.perfil !== 'admin')
        return res.status(403).json({ erro: 'Acesso negado.' });

    const { id } = req.params;

    try {
        const [formRows] = await db.query(
            `SELECT f.id_formulario, f.data_preenchimento, f.status,
            p.nome AS nome_paciente, p.CPF AS cpf_paciente, p.sexo, p.foto AS foto_paciente,
            r.nome AS nome_responsavel, r.CPF AS cpf_responsavel, r.grau,
            COALESCE(u.nome, a.nome_usuario) AS nome_usuario
            FROM formularios f 
            JOIN pacientes p ON f.id_paciente = p.id_paciente
            JOIN responsaveis r ON f.id_responsavel = r.id_responsavel
            LEFT JOIN usuarios_saude u ON f.id_usuario_saude = u.id_usuario_saude
            LEFT JOIN administradores a ON f.id_administrador = a.id_administrador
            WHERE f.id_formulario = ?`,
            [id]
        );

        if (formRows.length === 0)
            return res.status(404).json({ erro: 'Formulário não encontrado' });

        const [compRows] = await db.query(
            `SELECT c.id_comportamento, c.nome
            FROM formulario_comportamento fc
            JOIN comportamentos c ON fc.id_comportamento = c.id_comportamento
            WHERE fc.id_formulario = ?`,
            [id]
        );

        const [resRows] = await db.query(
            `SELECT soma_total FROM resultado WHERE id_formulario = ?`,
            [id]
        );

        res.json({
            ...formRows[0],
            comportamentos: compRows,
            soma_total: resRows[0]?.soma_total ?? 0
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro no servidor' });
    }
};

exports.excluirFormulario = async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.usuario.id;

    try {
        const [rows] = await db.query(
            `SELECT id_usuario_saude FROM formularios WHERE id_formulario = ?`,
            [id]
        );

        if (rows.length === 0)
            return res.status(404).json({ erro: 'Formulário não encontrado' });

        const owner = rows[0].id_usuario_saude;

        if (owner !== id_usuario && req.usuario.perfil !== 'admin')
            return res.status(403).json({ erro: 'Acesso negado.' });

        await db.query(`DELETE FROM formulario_comportamento WHERE id_formulario = ?`, [id]);
        await db.query(`DELETE FROM resultado WHERE id_formulario = ?`, [id]);
        await db.query(`DELETE FROM formularios WHERE id_formulario = ?`, [id]);

        res.json({ ok: true, mensagem: 'Formulário excluído com sucesso' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};