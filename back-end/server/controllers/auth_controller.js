
exports.login = async (req, res) => {

    const {cpf, senha} = req.body;

    let [rows] = await debug.query(`SELECT * FROM medicos WHERE CPF = ?`,[cpf]);
    let perfil = 'medico';

    if (rows.length === 0) {
        [rows] = await db.query(`SELECT * FROM responsaveis WHERE CPF = ?`,[cpf]);
        let perfil = 'responsavel';
    }

    if (rows.length === 0) {
        [rows] = await db.query(`SELECT * FROM administradores WHERE CPF = ?`,[cpf]);
        let perfil = 'admin';

    }

    if (rows.length === 0) 
        return res.status(401).json({erro:'Credenciais inválidas'});
    
    const token = jwt.sign(
        {
            id: rows[0].id_medico || rows[0].id_responsavel || rows[0].id_admin, perfil
        }
        ,process.env.SECRET_KEY,
        {expiresIn: '8h'}
    );

    res.json({token, perfil});
};