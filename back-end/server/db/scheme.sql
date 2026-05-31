CREATE DATABASE IF NOT EXISTS bd_sistema_clinica;
USE bd_sistema_clinica;

CREATE TABLE administradores (
    id_administrador  INT           	NOT NULL AUTO_INCREMENT,
    nome_usuario      VARCHAR(100)  	NOT NULL,
    senha_hash        VARCHAR(255)  	NOT NULL,
    
    PRIMARY KEY (id_administrador)
);

CREATE TABLE usuarios_saude (
    id_usuario_saude  INT           	NOT NULL AUTO_INCREMENT,
    nome              VARCHAR(100)  	NOT NULL,
    CPF               CHAR(11)      	NOT NULL UNIQUE,
    email             VARCHAR(150)  	NOT NULL,
    telefone          VARCHAR(20)		NOT NULL,
    senha_hash        VARCHAR(255)  	NOT NULL,
    profissao         VARCHAR(100)		NOT NULL,
    unidade           VARCHAR(150)		NOT NULL,
    
    PRIMARY KEY (id_usuario_saude)
);

CREATE TABLE pacientes (
    id_paciente      INT          		NOT NULL AUTO_INCREMENT,
    nome             VARCHAR(100) 		NOT NULL,
    CPF              CHAR(11)       	UNIQUE,
    RG               VARCHAR(20)		UNIQUE,
    data_nascimento  DATE				NOT NULL,
    sexo 			 ENUM('masculino', 'feminino') NOT NULL,
	id_usuario_saude INT NOT NULL,
    
    CONSTRAINT fk_pac_usuario FOREIGN KEY (id_usuario_saude)
      REFERENCES usuarios_saude (id_usuario_saude),
    
    PRIMARY KEY (id_paciente)
);

CREATE TABLE responsaveis (
    id_responsavel  INT           		NOT NULL AUTO_INCREMENT,
    nome            VARCHAR(100)  		NOT NULL,
    CPF             CHAR(11)      		NOT NULL UNIQUE,
    email           VARCHAR(150)		NOT NULL,
    telefone        VARCHAR(20)			NOT NULL,
    grau 			VARCHAR(100)		NOT NULL,
    
    PRIMARY KEY (id_responsavel)
);

CREATE TABLE paciente_responsavel (
    id_paciente     INT 				NOT NULL,
    id_responsavel  INT 				NOT NULL,
    
    PRIMARY KEY (id_paciente, id_responsavel),
    
    CONSTRAINT fk_pr_paciente    FOREIGN KEY (id_paciente)
        REFERENCES pacientes    (id_paciente)
        ON UPDATE CASCADE ON DELETE CASCADE,
        
    CONSTRAINT fk_pr_responsavel FOREIGN KEY (id_responsavel)
        REFERENCES responsaveis (id_responsavel)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE formularios (
    id_formulario       INT          	NOT NULL AUTO_INCREMENT,
    id_paciente         INT          	NOT NULL,
    id_usuario_saude    INT          	NOT NULL,
    id_responsavel		INT				NOT NULL,
    data_preenchimento  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    status              VARCHAR(50),
    
    PRIMARY KEY (id_formulario),
    
    CONSTRAINT fk_form_paciente FOREIGN KEY (id_paciente)
        REFERENCES pacientes      (id_paciente)
        ON UPDATE CASCADE ON DELETE RESTRICT,
        
	CONSTRAINT fk_form_responsavel 
		FOREIGN KEY (id_responsavel) 
        REFERENCES responsaveis (id_responsavel),
        
    CONSTRAINT fk_form_usuario  FOREIGN KEY (id_usuario_saude)
        REFERENCES usuarios_saude (id_usuario_saude)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE comportamentos (
    id_comportamento  INT           	NOT NULL AUTO_INCREMENT,
    nome              VARCHAR(100)  	NOT NULL,
    valor_masculino   DECIMAL(10,2)		NOT NULL,
    valor_feminino    DECIMAL(10,2)		NOT NULL,
    
    PRIMARY KEY (id_comportamento)
);

CREATE TABLE formulario_comportamento (
    id_formulario     INT 				NOT NULL,
    id_comportamento  INT 				NOT NULL,
    
    PRIMARY KEY (id_formulario, id_comportamento),
    
    CONSTRAINT fk_fc_formulario    FOREIGN KEY (id_formulario)
        REFERENCES formularios    (id_formulario)
        ON UPDATE CASCADE ON DELETE CASCADE,
        
    CONSTRAINT fk_fc_comportamento FOREIGN KEY (id_comportamento)
        REFERENCES comportamentos (id_comportamento)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE resultado (
    id_resultado   INT            		NOT NULL AUTO_INCREMENT,
    id_formulario  INT            		NOT NULL UNIQUE,
    soma_total     DECIMAL(10,2)		NOT NULL,
    data_calculo   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id_resultado),
    
    CONSTRAINT fk_res_formulario FOREIGN KEY (id_formulario)
        REFERENCES formularios (id_formulario)
        ON UPDATE CASCADE ON DELETE CASCADE
);


