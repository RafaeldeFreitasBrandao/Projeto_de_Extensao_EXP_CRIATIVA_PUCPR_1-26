CREATE DATABASE IF NOT EXISTS bd_sistema_clinica;
USE bd_sistema_clinica;

-- ─── USUÁRIOS ────────────────────────────────────────────────────────────────

CREATE TABLE administradores (
    id_admin    INT          NOT NULL AUTO_INCREMENT,
    nome        VARCHAR(100) NOT NULL,
    senha_hash  VARCHAR(255) NOT NULL,
    PRIMARY KEY (id_admin)
);

CREATE TABLE medicos (
    id_medico   INT          NOT NULL AUTO_INCREMENT,
    nome        VARCHAR(100) NOT NULL,
    CPF         CHAR(11)     NOT NULL UNIQUE,
    email       VARCHAR(150) NOT NULL,
    telefone    VARCHAR(20)  NOT NULL,
    senha_hash  VARCHAR(255) NOT NULL,
    profissao   VARCHAR(100) NOT NULL,
    unidade     VARCHAR(150) NOT NULL,
    PRIMARY KEY (id_medico)
);

CREATE TABLE responsaveis (
    id_responsavel INT          NOT NULL AUTO_INCREMENT,
    nome           VARCHAR(100) NOT NULL,
    CPF            CHAR(11)     NOT NULL UNIQUE,
    telefone       VARCHAR(20)  NOT NULL,
    email          VARCHAR(150) NOT NULL,
    senha_hash     VARCHAR(255) NOT NULL,
    PRIMARY KEY (id_responsavel)
);

-- ─── PACIENTES ───────────────────────────────────────────────────────────────

CREATE TABLE pacientes (
    id_paciente     INT          NOT NULL AUTO_INCREMENT,
    nome            VARCHAR(100) NOT NULL,
    CPF             CHAR(11)     UNIQUE,
    RG              VARCHAR(20)  UNIQUE,
    data_nascimento DATE         NOT NULL,
    sexo            ENUM('masculino', 'feminino') NOT NULL,
    grau            VARCHAR(100) NOT NULL, -- grau de parentesco do responsável
    id_responsavel  INT          NOT NULL,
    id_medico       INT,                   -- atribuído depois pelo médico/admin
    PRIMARY KEY (id_paciente),
    CONSTRAINT fk_pac_resp  FOREIGN KEY (id_responsavel) REFERENCES responsaveis (id_responsavel),
    CONSTRAINT fk_pac_med   FOREIGN KEY (id_medico)      REFERENCES medicos       (id_medico)
);

-- ─── COMPORTAMENTOS (separados por sexo) ─────────────────────────────────────

CREATE TABLE comportamentos (
    id_comportamento INT          NOT NULL AUTO_INCREMENT,
    nome             VARCHAR(100) NOT NULL,
    valor            DECIMAL(10,2) NOT NULL,
    sexo             ENUM('masculino', 'feminino') NOT NULL,
    PRIMARY KEY (id_comportamento)
);

-- ─── FORMULÁRIOS ─────────────────────────────────────────────────────────────

CREATE TABLE formularios (
    id_formulario      INT       NOT NULL AUTO_INCREMENT,
    id_paciente        INT       NOT NULL,
    id_responsavel     INT       NOT NULL,
    id_medico          INT,                -- pode ser atribuído depois
    data_preenchimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status             VARCHAR(50),
    PRIMARY KEY (id_formulario),
    CONSTRAINT fk_form_pac  FOREIGN KEY (id_paciente)    REFERENCES pacientes    (id_paciente)    ON DELETE RESTRICT,
    CONSTRAINT fk_form_resp FOREIGN KEY (id_responsavel) REFERENCES responsaveis (id_responsavel) ON DELETE RESTRICT,
    CONSTRAINT fk_form_med  FOREIGN KEY (id_medico)      REFERENCES medicos      (id_medico)      ON DELETE SET NULL
);

CREATE TABLE formulario_comportamento (
    id_formulario    INT NOT NULL,
    id_comportamento INT NOT NULL,
    PRIMARY KEY (id_formulario, id_comportamento),
    CONSTRAINT fk_fc_form FOREIGN KEY (id_formulario)    REFERENCES formularios   (id_formulario)    ON DELETE CASCADE,
    CONSTRAINT fk_fc_comp FOREIGN KEY (id_comportamento) REFERENCES comportamentos (id_comportamento) ON DELETE CASCADE
);

CREATE TABLE resultado (
    id_resultado  INT           NOT NULL AUTO_INCREMENT,
    id_formulario INT           NOT NULL UNIQUE,
    soma_total    DECIMAL(10,2) NOT NULL,
    data_calculo  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_resultado),
    CONSTRAINT fk_res_form FOREIGN KEY (id_formulario) REFERENCES formularios (id_formulario) ON DELETE CASCADE
);

-- ─── PESQUISA SOCIOECONÔMICA ──────────────────────────────────────────────────

CREATE TABLE pesquisa_socioeconomica (
    id_pesquisa    INT  NOT NULL AUTO_INCREMENT,
    id_responsavel INT  NOT NULL,
    id_formulario  INT  NOT NULL UNIQUE,
    -- campos a definir com o orientador (renda, escolaridade, etc.)
    data_resposta  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_pesquisa),
    CONSTRAINT fk_pesq_resp FOREIGN KEY (id_responsavel) REFERENCES responsaveis (id_responsavel),
    CONSTRAINT fk_pesq_form FOREIGN KEY (id_formulario)  REFERENCES formularios  (id_formulario)
);

-- ─── RESPOSTA DA CLÍNICA ──────────────────────────────────────────────────────

CREATE TABLE respostas_clinica (
    id_resposta   INT  NOT NULL AUTO_INCREMENT,
    id_formulario INT  NOT NULL UNIQUE,
    id_medico     INT  NOT NULL,
    texto         TEXT NOT NULL,
    data_resposta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_resposta),
    CONSTRAINT fk_resp_form FOREIGN KEY (id_formulario) REFERENCES formularios (id_formulario),
    CONSTRAINT fk_resp_med  FOREIGN KEY (id_medico)     REFERENCES medicos     (id_medico)
);