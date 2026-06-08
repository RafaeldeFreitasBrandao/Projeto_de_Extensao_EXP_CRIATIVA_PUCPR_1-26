const BASE = 'http://localhost:3000/api';
 
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    };
}
 
function mostrarErro(mensagem) {
    const toast = document.getElementById('toast-erro');
    document.getElementById('toast-msg').textContent = mensagem;
    toast.style.display = 'flex';
}
 
document.getElementById('toast-fechar').addEventListener('click', () => {
    document.getElementById('toast-erro').style.display = 'none';
});
 
window.addEventListener('load', async () => {
 
    try {
        const resposta = await fetch(`${BASE}/admin/minha-conta`, {
            method: 'GET',
            headers: getHeaders()
        });
 
        const dados = await resposta.json();
 
        if (dados.erro) {
            mostrarErro(dados.erro);
            return;
        }
 
        document.getElementById('nome_usuario').value = dados.nome_usuario;
 
        document.getElementById('nome_usuario').disabled = true;
        document.getElementById('senha').disabled        = true;
 
    } catch (err) {
        mostrarErro('Não foi possível carregar os dados. Verifique sua conexão.');
    }
});
 
let modoEdicao = false;
 
document.getElementById('edit-button').addEventListener('click', async () => {
 
    const msg = document.getElementById('msg-info');
    const btn = document.getElementById('edit-button');
 
    if (modoEdicao) {
 
        const dados = {
            nome_usuario: document.getElementById('nome_usuario').value,
            senha:        document.getElementById('senha').value || undefined,
        };
 
        if (!dados.nome_usuario) delete dados.nome_usuario;
        if (!dados.senha)        delete dados.senha;
 
        if (!dados.nome_usuario && !dados.senha) {
            mostrarErro('Altere ao menos um campo antes de salvar.');
            return;
        }
 
        try {
            const resposta = await fetch(`${BASE}/admin/minha-conta`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(dados)
            });
 
            const resultado = await resposta.json();
 
            if (resultado.erro) {
                mostrarErro(resultado.erro);
                return;
            }
 
            msg.style.color  = 'green';
            msg.textContent  = 'Dados atualizados com sucesso!';
            btn.innerHTML    = '<i class="fa-solid fa-pen"></i> Editar';
            btn.className    = 'nav_btn';
            modoEdicao       = false;
 
            document.getElementById('nome_usuario').disabled = true;
            document.getElementById('senha').disabled        = true;
            document.getElementById('senha').value           = '';
 
        } catch (err) {
            mostrarErro('Erro ao salvar os dados. Tente novamente.');
        }
 
        return;
    }
 
    const senhaAtual = prompt('Digite sua senha atual para editar seus dados:');
 
    if (!senhaAtual) return;
 
    try {
        const resposta = await fetch(`${BASE}/admin/verificar-senha`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ senha: senhaAtual })
        });
 
        const resultado = await resposta.json();
 
        if (resultado.erro) {
            mostrarErro(resultado.erro);
            return;
        }
 
        document.getElementById('nome_usuario').disabled = false;
        document.getElementById('senha').disabled        = false;
        document.getElementById('senha').value           = resultado.senha;
 
        msg.style.color = '#555';
        msg.textContent = 'Edite os campos e clique em Salvar.';
        btn.innerHTML   = '<i class="fa-solid fa-floppy-disk"></i> Salvar';
        btn.className   = 'nav_btn salvar';
        modoEdicao      = true;
 
    } catch (err) {
        mostrarErro('Erro ao verificar a senha. Tente novamente.');
    }
});