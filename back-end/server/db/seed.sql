INSERT INTO comportamentos (nome, valor_masculino, valor_feminino) VALUES
('Deficiencia intelectual', 0.32, 0.20),
('Face alongada / orelhas abano',0.29, 0.09),
('Macroorquidismo', 0.26, 0.00),
('Hipermobilidade articular', 0.18, 0.14),
('Dificuldades de aprendizagem', 0.18, 0.28),
('Deficit de atusuarios_saudeencao', 0.17, 0.12),
('Movimentos repetitivos', 0.15, 0.18),
('Atraso na fala', 0.14, 0.16),
('Hiperatividade', 0.13, 0.15),
('Evita contato visual', 0.12, 0.10),
('Evita contato fisico', 0.10, 0.11),
('Sinais de agressividade', 0.09, 0.13);

INSERT INTO usuarios_saude (nome, CPF, email, telefone, senha_hash, profissao, unidade) VALUES 
('rafael', 11111111111, 'teste1@gmail.com', '9081234', "111", 'enfermeira', 'São José dos Merdais');

INSERT INTO pacientes (nome, CPF, RG, data_nascimento, sexo, id_usuario_saude) VALUES 
('Carlos', 11111111111, '222222222222222','1995-10-25','masculino', 1);

INSERT INTO usuarios_saude (nome, CPF, email, telefone, senha_hash, profissao, unidade) VALUES 
('José', 11111111112, 'teste1@gmail.com', '9081234', "123", 'enfermeira', 'São José dos Merdais');

INSERT INTO administradores (nome_usuario, senha_hash) VALUES 
('rafael', '11111111111');