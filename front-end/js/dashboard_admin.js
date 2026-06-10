import { listarLogs } from './api.js';

async function carregarLogsRecentes() {
    const logs = await listarLogs(5);
    const container = document.getElementById('logContent');

    if (!logs.length) {
        container.innerHTML = '<p class="log_empty">Nenhuma ação registrada ainda...</p>';
        return;
    }

    container.innerHTML = logs.map(log => montarLogCard(log)).join('');
}

function montarLogCard(log) {
    const campos = log.campos_editados.join(', ') || '—';
    const hora = new Date(log.data_hora).toLocaleString('pt-BR');
    const icones = { paciente: 'fa-user-plus', responsavel: 'fa-user-shield', usuario: 'fa-user-nurse', formulario: 'fa-clipboard-list' };
    const icone = icones[log.entidade] || 'fa-pen';

    return `
        <div class="log_card">
            <i class="fa-solid ${icone}"></i>
            <div class="log_info">
                <span class="log_quem">${log.nome_usuario}</span>
                <span class="log_oque">Editou ${log.entidade}: <strong>${log.nome_entidade || '—'}</strong></span>
                <span class="log_campos">Campos: ${campos}</span>
                <span class="log_hora">${hora}</span>
            </div>
        </div>
    `;
}

carregarLogsRecentes();
