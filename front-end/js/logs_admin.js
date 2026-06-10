import { listarLogs } from '../../js/api.js';

const ICONES = {
    paciente: 'fa-user-plus',
    responsavel: 'fa-user-shield',
    usuario: 'fa-user-nurse',
    formulario: 'fa-clipboard-list'
};

const ENTIDADE_LABEL = {
    paciente: 'paciente',
    responsavel: 'responsável',
    usuario: 'usuário de saúde',
    formulario: 'formulário'
};

async function carregarLogs() {
    const container = document.getElementById('logsContainer');
    const contador = document.getElementById('logsCount');

    container.innerHTML = '<p class="logs_empty">Carregando registros...</p>';

    try {
        const logs = await listarLogs();

        if (!Array.isArray(logs) || logs.length === 0) {
            container.innerHTML = '<p class="logs_empty">Nenhum registro encontrado nos últimos 30 dias.</p>';
            contador.textContent = '0 registros';
            return;
        }

        contador.textContent = `${logs.length} registro${logs.length > 1 ? 's' : ''}`;
        container.innerHTML = logs.map(montarLogCard).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p class="logs_empty">Erro ao carregar os registros.</p>';
        contador.textContent = '0 registros';
    }
}

function montarLogCard(log) {
    const icone = ICONES[log.entidade] || 'fa-pen';
    const entidadeLabel = ENTIDADE_LABEL[log.entidade] || log.entidade;
    const campos = Array.isArray(log.campos_editados) ? log.campos_editados : [];
    const tags = campos.map(c => `<span class="log_tag">${escapeHtml(c)}</span>`).join('');

    const tipoLabel = log.tipo_usuario === 'admin' ? 'Administrador' : 'Usuário de Saúde';
    const tipoClasse = log.tipo_usuario === 'admin' ? 'log_badge_admin' : 'log_badge_saude';

    const dataHora = new Date(log.data_hora).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    return `
        <div class="log_card">
            <div class="log_icon"><i class="fa-solid ${icone}"></i></div>
            <div class="log_info">
                <div class="log_top_row">
                    <span class="log_quem">${escapeHtml(log.nome_usuario)}</span>
                    <span class="log_badge ${tipoClasse}">${tipoLabel}</span>
                </div>
                <span class="log_oque">Editou ${entidadeLabel}: <strong>${escapeHtml(log.nome_entidade || '—')}</strong></span>
                ${tags ? `<div class="log_campos">${tags}</div>` : ''}
                <span class="log_hora"><i class="fa-regular fa-clock"></i> ${dataHora}</span>
            </div>
        </div>
    `;
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

document.getElementById('refresh_button').addEventListener('click', carregarLogs);

carregarLogs();