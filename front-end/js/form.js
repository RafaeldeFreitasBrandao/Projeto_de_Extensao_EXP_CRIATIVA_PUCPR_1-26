import { listarFormularios, criarFormulario,detalharFormulario, editarFormulario } from "../js/api.js";

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
        <p> Formulário: #${p.id_formulario}#</p>
        <a href="../form_detail_user.html?id=${p.id_formulario}
        <button>Detalhes</button>
        </a>`;
        lista.appendChild(item);
    });
}
