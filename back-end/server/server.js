require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');


const db = require('./db/connection.js');

const PORT = process.env.PORT || 3000;

const authRoutes = require('./routes/auth_routes.js');
const formsRoutes = require('./routes/forms_routes.js');
const patientsRoutes = require('./routes/patients_routes.js');
const usersRoutes = require('./routes/users_routes.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/formularios', formsRoutes);

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));


async function iniciar() {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log('Banco de dados conectado com sucesso!');
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  } catch (err) {
    console.error('Erro ao conectar ao banco:', err.message);
    process.exit(1);
  }
}

iniciar();


