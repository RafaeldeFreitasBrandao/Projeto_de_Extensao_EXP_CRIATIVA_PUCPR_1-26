const express = require('express');
const cors = require('cors');
require ('dotenv').config();

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




