const db = require('../db/connection.js');
const { registrarLog } = require('../utils/logs_edition.js');

//Função que busca os dados do usuáriodo banco de dados
exports.buscarMinhaConta = async (req, res) => {

    const id = req.usuario.id;

    try {
        //Executa uma QUERY no banco de dados, e puxa as informações de acordo com o id do token
        const[rows] = await db.query (
            `SELECT * FROM usuarios_saude WHERE id_usuario_saude = ?`, [id]
        );
        //Se não houver um usuário com o id referenciado, da erro
        if (rows.length === 0)
          return res.status(404).json({erro: 'usuário não encontrado'});

        //Se existir um usuário, manda as informações em formato json para o frontend
        res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({erro: 'Erro interno no servidor'});
    }
}

exports.verificaSenha = async (req, res) => {

    const id = req.usuario.id;

    //Armazena a senha digitada pelo usuário no frontend
    const {senha} = req.body;

    //Verifica se a senha não é vazia 
    if(!senha)
        return res.status(400).json({erro:"Informe a senha atual"});

    try {
        const [rows] = await db.query (
            `SELECT senha_hash FROM usuarios_saude WHERE id_usuario_saude = ?`, [id]
        );

        if (rows.length === 0)
            return res.status(404).json({erro:'Usuário não encontrado'});

        const senhaCorreta = senha === rows[0].senha_hash;

        if (!senhaCorreta)
            return res.status(401).json({erro:"Senha incorreta!"});


        res.json({ok: true, senha: rows[0].senha_hash});

    } catch (err) {
        return res.status(500).json({erro: "Erro interno no sevidor"});
    }

}

exports.atualizarMinhaConta = async (req, res) => {

    const id = req.usuario.id;

    const {nome, unidade, email, telefone, senha} = req.body;

    if (!nome && !unidade && !email && !telefone && !senha)
        return res.status(400).json({erro: 'Nenhum dado para atualizar.'});

    try {

        // Busca os dados atuais (para comparar e gerar o log)
        const [oldRows] = await db.query('SELECT * FROM usuarios_saude WHERE id_usuario_saude = ?', [id]);

        if (oldRows.length === 0)
            return res.status(404).json({erro: 'Usuário não encontrado'});

        const old = oldRows[0];

        const campos = [];
        const valores = [];

        if (nome) {campos.push('nome = ?'); valores.push(nome);}
        if (unidade) {campos.push('unidade = ?'); valores.push(unidade);}
        if (email) {campos.push('email = ?'); valores.push(email);}
        if (telefone) {campos.push('telefone = ?'); valores.push(telefone);}
        if (senha) {campos.push('senha_hash = ?'); valores.push(senha);}

        valores.push(id);

        await db.query (
            `UPDATE usuarios_saude SET ${campos.join(', ')}  WHERE id_usuario_saude = ?`, valores
        );

        // ===== LOG DE EDIÇÃO =====
        const camposMap = {
            nome: 'Nome',
            unidade: 'Unidade',
            email: 'Email',
            telefone: 'Telefone',
            senha: 'Senha'
        };

        const novosValores = { nome, unidade, email, telefone, senha };

        const camposEditados = Object.keys(camposMap).filter(k => {
            if (novosValores[k] === undefined) return false;
            if (k === 'senha') return true; // troca de senha sempre conta como alteração
            return String(novosValores[k]) !== String(old[k]);
        }).map(k => camposMap[k]);

        if (camposEditados.length > 0) {
            await registrarLog({
                id_usuario: id,
                nome_usuario: nome || old.nome,
                tipo_usuario: 'saude',
                entidade: 'usuario',
                id_entidade: id,
                nome_entidade: nome || old.nome,
                campos_editados: camposEditados
            });
        }

        res.json({ok: true, mensagem: 'Dados atualizados com sucesso.'});

    } catch (err) {
        console.error(err);
        return res.status(500).json({erro: 'Erro interno no servidor'})
    }

};
exports.criarUsuario = async (req, res) => {

    if (req.usuario.perfil !== 'admin')
        return res.status(403).json({ erro: 'Acesso negado.' });

    const { nome, cpf, email, telefone, senha, profissao, unidade } = req.body;

    if (!nome || !cpf || !email || !telefone || !senha || !profissao || !unidade)
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });

    try {
        const [existing] = await db.query(
            `SELECT id_usuario_saude FROM usuarios_saude WHERE CPF = ?`, [cpf]
        );

        if (existing.length > 0)
            return res.status(409).json({ erro: 'Já existe um usuário com esse CPF.' });

        const [result] = await db.query(
            `INSERT INTO usuarios_saude (nome, CPF, email, telefone, senha_hash, profissao, unidade)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nome, cpf, email, telefone, senha, profissao, unidade]
        );

        res.status(201).json({ id_usuario_saude: result.insertId, nome, cpf, email, profissao, unidade });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};
exports.listarUsuarios = async (req, res) => {

    if (req.usuario.perfil !== 'admin')
        return res.status(403).json({ erro: 'Acesso negado.' });

    try {
        const [rows] = await db.query(
            `SELECT id_usuario_saude, nome, CPF, email, telefone, profissao, unidade 
             FROM usuarios_saude`
        );
        res.json(rows);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

exports.detalharUsuario = async (req, res) => {

    if (req.usuario.perfil !== 'admin')
        return res.status(403).json({ erro: 'Acesso negado.' });

    const { id } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT id_usuario_saude, nome, CPF, email, telefone, profissao, unidade 
             FROM usuarios_saude 
             WHERE id_usuario_saude = ?`,
            [id]
        );

        if (rows.length === 0)
            return res.status(404).json({ erro: 'Usuário não encontrado' });

        res.json(rows[0]);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

exports.editarUsuario = async (req, res) => {

    if (req.usuario.perfil !== 'admin')
        return res.status(403).json({ erro: 'Acesso negado.' });

    const { id } = req.params;
    const { nome, email, telefone, profissao, unidade } = req.body;

    if (!nome && !email && !telefone && !profissao && !unidade)
        return res.status(400).json({ erro: 'Nenhum dado para atualizar' });

    try {
        const [oldRows] = await db.query('SELECT * FROM usuarios_saude WHERE id_usuario_saude = ?', [id]);

        if (oldRows.length === 0)
            return res.status(404).json({ erro: 'Usuário não encontrado' });

        const old = oldRows[0];

        const campos = [];
        const valores = [];

        if (nome)      { campos.push('nome = ?');      valores.push(nome); }
        if (email)     { campos.push('email = ?');     valores.push(email); }
        if (telefone)  { campos.push('telefone = ?');  valores.push(telefone); }
        if (profissao) { campos.push('profissao = ?'); valores.push(profissao); }
        if (unidade)   { campos.push('unidade = ?');   valores.push(unidade); }

        valores.push(id);

        await db.query(
            `UPDATE usuarios_saude SET ${campos.join(', ')} WHERE id_usuario_saude = ?`, valores
        );

        // ===== LOG DE EDIÇÃO =====
        const camposMap = {
            nome: 'Nome',
            email: 'Email',
            telefone: 'Telefone',
            profissao: 'Profissão',
            unidade: 'Unidade'
        };

        const novosValores = { nome, email, telefone, profissao, unidade };

        const camposEditados = Object.keys(camposMap).filter(k =>
            novosValores[k] !== undefined && String(novosValores[k]) !== String(old[k])
        ).map(k => camposMap[k]);

        if (camposEditados.length > 0) {
            const id_usuario = req.usuario.id;

            const [adm] = await db.query(
                'SELECT nome_usuario FROM administradores WHERE id_administrador = ?', [id_usuario]
            );
            const nome_usuario = adm[0]?.nome_usuario || 'Desconhecido';

            await registrarLog({
                id_usuario,
                nome_usuario,
                tipo_usuario: 'admin',
                entidade: 'usuario',
                id_entidade: id,
                nome_entidade: nome || old.nome,
                campos_editados: camposEditados
            });
        }

        res.json({ ok: true, mensagem: 'Usuário atualizado com sucesso' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

exports.deletarUsuario = async (req, res) => {

    if (req.usuario.perfil !== 'admin')
        return res.status(403).json({ erro: 'Acesso negado.' });

    const { id } = req.params;

    try {
        const [rows] = await db.query('SELECT id_usuario_saude FROM usuarios_saude WHERE id_usuario_saude = ?', [id]);

        if (rows.length === 0)
            return res.status(404).json({ erro: 'Usuário não encontrado' });

        await db.query('DELETE FROM usuarios_saude WHERE id_usuario_saude = ?', [id]);

        res.json({ ok: true, mensagem: 'Usuário excluído com sucesso' });

    } catch (err) {
        console.error(err);

        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED')
            return res.status(409).json({ erro: 'Não é possível excluir: este usuário possui pacientes cadastrados.' });

        return res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};