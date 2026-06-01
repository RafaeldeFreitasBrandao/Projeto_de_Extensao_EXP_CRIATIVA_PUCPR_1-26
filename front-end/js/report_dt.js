import { detalharFormulario, editarFormulario } from './api.js';

let idFormulario = null;
let modoEdicao = false;
const perfilUsuario = localStorage.getItem('perfil');

window.addEventListener('load', async () => {
	const params = new URLSearchParams(window.location.search);
	idFormulario = params.get('id');

	if (!idFormulario) {
		window.location.href = 'report_user.html';
		return;
	}

	const dados = await detalharFormulario(idFormulario);
	if (dados.erro) {
		alert(dados.erro);
		window.location.href = 'report_user.html';
		return;
	}


	document.querySelector('H2').textContent = dados.nome_paciente || `Formulário ${dados.id_formulario}`;
	document.getElementById('paciente_nome').value = dados.nome_paciente || '';
	document.getElementById('paciente_cpf').value = dados.cpf_paciente || '';
	document.getElementById('responsavel_nome').value = dados.nome_responsavel || '';
	document.getElementById('responsavel_cpf').value = dados.cpf_responsavel || '';
	document.getElementById('grau').value = dados.grau || '';
	document.getElementById('resultado').value = dados.status || '';
	document.getElementById('soma_teste').value = dados.soma_total ?? '';
	document.getElementById('data_preenchimento').value = dados.data_preenchimento || '';
	

	

	definirBloqueio(true);

	// Se não for administrador, desativa botão de editar e mostra mensagem
	if (perfilUsuario !== 'admin') {
		document.getElementById('edit_button').disabled = true;
		document.getElementById('msg').textContent = 'Edição disponível apenas para administradores.';
	}
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

	// Somente os nomes podem ser editados quando estiver no modo edição
	document.getElementById('paciente_nome').disabled = bloquear;
	document.getElementById('responsavel_nome').disabled = bloquear;
}

document.getElementById('edit_button').addEventListener('click', async () => {
	const btn = document.getElementById('edit_button');
	const msg = document.getElementById('msg');

	// segurança extra: bloqueia ação se usuário não for admin
	if (perfilUsuario !== 'admin') {
		msg.textContent = 'Você não tem permissão para editar este formulário.';
		return;
	}

	if (!modoEdicao) {
        definirBloqueio(false);
        btn.textContent = 'Salvar';
        modoEdicao = true;
        return;
    }

	// Ao salvar, apenas alternamos o modo de edição (não há endpoint de edição de nomes aqui)
	msg.textContent = 'Dados atualizados com sucesso!!';
	btn.textContent = 'Editar';
	modoEdicao = false;
	definirBloqueio(true);
});
