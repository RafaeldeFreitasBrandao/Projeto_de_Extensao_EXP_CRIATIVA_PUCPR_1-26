const mysql = require('mysql2/promise');
//importa os módulos do promise mysql2, que permite a utilização do async/wait

require('dotenv').config();
//permite carregar os dados do arquivo .env, e injetar elas por meio do "process.env"

const pool = mysql.createPool( { // cria um conjunto de conexões com o banco 
    host:       process.env.DB_HOST, // credenciais {
    user:       process.env.DB_USER,
    password:   process.env.DB_PASS,
    database:   process.env.DB_NAME, // credenciais }

    waitForConnections: true, // define a qte de conexões simultâneas, e se existir mais de 10 requisições coloca elas em fila espera
    connectionLimit: 10

});

module.exports = pool; //permite que o pool seja exportado para outros arquivos 

//