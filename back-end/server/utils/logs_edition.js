const db = require('../db/connection.js');

async function registrarLog ({id_usuario, nome_usuario, tipo_usuario, entidade, id_entidade, nome_entidade, campos_editados}) {
    
    try {
        await db.query(`
            INSERT INTO logs
            (id_usuario, nome_usuario, tipo_usuario, entidade, id_entidade, nome_entidade, campos_editados)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                id_usuario,
                nome_usuario,
                tipo_usuario,
                entidade,
                id_entidade,
                nome_entidade,
                JSON.stringify(campos_editados)
            ]
        );

    } catch(err) {
        console.error('Erro ao registrar o log:', err);
    }
}

module.exports = {registrarLog};