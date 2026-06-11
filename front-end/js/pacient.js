  // Adicionar no topo do guardian.js
import { listarPacientes, criarPaciente, editarPaciente,} from '../js/api.js';

  const pacientes = [];
 

  window.addEventListener('load', async () => {
  
    const dados = await listarPacientes();
  
        if (dados.erro) {
        console.error(dados.erro);
        return;
  
      }
  
      dados.forEach(r => pacientes.push(r));
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
    document.getElementById('rg').value = '';
    document.getElementById('dataNascimento').value  = '';
    document.getElementById('sexo').value  = '';
    document.getElementById('foto').value = '';
    document.getElementById('fotoPreview').style.display = 'none';
  }

  document.getElementById('foto').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('fotoPreview');

    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = 'block';

    } else {
      preview.style.display = 'none';
    }

  });

  async function salvarPaciente() {
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const rg = document.getElementById('rg').value.trim();
    const dataNascimento = document.getElementById('dataNascimento').value;
    const sexo = document.getElementById('sexo').value;
    const fotoFile = document.getElementById('foto').files[0] || null;

    if (!nome || !cpf || !rg || !dataNascimento || !sexo) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const resultado = await criarPaciente({ nome, cpf, rg, dataNascimento, sexo }, fotoFile);
    
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

    const idUsuarioLogado = Number(localStorage.getItem('id'));

    pacientes.forEach((p, index) => {
        const item = document.createElement('div');
        item.classList.add('resp_salvo');

        if (p.id_usuario_saude !== idUsuarioLogado) {
            item.classList.add('bloqueado');
        }

      item.innerHTML = `
        <p> ${p.nome} | CPF: ${p.cpf}</p>
        <a href="pacient_detail_user.html?id=${p.id_paciente}">
          <button>Detalhes</button>
        </a>
      `;
      lista.appendChild(item);
    });
  }



window.abrirFormulario   = abrirFormulario;
window.fecharFormulario  = fecharFormulario;
window.salvarPaciente    = salvarPaciente;