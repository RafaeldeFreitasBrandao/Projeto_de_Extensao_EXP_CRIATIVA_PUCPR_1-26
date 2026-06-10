import { detalharFormularioAdmin, editarFormulario } from './api.js';

let idFormulario = null;
let modoEdicao = false;
const perfilUsuario = localStorage.getItem('perfil');

window.addEventListener('load', async () => {
    const params = new URLSearchParams(window.location.search);
    idFormulario = params.get('id');

    if (!idFormulario) {
        window.location.href = 'report_admin.html';
        return;
    }

    const dados = await detalharFormularioAdmin(idFormulario);
    if (dados.erro) {
        alert(dados.erro);
        window.location.href = 'report_admin.html';
        return;
    }


    document.querySelector('H3').textContent = dados.nome_paciente || `Formulário ${dados.id_formulario}`;
    document.getElementById('paciente_nome').value = dados.nome_paciente || '';
    document.getElementById('paciente_cpf').value = dados.cpf_paciente || '';
    document.getElementById('responsavel_nome').value = dados.nome_responsavel || '';
    document.getElementById('responsavel_cpf').value = dados.cpf_responsavel || '';
    document.getElementById('grau').value = dados.grau || '';
    document.getElementById('resultado').value = dados.status || '';
    document.getElementById('soma_teste').value = dados.soma_total ?? '';
    document.getElementById('data_preenchimento').value = dados.data_preenchimento || '';

    const imgEl = document.getElementById('fotoPaciente');
    if (dados.foto_paciente) {
        imgEl.src = `http://localhost:3000/uploads/${dados.foto_paciente}`;
        imgEl.style.display = 'block';
    } else {
        imgEl.style.display = 'none';
    }
    

    

    definirBloqueio(true);

});

function definirBloqueio(bloquear) {
    // Campos não editáveis por padrão
    document.getElementById('paciente_cpf').disabled = true;
    document.getElementById('responsavel_cpf').disabled = true;
    document.getElementById('grau').disabled = true;
    document.getElementById('resultado').disabled = true;
    document.getElementById('soma_teste').disabled = true;
    document.getElementById('data_preenchimento').disabled = true;
    document.getElementById('data_calculo').disabled = true;

    document.getElementById('paciente_nome').disabled = bloquear;
    document.getElementById('responsavel_nome').disabled = bloquear;
}

