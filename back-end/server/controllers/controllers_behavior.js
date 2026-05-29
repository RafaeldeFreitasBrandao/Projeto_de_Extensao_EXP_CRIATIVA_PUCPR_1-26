const db = require('../db/connection.js');

exports.listarComportamentos = async (req, res) => {

    try {
        const [rows] = await db.query(`
           SELECT id_comportamento, nome, valor_masculino, valor_feminino
           FROM comportamentos 
           ORDER BY id_comportamento ASC
            `);

            res.json(rows);

    } catch (err) {
        console.error(err)
        res.status(500).json({erro:'Erro interno no servidor'})
    }
};