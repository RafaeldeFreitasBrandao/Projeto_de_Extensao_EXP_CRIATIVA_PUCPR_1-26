require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');


const db = require('./db/connection.js');

const PORT = process.env.PORT || 3000;

const authRoutes = require('./routes/auth_routes.js');
const formsRoutes = require('./routes/forms_routes.js');
const doctorsRoutes = require('./routes/doctor_routes.js');
const guardiansRoutes = require('./routes/guardian_routes.js');
const pacientsRoutes = require('./routes/paients_routes.js')
const feedbackRouters = require('./routes/feedback_routes.js');
const behaviorRouters = require('./routes/behavior_routes.js');
const researchRouters = require('./routes/research_routes.js');
const resultRouters = require('./routes/result_routes.js');


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/formularios', formsRoutes);
app.use('/api/medicos', doctorsRoutessRoutes);
app.use('/api/responsaveis', guardiansRoutes);
app.use('/api/pacientes', pacientsRoutes)
app.use('/api/comportamentos', behaviorRouters);
app.use('/api/resposta', feedbackRouters);
app.use('./api/pesquisa',researchRouters);
app.use('./api/resultado', resultRouters);



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


