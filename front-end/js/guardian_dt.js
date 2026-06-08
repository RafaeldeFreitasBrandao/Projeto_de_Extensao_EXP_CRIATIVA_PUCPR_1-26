import { detalharResponsavel, editarResponsavel } from "./api.js";

let idResponsavel = null;
let modoEdicao = false;

window.addEventListener('load', async () => {
    
    const params = new URLSearchParams(window.location.search);
    idResponsavel = params.get('id');
    const isAdmin = window.location.pathname.includes('/pages_admin/') || window.location.pathname.includes('pages_admin');
    const listaResponsaveisPage = isAdmin ? 'guardians_admin.html' : 'guardian_user.html';

    if (!idResponsavel) {
        window.location.href = listaResponsaveisPage;
        return;
    }

    const dados = await detalharResponsavel(idResponsavel);

    if (dados.erro) {

        alert(dados.erro);
        window.location.href = listaResponsaveisPage;
        return;
    }

    document.getElementById('cpf').value           = dados.CPF || '';
    document.getElementById('nome').value          = dados.nome;
    document.getElementById('telefone').value           = dados.telefone;
    document.getElementById('email').value            = dados.email || '';
    document.getElementById('grau').value          = dados.grau || '';

    
    definirBloqueio(true);
});

function definirBloqueio(bloquear) {

    //Dados não editáveis
    document.getElementById('cpf').disabled = true;
    document.getElementById('grau').disabled = true;
    

    //Dados editáveis
    document.getElementById('nome').disabled = bloquear;
    document.getElementById('telefone').disabled = bloquear;
    document.getElementById('email').disabled =bloquear;

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
        nome:               document.getElementById('nome').value.trim(),
        telefone:     document.getElementById('telefone').value.trim(),
        email:               document.getElementById('email').value.trim(),
    };

    const resultado = await editarResponsavel(idResponsavel,dados);

    if (resultado.erro) {

        msg.textContent = resultado.erro;
        return;

    }



    msg.textContent = 'Dados atualizados com sucesso!!';
    btn.textContent = 'Editar';

    modoEdicao = false;

    definirBloqueio(true);

});