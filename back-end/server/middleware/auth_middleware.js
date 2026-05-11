const jwt = require('jsonwebtoken');

// Esse middleware tem como objetivo ler o token, validar e injetar os dados do usuário em req.usuario para 
//os controllers usarem

module.exports = (req, res, next) => {

    //Lê o header "Authorization: Bearer <token>"
    const header = req.headers['authorization'];
    // Armazena apenas o token
    const token = header && header.split(' ')[1];

    // Verifica se o token chegou
    if (!token) 
        return res.status(401).json({erro:'Acesso negado. Faça o login novamente'})

    try { //Verificação se o token é valido ou ainda não foi expirado

        const payload = jwt.verify(token, process.env.SECRET_KEY);//verifica se o payload (id, perfil) foram gravados no momento do login

        req.usuario = payload;//Se sim, injeta o payload no req.usuario para os controllers acessarem

        next();//chama o próximo middleware ou controller

    } catch (err) {
        return res.status(403).json({erro:'Token inválido ou expirado'})
    }
}
