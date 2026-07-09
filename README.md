## Como rodar

**Pré-requisitos:** Node.js 18+, MySQL 8+

```bash
# 1. Clone e instale
git clone https://github.com/RafaeldeFreitasBrandao/sistema-clinica-fullstack.git
cd sistema-clinica-fullstack
npm install

# 2. Crie o banco
mysql -u root -p < bd_sistema_clinica.sql

# 3. Configure o .env (use .env.example como base)
cp .env.example .env

# 4. Suba o servidor
npm start
```

Acesse `http://localhost:3000`.

## Vídeos para Auxílio 

**Video Explicativo** - [Youtube](https://youtu.be/B2CWkbJfZIY)

**Video de Instalação** - [Youtube](https://youtu.be/NV8Gh0sKTVU)
