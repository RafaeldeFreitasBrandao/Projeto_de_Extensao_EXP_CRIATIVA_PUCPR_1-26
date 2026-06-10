import {detalharFormulario, detalharFormularioAdmin, editarFormulario, deletarFormulario} from "./api.js";

let idFormulario = null;
let modoEdicao = false;

window.addEventListener('load', async () => {

    const params = new URLSearchParams(window.location.search);
    idFormulario = params.get('id');

    if (!idFormulario) {
        window.location.href = 'forms_user.html';
        return;
    }

    // Try admin detail first; fall back to regular detail if access denied
    let dados = await detalharFormularioAdmin(idFormulario);
    let isAdmin = true;

    if (dados.erro) {
        if (dados.erro === 'Acesso negado.') {
            dados = await detalharFormulario(idFormulario);
            isAdmin = false;
        } else {
            alert(dados.erro);
            window.location.href = 'forms_user.html';
            return;
        }
    }

    document.getElementById('nomePaciente').value = dados.nome_paciente;
    document.getElementById('nomeResponsavel').value = dados.nome_responsavel;

    const idAtivos = dados.comportamentos.map(c => c.id_comportamento);

    document.querySelectorAll('.btn_ys').forEach(btn => {
        if (idAtivos.includes(Number(btn.dataset.id))) {
            btn.classList.add('ativo');
            btn.textContent = 'Sim';
        }
    });

    definirBloqueio(true);
    
    // Delete handler
    const delBtn = document.getElementById('delete_button');
    if (delBtn) {
        delBtn.addEventListener('click', async () => {
            if (!confirm('Deseja realmente excluir este formulário?')) return;

            const r = await deletarFormulario(idFormulario);
            if (r.erro) {
                alert(r.erro);
                return;
            }

            alert('Formulário excluído com sucesso');
            window.location.href = isAdmin ? 'forms_admin.html' : 'forms_user.html';
        });
    }
});


function definirBloqueio(bloquear) {
    document.querySelectorAll('.btn_ys').forEach(btn => {

        btn.style.pointerEvents = bloquear ? 'none' : 'auto';
        btn.style.opacity = bloquear ? '0.7' : '1';
    });
}

document.querySelectorAll('.btn_ys').forEach(btn => {
    btn.addEventListener('click', function () {
        this.classList.toggle('ativo');
        this.textContent = this.classList.contains('ativo') ? 'Sim' : 'Não';
    });
});


document.getElementById('edit_button').addEventListener('click', async () => {

    const btn = document.getElementById('edit_button');

    if (!modoEdicao) {
        definirBloqueio(false);
        btn.textContent = 'Salvar';

        modoEdicao = true;

        return;
    }

    const comportamentos = [];

    document.querySelectorAll('.btn_ys').forEach(b => {
        if (b.classList.contains('ativo')) {
            comportamentos.push(Number(b.dataset.id));
        }
    });

    const resultado = await editarFormulario(idFormulario, {comportamentos});

    if(resultado.erro) {
        alert(resultado.erro);
        return;
    }

    btn.textContent = 'Editar';
    modoEdicao = false;
    definirBloqueio(true);

})