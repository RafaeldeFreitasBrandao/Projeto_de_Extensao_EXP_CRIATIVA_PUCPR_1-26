const db = require('../db/connection.js')//conexão com o BD
const jwt = require('jsonwebtoken');//importa a biblioteca de validação de tokens

exports.login = async (req, res) => {// define e exporta a função "login", o 'req' contém tudo que veio na requisição, e o 'res' é usando para enviar respostas ao front
    const{ nome_usuario, senha } = req.body; //recebe e armazena os dados da requisição

    if (!nome_usuario || !senha)//verificação se todos os campos estão completos 
        return res.status(400).json({ erro: "Preencha todos os campos"});

    try {//inicio da validação 

        //Tenta encontrar na tabela de administradores 
        const [admin] = await db.query
        ('SELECT * FROM administradores WHERE nome_usuario = ?',
        [nome_usuario]); //executa uma QUERY, e armazena os dados da tabela no array [admin]

        if (admin.length > 0) { // verifica se existe pelo menos 1 administrador na tabela
            const admins = admin[0]; // armazena a primeira e única linha da tabela 
            const senhaCorreta = senha === admins.senha_hash; //armazena a senha do usuário e compara com a do banco

            if (!senhaCorreta)//se a senha for diferente -->
                return res.status(401).json({erro: "Usuário ou senha inválidos."});

            //cria o token JWT
            const token = jwt.sign(
                { id: admins.id_administrador, perfil: 'admin' }, //armazena o payload, ou seja, o id e o perfil
                process.env.SECRET_KEY,// armzasena também a chave secreta, usada para assinar o token 
                {expiresIn: '8h'});// a sessão dura 8 horas, depois disso o admin tem que logar de novo
            return res.json({token, perfil: 'admin'});// retorna para o frontend, possibilitando usar esses tokens em requisições futuras
        }

        // Tenta encontrar na tabela dos usuários de saúde
        const[usuarios] = await db.query 
        ('SELECT * FROM usuarios_saude WHERE CPF = ?', [ //executa uma QUERY, e armazena todas as linhas em um array 
        nome_usuario]);

        if(usuarios.length === 0) // verifica se existe linhas na tabela
            return res.status(401).json({erro:"Usuário ou senha inválidos"});// se não existir retorna essa mensagem

        const usuario = usuarios[0];// armazena 
        const senhaCorreta = senha === usuario.senha_hash;

        if(!senhaCorreta)
        return res.status(401).json({erro: "Usuário ou senha inválidos."});

        const token = jwt.sign(
        { id: usuario.id_usuario_saude, perfil: 'usuario'},
        process.env.SECRET_KEY,
        {expiresIn: '8h'}
        );
        return res.json({token, perfil: 'usuario'});


    } catch (err) {
        console.error(err);
        res.status(500).json({erro: "Erro interno no servidor"});
        
    }

};


