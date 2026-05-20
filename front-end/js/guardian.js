  // Adicionar no topo do guardian.js
import { listarResponsaveis, criarResponsavel, editarResponsavel } from '../js/api.js';

  const responsaveis = [];
  let indexAtual = null;

  window.addEventListener('load', async () => {

    const dados = await listarResponsaveis();

    if (dados.erro) {
        console.error(dados.erro);
        return;

    }

    dados.forEach(r => responsaveis.push(r));
    renderizarLista();

  });

  let modoEdicaoDetalhes = false;

  function definirBloqueio(bloquear) {
    document.getElementById('detNome').disabled     = bloquear;
    document.getElementById('detTelefone').disabled = bloquear;
    document.getElementById('detEmail').disabled    = bloquear;
    document.getElementById('detGrau').disabled     = bloquear;
    document.getElementById('detCpf').disabled      = true;
    document.getElementById('detPaciente').disabled = true;
  }

  function fecharDetalhes() {
    document.getElementById('detalhes').classList.remove('visivel');
    indexAtual = null;
  }

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

    responsaveis.forEach((r, index) => {
      const item = document.createElement('div');
      item.classList.add('resp_salvo');
      item.innerHTML = `
        <p>👤 ${r.nome} | CPF: ${r.cpf}</p>
        <button onclick="verDetalhes(${index})">Detalhes</button>
      `;
      lista.appendChild(item);
    });
  }

  function verDetalhes(index) {
    indexAtual = index;
    const r = responsaveis[index];

    document.getElementById('detNome').value     = r.nome;
    document.getElementById('detCpf').value      = r.cpf;
    document.getElementById('detTelefone').value = r.telefone || '';
    document.getElementById('detEmail').value    = r.email    || '';
    document.getElementById('detGrau').value     = r.grau     || '';
    document.getElementById('detPaciente').value = r.paciente
      ? r.paciente
      : 'Nenhum paciente vinculado';

    definirBloqueio(true);
    document.getElementById('msg-detalhes').textContent = '';

    const btn    = document.getElementById('editar-detalhes');
    btn.textContent    = 'Editar';
    modoEdicaoDetalhes = false;

    const btnNovo = btn.cloneNode(true);
    btn.parentNode.replaceChild(btnNovo, btn);

    btnNovo.addEventListener('click', async () => {
      const msg = document.getElementById('msg-detalhes');

      if (modoEdicaoDetalhes) {
    const r = responsaveis[indexAtual];
    const dados = {
        nome:     document.getElementById('detNome').value.trim(),
        telefone: document.getElementById('detTelefone').value.trim(),
        email:    document.getElementById('detEmail').value.trim(),
        grau:     document.getElementById('detGrau').value.trim(),
    };

    // Usa o id_responsavel que veio do banco para identificar qual editar
    const resultado = await editarResponsavel(r.id_responsavel, dados);

    if (resultado.erro) {
        msg.textContent = resultado.erro;
        return;
    }

    // Atualiza o objeto local com os novos dados
    Object.assign(r, dados);
    renderizarLista();
    msg.textContent     = 'Dados atualizados com sucesso!';
    btnNovo.textContent = 'Editar';
    modoEdicaoDetalhes  = false;
    definirBloqueio(true);
    return;
    }
      definirBloqueio(false);
      btnNovo.textContent = 'Salvar';
      msg.textContent     = '';
      modoEdicaoDetalhes  = true;
    }); 

    document.getElementById('detalhes').classList.add('visivel');
  }

window.abrirFormulario  = abrirFormulario;
window.fecharFormulario = fecharFormulario;
window.salvarResponsavel = salvarResponsavel;
window.verDetalhes      = verDetalhes;
window.fecharDetalhes   = fecharDetalhes;

