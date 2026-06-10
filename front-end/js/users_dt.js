import { detalharUsuario, editarUsuario } from "./api.js";
let idUsuario = null;
let modoEdicao = false;

window.addEventListener('load', async () => {
    
    const params = new URLSearchParams(window.location.search);
    idUsuario = params.get('id');
    const isAdmin = window.location.pathname.includes('/users_admin/') || window.location.pathname.includes('users_admin');
    const listaUsersPage = isAdmin ? 'users_admin.html' : 'users_admin.html';

    if (!idUsuario) {
        window.location.href = listaUsersPage;
        return;
    }

    const dados = await detalharUsuario(idUsuario);

    if (dados.erro) {

        alert(dados.erro);
        window.location.href = listaUsersPage;
        return;
    }

    document.getElementById('nome').value = dados.nome;
    document.getElementById('cpf').value = dados.cpf || dados.CPF;
    document.getElementById('email').value = dados.email;
    document.getElementById('telefone').value = dados.telefone;
    document.getElementById('profissao').value = dados.profissao;
    document.getElementById('unidade').value = dados.unidade;

    definirBloqueio(true);

});

function definirBloqueio(bloquear) {

    //Dados não editáveis
    document.getElementById('cpf').disabled = true;

    //Dados editáveis
    document.getElementById('nome').disabled      = bloquear;
    document.getElementById('email').disabled     = bloquear;
    document.getElementById('telefone').disabled  = bloquear;
    document.getElementById('profissao').disabled = bloquear;
    document.getElementById('unidade').disabled   = bloquear;

}

document.getElementById('edit_button').addEventListener("click", async () => {

    const btn = document.getElementById('edit_button');
    const msg = document.getElementById('msg');

    if (!modoEdicao) {
        definirBloqueio(false);
        btn.textContent = 'Salvar';
        modoEdicao = true;
        return;
    }

    const dados = {
        nome: document.getElementById('nome').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        profissao: document.getElementById('profissao').value.trim(),
        unidade: document.getElementById('unidade').value.trim()

    };

    const resultado = await editarUsuario(idUsuario,dados);

    if (resultado.erro) {

        msg.textContent = resultado.erro;
        return;

    }


    msg.textContent = 'Dados atualizados com sucesso!!';
    btn.textContent = 'Editar';

    modoEdicao = false;

    definirBloqueio(true);

});