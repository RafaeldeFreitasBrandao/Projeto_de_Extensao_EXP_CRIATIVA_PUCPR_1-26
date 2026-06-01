import { listarFormularios } from './api.js';

const formularios = [];

window.addEventListener('load', async () => {
  const dados = await listarFormularios();

  if (dados.erro) {
    console.error(dados.erro);
    return;
  }

  dados.forEach(f => formularios.push(f));
  renderizarLista();
});

function abrirFormulario() {
  document.getElementById('formulario').classList.add('visivel');
}

function fecharFormulario() {
  document.getElementById('formulario').classList.remove('visivel');
}

function renderizarLista() {
  const lista = document.getElementById('listaFormularios');
  lista.innerHTML = '';

  if (!formularios || formularios.length === 0) {
    lista.textContent = 'Nenhum resultado encontrado.';
    return;
  }

  formularios.forEach(f => {
    const id = f.id_formulario;
    const nome = f.nome_paciente || f.nome || `Formulário #${id}#`;
    const data = f.data_preenchimento || f.data || '';

    const item = document.createElement('div');
    item.className = 'reg_item';

    const textBlock = document.createElement('div');
    textBlock.className = 'reg_item_text';

    const title = document.createElement('h3');
    title.textContent = nome;

    const meta = document.createElement('p');
    meta.textContent = data ? `Data: ${data}` : 'Sem data';

    textBlock.appendChild(title);
    textBlock.appendChild(meta);

    const details = document.createElement('a');
    details.className = 'details_btn';
    details.href = `report_detail_user.html?id=${id}`;
    details.textContent = 'Detalhes';

    item.appendChild(textBlock);
    item.appendChild(details);
    lista.appendChild(item);
  });
}