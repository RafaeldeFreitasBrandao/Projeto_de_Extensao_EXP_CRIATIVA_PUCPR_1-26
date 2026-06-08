const db = require('../db/connection.js');

exports.buscarMinhaConta = async (req, res) => {

    const id = req.usuario.id;

    if (req.usuario.perfil !== 'admin')
        return res.status(403).json({ erro: 'Acesso negado.' });

    try {
        const [rows] = await db.query(
            `SELECT id_administrador, nome_usuario FROM administradores WHERE id_administrador = ?`,
            [id]
        );

        if (rows.length === 0)
            return res.status(404).json({ erro: 'Administrador não encontrado.' });

        res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

exports.verificaSenha = async (req, res) => {

    const id = req.usuario.id;

    if (req.usuario.perfil !== 'admin')
        return res.status(403).json({ erro: 'Acesso negado.' });

    const { senha } = req.body;

    if (!senha)
        return res.status(400).json({ erro: 'Informe a senha atual.' });

    try {
        const [rows] = await db.query(
            `SELECT senha_hash FROM administradores WHERE id_administrador = ?`,
            [id]
        );

        if (rows.length === 0)
            return res.status(404).json({ erro: 'Administrador não encontrado.' });

        const senhaCorreta = senha === rows[0].senha_hash;

        if (!senhaCorreta)
            return res.status(401).json({ erro: 'Senha incorreta!' });

        res.json({ ok: true, senha: rows[0].senha_hash });

    } catch (err) {
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};


exports.atualizarMinhaConta = async (req, res) => {

    const id = req.usuario.id;

    if (req.usuario.perfil !== 'admin')
        return res.status(403).json({ erro: 'Acesso negado.' });

    const { nome_usuario, senha } = req.body;

    if (!nome_usuario && !senha)
        return res.status(400).json({ erro: 'Nenhum dado para atualizar.' });

    try {
        const campos = [];
        const valores = [];

        if (nome_usuario) { campos.push('nome_usuario = ?'); valores.push(nome_usuario); }
        if (senha)        { campos.push('senha_hash = ?');   valores.push(senha); }

        valores.push(id);

        await db.query(
            `UPDATE administradores SET ${campos.join(', ')} WHERE id_administrador = ?`,
            valores
        );

        res.json({ ok: true, mensagem: 'Dados atualizados com sucesso.' });

    } catch (err) {
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};