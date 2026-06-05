import { detalharPaciente, editarPaciente, atualizarFotoPaciente } from "./api.js";

let idPaciente = null;
let modoEdicao = false;

window.addEventListener('load', async () => {
    
    const params = new URLSearchParams(window.location.search);
    idPaciente = params.get('id');

    if (!idPaciente) {
        window.location.href = 'pacients_user.html'
    }

    const dados = await detalharPaciente(idPaciente);

    if (dados.erro) {

        alert(dados.erro);
        window.location.href = 'pacients_user.html'
    }

    document.getElementById('nome').value          = dados.nome;
    document.getElementById('cpf').value           = dados.cpf;
    document.getElementById('rg').value            = dados.rg || '';
    document.getElementById('sexo').value          = dados.sexo || '';

    let data = dados.dataNascimento || '';
    if (data.length > 10) data = data.substring(0,10);

    document.getElementById('dataNascimento').value = data;

    document.getElementById('responsavel').value = dados.nomeResponsavel || 'Nenhum';

    definirBloqueio(true);

    const imgEl = document.getElementById('fotoPaciente');
    if (dados.foto) {
        imgEl.src = `http://localhost:3000/uploads/${dados.foto}`;
        imgEl.style.display = 'block';
    } else {
        imgEl.style.display = 'none';
    }
});

document.getElementById('trocarFotoBtn').addEventListener('click', async () => {
    const file = document.getElementById('novaFoto').files[0];
    if (!file) { alert('Selecione uma imagem.'); return; }

    const resultado = await atualizarFotoPaciente(idPaciente, file);
    if (resultado.erro) { alert(resultado.erro); return; }

    document.getElementById('fotoPaciente').src =
        `http://localhost:3000/uploads/${resultado.foto}`;
    document.getElementById('msg').textContent = 'Foto atualizada!';
});

function definirBloqueio(bloquear) {

    //Dados não editáveis
    document.getElementById('cpf').disabled = true;
    document.getElementById('rg').disabled = true;
    document.getElementById('responsavel').disabled = true;

    //Dados editáveis
    document.getElementById('nome').disabled = bloquear;
    document.getElementById('dataNascimento').disabled = bloquear;
    document.getElementById('sexo').disabled =bloquear;

    document.getElementById('labelNovaFoto').style.display = bloquear ? 'none' : 'flex';
    document.getElementById('novaFoto').style.display      = bloquear ? 'none' : 'block';
    document.getElementById('trocarFotoBtn').style.display = bloquear ? 'none' : 'block';

}

document.getElementById('edit_button').addEventListener("click", async () => {

    const btn = document.getElementById('edit_button');
    const msg = document.getElementById('msg');

    if (!modoEdicao) {
        definirBloqueio(false);
        btn.textContent = 'Salvar';
        modoEdicao = true;
        return;
    }

    const dados = {
        nome:               document.getElementById('nome').value.trim(),
        dataNascimento:     document.getElementById('dataNascimento').value.trim(),
        sexo:               document.getElementById('sexo').value.trim()
    };

    const resultado = await editarPaciente(idPaciente,dados);

    if (resultado.erro) {

        msg.textContent = resultado.erro;
        return;

    }


    msg.textContent = 'Dados atualizados com sucesso!!';
    btn.textContent = 'Editar';

    modoEdicao = false;

    definirBloqueio(true);

});