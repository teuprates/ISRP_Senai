/** ISRP - página inicial: resumo de serviços e ações conforme a sessão. */
(function () {
  'use strict';
  const { api, sessao, escapeHtml, icone, mensagem, parametro } = window.ISRP;

  async function carregarServicos() {
    const alvo = document.getElementById('resumo-servicos');
    try {
      const servicos = await api.get('/api/servicos');
      if (!servicos.length) {
        alvo.innerHTML = '<p class="vazio">Nenhum serviço disponível no momento.</p>';
        return;
      }
      alvo.innerHTML = servicos.slice(0, 6).map((s) => `
        <article class="card card-servico">
          <span class="icone-caixa">${icone(s.icone)}</span>
          <h3>${escapeHtml(s.nome)}</h3>
          <p>${escapeHtml(s.descricao)}</p>
          <span class="setor">Setor: ${escapeHtml(s.setor_nome)}</span>
        </article>`).join('');
    } catch (err) {
      alvo.innerHTML = `<p class="mensagem erro" role="alert">${escapeHtml(err.message)}</p>`;
    }
  }

  async function ajustarAcoes() {
    const { usuario } = await sessao();
    if (!usuario) return;
    const acoes = document.getElementById('hero-acoes');
    acoes.innerHTML = `
      <a class="btn btn-claro" href="/solicitacoes.html#nova">Nova solicitação</a>
      <a class="btn btn-contorno-claro" href="/solicitacoes.html">Minhas solicitações</a>
      ${usuario.perfil === 'admin' ? '<a class="btn btn-contorno-claro" href="/admin.html">Painel administrativo</a>' : ''}
      <a class="btn btn-contorno-claro" href="/servicos.html">Consultar serviços</a>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (parametro('saiu') === '1') mensagem(document.getElementById('mensagem-home'), 'info', 'Você saiu do sistema com segurança.');
    carregarServicos();
    ajustarAcoes();
  });
})();
