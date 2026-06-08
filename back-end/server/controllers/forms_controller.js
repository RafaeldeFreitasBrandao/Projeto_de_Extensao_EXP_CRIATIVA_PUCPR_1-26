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
        if (pacRows[0].id_usuario_saude !== id_usuario)
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
        const [formResult] = await db.query(
            `INSERT INTO formularios (id_paciente, id_usuario_saude, id_responsavel) VALUES ( ?, ?, ?)`,
            [id_paciente, id_usuario, id_responsavel]
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
            `SELECT p.sexo FROM formularios f 
            JOIN pacientes p ON f.id_paciente = p.id_paciente
            WHERE f.id_formulario = ? AND f.id_usuario_saude = ?`,
            [id, id_usuario]
        );

        if (check.length === 0)
            return res.status(404).json({erro:'Formulário não encontrado'});

        const {sexo} = check[0];

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
            u.nome AS nome_usuario
            FROM formularios f
            JOIN pacientes p ON f.id_paciente = p.id_paciente
            JOIN usuarios_saude u ON f.id_usuario_saude = u.id_usuario_saude
            ORDER BY f.data_preenchimento DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};