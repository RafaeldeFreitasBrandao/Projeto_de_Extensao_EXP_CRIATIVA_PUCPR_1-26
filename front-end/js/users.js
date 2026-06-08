import { listarUsuarios, criarUsuario, editarUsuario } from '../js/api.js';

const usuarios = [];

window.addEventListener('load', async () => {
    const dados = await listarUsuarios();

    if (dados.erro) {
        console.error(dados.erro);
        return;
    }

    dados.forEach(u => usuarios.push(u));
    renderizarLista();
});


function abrirFormulario() {
    document.getElementById('formulario').classList.add('visivel');
}

function fecharFormulario() {
    document.getElementById('formulario').classList.remove('visivel');
    limparFormulario();
}

function limparFormulario() {
    document.getElementById('nome').value = '';
    document.getElementById('cpf').value = '';
    document.getElementById('email').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('senha').value = '';
    document.getElementById('confirmar_senha').value = '';
    document.getElementById('profissao').value = '';
    document.getElementById('unidade').value = '';
}

async function salvarUser() {
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmar_senha = document.getElementById('confirmar_senha').value;
    const profissao = document.getElementById('profissao').value.trim();
    const unidade = document.getElementById('unidade').value.trim();

    if (!nome || !cpf || !email || !telefone || !senha || !profissao || !unidade) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }

    if (senha !== confirmar_senha) {
        alert('As senhas não coincidem.');
        return;
    }

    const resultado = await criarUsuario({ nome, cpf, email, telefone, senha, profissao, unidade });

    if (resultado.erro) {
        alert(resultado.erro);
        return;
    }

    usuarios.push(resultado);
    renderizarLista();
    fecharFormulario();
}

function renderizarLista() {
    const lista = document.getElementById('listaUser');
    lista.innerHTML = '';

    usuarios.forEach((u) => {
        const item = document.createElement('div');
        item.classList.add('resp_salvo');

        item.innerHTML = `
            <p>${u.nome} | CPF: ${u.cpf} | ${u.profissao}</p>
            <button>Detalhes</button>
        `;
        lista.appendChild(item);
    });
}


window.abrirFormulario  = abrirFormulario;
window.fecharFormulario = fecharFormulario;
window.salvarUser       = salvarUser;