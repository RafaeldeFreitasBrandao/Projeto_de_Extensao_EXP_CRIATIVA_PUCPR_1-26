import {login} from './api.js';

document.getElementById('entry-button-vrf').addEventListener('click', async () => {
    const nome_usuario = document.getElementById('user-name').value.trim();
    const senha = document.getElementById('password').value;

    const mensagem = document.getElementById('msg-info');

    if (!nome_usuario || !senha) {
        mensagem.textContent = 'Preencha todos os campos.';
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