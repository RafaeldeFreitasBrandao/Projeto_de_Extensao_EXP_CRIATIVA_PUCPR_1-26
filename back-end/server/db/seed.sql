INSERT INTO comportamentos (nome, valor_masculino, valor_feminino) VALUES
('Deficiencia intelectual', 0.32, 0.20),
('Face alongada / orelhas abano',0.29, 0.09),
('Macroorquidismo', 0.26, 0.00),
('Hipermobilidade articular', 0.18, 0.14),
('Dificuldades de aprendizagem', 0.18, 0.28),
('Deficit de atencao', 0.17, 0.12),
('Movimentos repetitivos', 0.15, 0.18),
('Atraso na fala', 0.14, 0.16),
('Hiperatividade', 0.13, 0.15),
('Evita contato visual', 0.12, 0.10),
('Evita contato fisico', 0.10, 0.11),
('Sinais de agressividade', 0.09, 0.13);

INSERT INTO usuarios_saude (nome, CPF, email, telefone, senha_hash, profissao, unidade) VALUES 
('teste', 11122233344, 'teste@gmail.com', '9881234', "12345", 'enfermeiro', 'São José dos Merdais')