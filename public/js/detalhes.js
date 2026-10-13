/**
 * ISRP - componente de detalhes da solicitação (diálogo acessível).
 * Usado por "Solicitações" (usuário) e pelo "Painel administrativo".
 * Em modo admin, exibe o formulário de alteração de status.
 */
(function () {
  'use strict';
  const { api, escapeHtml, badgeStatus, badgePrioridade, formatarData, mensagem, limparMensagem } = window.ISRP;

  // Espelho das transições do servidor (a regra definitiva é validada no backend)
  const TRANSICOES = {
    'Aberta': ['Em atendimento', 'Encerrada'],
    'Em atendimento': ['Resolvida', 'Aberta'],
    'Resolvida': ['Encerrada', 'Em atendimento'],
    'Encerrada': [],
  };

  let dialog = null;
  let gatilho = null;

  function criarDialog() {
    dialog = document.createElement('dialog');
    dialog.id = 'dialog-detalhes';
    dialog.setAttribute('aria-labelledby', 'dlg-titulo');
    dialog.innerHTML = `
      <div class="dialog-topo">
        <div><p class="protocolo" id="dlg-protocolo"></p><h2 id="dlg-titulo">Detalhes da solicitação</h2></div>
        <button type="button" class="dialog-fechar" aria-label="Fechar detalhes">&times;</button>
      </div>
      <div class="dialog-corpo" id="dlg-corpo"></div>`;
    document.body.appendChild(dialog);
    dialog.querySelector('.dialog-fechar').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { if (gatilho) gatilho.focus(); });
  }

  function htmlHistorico(historico) {
    if (!historico.length) return '<p class="vazio">Sem registros no histórico.</p>';
    return `<ol class="linha-tempo">${historico.map((h) => `
      <li>
        <time datetime="${escapeHtml(h.criado_em)}">${formatarData(h.criado_em)}</time>
        <div>${h.status_anterior ? badgeStatus(h.status_anterior) + ' <span aria-label="para">→</span> ' : ''}${badgeStatus(h.status_novo)}</div>
        <p class="comentario">${escapeHtml(h.comentario || 'Sem comentário.')}
          <br><small>Por: ${escapeHtml(h.responsavel)}${h.responsavel_perfil === 'admin' ? ' (equipe de atendimento)' : ''}</small></p>
      </li>`).join('')}</ol>`;
  }

  function htmlFormStatus(sol) {
    const opcoes = TRANSICOES[sol.status] || [];
    if (!opcoes.length) return '<p class="mensagem info">Solicitação encerrada — não há novas transições de status.</p>';
    return `
      <form id="form-status" class="form-status" novalidate>
        <h3>Alterar status</h3>
        <div id="msg-status" class="mensagem" role="alert" aria-live="assertive"></div>
        <div class="form-linha">
          <div class="form-grupo">
            <label for="novo-status">Novo status <span class="obrigatorio" aria-hidden="true">*</span></label>
            <select id="novo-status" name="status" required>
              <option value="">Selecione...</option>
              ${opcoes.map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('')}
            </select>
          </div>
          <div class="form-grupo">
            <label for="comentario-status">Comentário</label>
            <input type="text" id="comentario-status" name="comentario" maxlength="500" placeholder="Ex.: técnico designado">
          </div>
        </div>
        <button type="submit" class="btn btn-primario">Salvar alteração</button>
      </form>`;
  }

  /**
   * Abre o diálogo de detalhes.
   * @param {number} id
   * @param {{admin?: boolean, onAtualizado?: Function, origem?: HTMLElement}} opcoes
   */
  async function abrir(id, opcoes = {}) {
    if (!dialog) criarDialog();
    gatilho = opcoes.origem || document.activeElement;
    const corpo = dialog.querySelector('#dlg-corpo');
    corpo.innerHTML = '<p class="carregando">Carregando detalhes...</p>';
    dialog.querySelector('#dlg-protocolo').textContent = '';
    if (!dialog.open) dialog.showModal();

    try {
      const [sol, historico] = await Promise.all([
        api.get(`/api/solicitacoes/${id}`),
        api.get(`/api/solicitacoes/${id}/historico`),
      ]);
      dialog.querySelector('#dlg-protocolo').textContent = `Protocolo ${sol.protocolo}`;
      dialog.querySelector('#dlg-titulo').textContent = sol.titulo;
      corpo.innerHTML = `
        <dl class="detalhes-lista">
          <div><dt>Status</dt><dd>${badgeStatus(sol.status)}</dd></div>
          <div><dt>Prioridade</dt><dd>${badgePrioridade(sol.prioridade)}</dd></div>
          <div><dt>Categoria</dt><dd>${escapeHtml(sol.categoria)}</dd></div>
          <div><dt>Serviço</dt><dd>${escapeHtml(sol.servico_nome || '—')}</dd></div>
          <div><dt>Setor responsável</dt><dd>${escapeHtml(sol.setor_nome || '—')}</dd></div>
          <div><dt>Solicitante</dt><dd>${escapeHtml(sol.solicitante)}</dd></div>
          <div><dt>Aberta em</dt><dd>${formatarData(sol.criado_em)}</dd></div>
          <div><dt>Última atualização</dt><dd>${formatarData(sol.atualizado_em)}</dd></div>
          ${sol.prazo_horas ? `<div><dt>Prazo (SLA)</dt><dd>${sol.prazo_horas} h</dd></div>` : ''}
        </dl>
        <h3>Descrição</h3>
        <p class="descricao-bloco">${escapeHtml(sol.descricao)}</p>
        ${opcoes.admin ? htmlFormStatus(sol) : ''}
        <h3>Histórico de alterações</h3>
        ${htmlHistorico(historico)}`;

      const form = corpo.querySelector('#form-status');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const caixa = form.querySelector('#msg-status');
          limparMensagem(caixa);
          if (!form.status.value) {
            mensagem(caixa, 'erro', 'Selecione o novo status.');
            form.status.focus();
            return;
          }
          const botao = form.querySelector('button[type="submit"]');
          botao.disabled = true;
          try {
            const r = await api.patch(`/api/solicitacoes/${id}/status`, {
              status: form.status.value,
              comentario: form.comentario.value.trim(),
            });
            if (typeof opcoes.onAtualizado === 'function') opcoes.onAtualizado(r);
            await abrir(id, { ...opcoes, origem: gatilho });
            const nova = dialog.querySelector('#dlg-corpo');
            nova.insertAdjacentHTML('afterbegin', `<p class="mensagem sucesso" role="status">${escapeHtml(r.mensagem)}</p>`);
          } catch (err) {
            mensagem(caixa, 'erro', err.message);
            botao.disabled = false;
          }
        });
      }
    } catch (err) {
      corpo.innerHTML = `<p class="mensagem erro" role="alert">${escapeHtml(err.message)}</p>`;
    }
  }

  window.ISRP.detalhes = { abrir, TRANSICOES };
})();
