import { listarFormularios, editarFormulario, deletarFormulario } from '../../js/api.js';

const forms = [];
const formsBody = document.getElementById('formsBody');
const searchInput = document.getElementById('searchInput');
const totalFormsEl = document.getElementById('totalForms');
const completedFormsEl = document.getElementById('completedForms');
const pendingFormsEl = document.getElementById('pendingForms');
const emptyState = document.getElementById('emptyState');
const pageMessage = document.getElementById('pageMessage');
const modal = document.getElementById('modalEditar');
const editForm = document.getElementById('editForm');
const formIdInput = document.getElementById('formId');
const modalPaciente = document.getElementById('modalPaciente');
const modalResponsavel = document.getElementById('modalResponsavel');
const statusSelect = document.getElementById('statusSelect');
const closeModalButton = document.getElementById('closeModal');
const cancelEditButton = document.getElementById('cancelEdit');

window.addEventListener('load', loadForms);
searchInput?.addEventListener('input', renderTable);
closeModalButton?.addEventListener('click', closeModal);
cancelEditButton?.addEventListener('click', closeModal);

async function loadForms() {
    const dados = await listarFormularios();

    if (!dados) {
        showMessage('Erro ao carregar formulários.', true);
        return;
    }

    if (dados.erro) {
        showMessage(dados.erro, true);
        return;
    }

    forms.splice(0, forms.length, ...dados);
    updateStats();
    renderTable();
}

function getBadgeClass(status) {
    if (!status) return 'review';
    const lower = status.toLowerCase();
    if (lower.includes('indicado') || lower.includes('concluído')) return 'completed';
    if (lower.includes('pendente')) return 'pending';
    return 'review';
}

function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function updateStats() {
    totalFormsEl.textContent = forms.length;
    completedFormsEl.textContent = forms.filter(item => item.status?.toLowerCase().includes('indicado') || item.status?.toLowerCase().includes('concluído')).length;
    pendingFormsEl.textContent = forms.filter(item => item.status?.toLowerCase().includes('pendente')).length;
}

function renderTable() {
    if (!formsBody) return;

    const query = searchInput?.value.trim().toLowerCase() ?? '';
    const filtered = forms.filter(item => {
        const paciente = item.nome_paciente?.toLowerCase() ?? '';
        const responsavel = item.cpf_paciente?.toLowerCase() ?? '';
        const status = item.status?.toLowerCase() ?? '';
        return paciente.includes(query) || responsavel.includes(query) || status.includes(query);
    });

    formsBody.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    filtered.forEach(form => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${form.id_formulario}</td>
            <td>${form.nome_paciente || '-'}</td>
            <td>${form.cpf_paciente || '-'}</td>
            <td>${formatDate(form.data_preenchimento)}</td>
            <td><span class="status ${getBadgeClass(form.status)}">${form.status || 'Sem status'}</span></td>
            <td class="actions">
                <button type="button" class="btn btn-edit">Editar</button>
                <button type="button" class="btn btn-delete">Excluir</button>
            </td>
        `;

        row.querySelector('.btn-edit')?.addEventListener('click', () => openEditModal(form));
        row.querySelector('.btn-delete')?.addEventListener('click', () => confirmDelete(form.id_formulario));

        formsBody.appendChild(row);
    });
}

function openEditModal(form) {
    if (!modal || !editForm) return;

    formIdInput.value = form.id_formulario;
    modalPaciente.value = form.nome_paciente || '';
    modalResponsavel.value = form.cpf_paciente || '';
    statusSelect.value = form.status || 'Em análise';
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

async function confirmDelete(id) {
    const confirmed = window.confirm('Tem certeza que deseja apagar este formulário?');
    if (!confirmed) return;

    const result = await deletarFormulario(id);
    if (!result) {
        showMessage('Erro ao apagar formulário.', true);
        return;
    }

    if (result.erro) {
        showMessage(result.erro, true);
    } else {
        showMessage('Formulário apagado com sucesso.');
        const index = forms.findIndex(item => item.id_formulario === id);
        if (index !== -1) {
            forms.splice(index, 1);
            updateStats();
            renderTable();
        }
    }
}

editForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const id = Number(formIdInput.value);
    const status = statusSelect.value;

    const result = await editarFormulario(id, { status });
    if (!result) {
        showMessage('Erro ao atualizar formulário.', true);
        return;
    }

    if (result.erro) {
        showMessage(result.erro, true);
        return;
    }

    showMessage('Status atualizado com sucesso.');
    closeModal();
    await loadForms();
});

function showMessage(text, isError = false) {
    if (!pageMessage) return;
    pageMessage.textContent = text;
    pageMessage.classList.toggle('error', isError);
    pageMessage.classList.remove('hidden');
    setTimeout(() => pageMessage.classList.add('hidden'), 5000);
}
