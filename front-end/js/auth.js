import {login} from './api.js';


// Atribui os dados inseridos no login á variáveis 
document.getElementById('entry-button-vrf').addEventListener('click', async () => {
    const nome_usuario = document.getElementById('user-id').value.trim();// variável do nome_usuario
    const senha = document.getElementById('password').value;// variável da senha

    const mensagem = document.getElementById('msg-info');// variável usada caso tenho algum erro de usuário, senha ou outro

    if (!nome_usuario || !senha) { // verifica se as variáveis estão 'cheias
        mensagem.textContent = 'Preencha todos os campos.';// se não tiver exibe essa mensagem 
        return;
    }

    try {
        const dados = await login(nome_usuario, senha);

        if (dados.erro) {
            mensagem.textContent = dados.erro;
            return;
        }

    // Armazena o token e o perfil para o uso nas outras páginas 
    localStorage.setItem('token', dados.token);
    localStorage.setItem('perfil', dados.perfil);

    // Redireciona conforme o perfil
    if (dados.perfil == 'admin') 
        window.location.href = '../pages/pages_admin/dashboard_admin.html';
    else 
        window.location.href = '../pages/pages_users/dashboard_user.html';
    
    } catch (err) {
        mensagem.textContent = 'Erro ao conectar ao servidor.';
    }
});