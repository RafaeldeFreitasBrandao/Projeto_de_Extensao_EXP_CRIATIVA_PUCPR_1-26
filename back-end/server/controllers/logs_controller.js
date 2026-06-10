const db = require('../db/connection.js');

exports.listarLogs = async (req, res) => {
    try {
        const limite = parseInt(req.query.limite) || null;

        let query = `
        SELECT id_log, nome_usuario, tipo_usuario, entidade,
            id_entidade, nome_entidade, campos_editados, data_hora
            FROM logs
            WHERE data_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY data_hora DESC
            `;

        const params = [];
        if (limite) {
            query += 'LIMIT ?';
            params.push(limite);
        }

        const [rows] = await db.query(query, params);

        const logs = rows.map(row => ({
        ...row,
        campos_editados: JSON.parse(row.campos_editados || '[]')
        }));

        res.json(logs);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({erro: 'Erro ao buscar logs'});
    }
};