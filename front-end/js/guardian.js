import { listarResponsaveis, criarResponsavel } from '../js/api.js';

const responsaveis = [];
const isAdmin = window.location.pathname.includes('/pages_admin/') || window.location.pathname.includes('pages_admin');

window.addEventListener('load', async () => {
    const dados = await listarResponsaveis();

    if (dados.erro) {
        console.error(dados.erro);
        return;
    }

    dados.forEach(r => responsaveis.push(r));
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
    document.getElementById('nome').value     = '';
    document.getElementById('cpf').value      = '';
    document.getElementById('telefone').value = '';
    document.getElementById('email').value    = '';
    document.getElementById('grau').value     = '';
}

async function salvarResponsavel() {
    const nome     = document.getElementById('nome').value.trim();
    const cpf      = document.getElementById('cpf').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const email    = document.getElementById('email').value.trim();
    const grau     = document.getElementById('grau').value.trim();

    if (!nome || !cpf || !telefone || !email || !grau) {
        alert('Preencha todos os campos.');
        return;
    }

    const resultado = await criarResponsavel({ nome, cpf, telefone, email, grau });

    if (resultado.erro) {
        alert(resultado.erro);
        return;
    }

    responsaveis.push(resultado);
    renderizarLista();
    fecharFormulario();
}

function renderizarLista() {
    const lista = document.getElementById('listaResponsaveis');
    lista.innerHTML = '';

    responsaveis.forEach((r) => {
        const item = document.createElement('div');
        item.classList.add('resp_salvo');
        const detailPage = isAdmin ? 'guardian_detail_admin.html' : 'guardian_detail_user.html';
        item.innerHTML = `
            <p> ${r.nome} | CPF: ${r.CPF}</p>
            <a href="${detailPage}?id=${r.id_responsavel}">
                <button>Detalhes</button>
            </a>
        `;
        lista.appendChild(item);
    });
}

window.abrirFormulario   = abrirFormulario;
window.fecharFormulario  = fecharFormulario;
window.salvarResponsavel = salvarResponsavel;