import { listarFormularios, criarFormulario, } from "./api.js";

    const formularios = [];

  const botoes = document.querySelectorAll('.btn_ys');

  botoes.forEach(botao => {
    botao.addEventListener('click', function() {
        this.classList.toggle('ativo');

        if (this.textContent === 'Não') {
          this.textContent = 'Sim';
       } else {
          this.textContent = 'Não';
      }
    });
  }); 


window.addEventListener('load', async () => {

    const dados = await listarFormularios();

    if(dados.erro) {
        console.error(dados.erro);
        return;
    }

    dados.forEach(r => formularios.push(r));
    renderizarLista();

});


function renderizarLista() {
    const lista = document.getElementById('listaFormularios');
    lista.innerHTML = '';

    const idUsuarioLogado = Number(localStorage.getItem('id'));

    formularios.forEach((p, index) => {
        const item = document.createElement('div');
        item.classList.add('form_salvo');

        item.innerHTML = `
        <p> Formulário do paciente: ${p.nome_paciente}</p>
        <a href="forms_detail_user.html?id=${p.id_formulario}">
        <button>Detalhes</button>
        </a>`
        lista.appendChild(item);
    });
}

document.getElementById('save_form').addEventListener('click', async () => {

    const cpf_paciente   = document.getElementById('cpfPaciente').value.trim();
    const cpf_responsavel = document.getElementById('cpfResponsavel').value.trim();

    if (!cpf_paciente || !cpf_responsavel) {
        alert('Preencha o CPF do paciente e do responsável.');
        return;
    }

  
    const comportamentos = [];
    document.querySelectorAll('.btn_ys').forEach(btn => {
        if (btn.classList.contains('ativo')) {
            comportamentos.push(Number(btn.dataset.id));
        }
    });

    const resultado = await criarFormulario({ cpf_paciente, cpf_responsavel, comportamentos });

    if (resultado.erro) {
        alert(resultado.erro);
        return;
    }


    const dadosAtualizados = await listarFormularios();
    if (!dadosAtualizados.erro) {
        formularios.length = 0;
        dadosAtualizados.forEach(r => formularios.push(r));
        renderizarLista();
    }


    document.getElementById('cpfPaciente').value = '';
    document.getElementById('cpfResponsavel').value = '';
    document.querySelectorAll('.btn_ys').forEach(btn => {
        btn.classList.remove('ativo');
        btn.textContent = 'Não';
    });
});