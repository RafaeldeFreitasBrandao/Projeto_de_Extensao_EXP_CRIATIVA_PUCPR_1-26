  // Adicionar no topo do guardian.js
import { listarPacientes, criarPaciente, editarPaciente } from '../js/api.js';

  const pacientes = [];
  let indexAtual = null;

  window.addEventListener('load', async () => {
  
    const dados = await listarPacientes();
  
        if (dados.erro) {
        console.error(dados.erro);
        return;
  
      }
  
      dados.forEach(r => pacientes.push(r));
      renderizarLista();
  
    });

  let modoEdicaoDetalhes = false;

  function definirBloqueio(bloquear) {
    document.getElementById('detNome').disabled = bloquear;
    document.getElementById('detRg').disabled = true;
    document.getElementById('detDataNascimento').disabled = bloquear;
    document.getElementById('detSexo').disabled = bloquear;
    document.getElementById('detCpf').disabled = true;
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
    document.getElementById('nome').value = '';
    document.getElementById('cpf').value = '';
    document.getElementById('rg').value = '';
    document.getElementById('dataNascimento').value  = '';
    document.getElementById('sexo').value  = '';
  }

  async function salvarPaciente() {
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const rg = document.getElementById('rg').value.trim();
    const dataNascimento = document.getElementById('dataNascimento').value;
    const sexo = document.getElementById('sexo').value;

    if (!nome || !cpf || !rg || !dataNascimento || !sexo) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const resultado = await criarPaciente({ nome, cpf, rg, dataNascimento, sexo });
    
        if (resultado.erro) {
            alert(resultado.erro);
            return;
        }
    
        pacientes.push(resultado);
        renderizarLista();
        fecharFormulario();
  }

  function renderizarLista() {
    const lista = document.getElementById('listaPacientes');
    lista.innerHTML = '';

    pacientes.forEach((p, index) => {
      const item = document.createElement('div');
      item.classList.add('resp_salvo');
      item.innerHTML = `
        <p> ${p.nome} | CPF: ${p.cpf}</p>
        <button onclick="verDetalhes(${index})">Detalhes</button>
      `;
      lista.appendChild(item);
    });
  }

  function verDetalhes(index) {
    indexAtual = index;
    const p = pacientes[index];

    document.getElementById('detNome').value = p.nome;
    document.getElementById('detCpf').value = p.cpf;
    document.getElementById('detRg').value = p.rg || '';

    let data = p.dataNascimento || '';
    if (data.length > 10) data = data.substring(0, 10);
        document.getElementById('detDataNascimento').value = data;

    document.getElementById('detSexo').value = p.sexo || '';

    definirBloqueio(true);
    document.getElementById('msg-detalhes').textContent = '';

    const btn = document.getElementById('editar-detalhes');
    btn.textContent = 'Editar';
    modoEdicaoDetalhes = false;

    const btnNovo = btn.cloneNode(true);
    btn.parentNode.replaceChild(btnNovo, btn);

    btnNovo.addEventListener('click', async () => {
      const msg = document.getElementById('msg-detalhes');

      if (modoEdicaoDetalhes) {
          const r = pacientes[indexAtual];
          const dados = {
              nome:             document.getElementById('detNome').value.trim(),
              dataNascimento:  document.getElementById('detDataNascimento').value.trim(),
              sexo:             document.getElementById('detSexo').value.trim(),
          };
      
      
          const resultado = await editarPaciente(r.id_paciente, dados);
      
          if (resultado.erro) {
              msg.textContent = resultado.erro;
              return;
          }
      
      
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

window.abrirFormulario   = abrirFormulario;
window.fecharFormulario  = fecharFormulario;
window.salvarPaciente    = salvarPaciente;
window.verDetalhes       = verDetalhes;
window.fecharDetalhes    = fecharDetalhes;