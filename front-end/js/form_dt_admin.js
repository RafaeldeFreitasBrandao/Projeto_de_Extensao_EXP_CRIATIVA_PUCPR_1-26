import { detalharFormularioAdmin, editarFormulario, deletarFormulario } from "./api.js";

let idFormulario = null;
let modoEdicao = false;

window.addEventListener('load', async () => {
  const params = new URLSearchParams(window.location.search);
  idFormulario = params.get('id');

  if (!idFormulario) {
    window.location.href = 'forms_admin.html';
    return;
  }

  const dados = await detalharFormularioAdmin(idFormulario);

  if (dados.erro) {
    document.getElementById('msg').textContent = dados.erro;
    return;
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

  const delBtn = document.getElementById('delete_button');
  if (delBtn) {
    delBtn.addEventListener('click', async () => {
      if (!confirm('Deseja realmente excluir este formulário?')) return;

      const r = await deletarFormulario(idFormulario);
      if (r.erro) {
        document.getElementById('msg').textContent = r.erro;
        return;
      }

      window.location.href = 'forms_admin.html';
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

  const resultado = await editarFormulario(idFormulario, { comportamentos });

  if (resultado.erro) {
    document.getElementById('msg').textContent = resultado.erro;
    return;
  }

  btn.textContent = 'Editar';
  modoEdicao = false;
  definirBloqueio(true);
});