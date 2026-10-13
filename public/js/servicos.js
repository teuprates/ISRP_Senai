/** ISRP - catálogo de serviços carregado da API, com filtro por categoria. */
(function () {
  'use strict';
  const { api, escapeHtml, icone } = window.ISRP;
  let servicos = [];

  function render(categoria) {
    const lista = document.getElementById('lista-servicos');
    const filtrados = categoria ? servicos.filter((s) => s.categoria === categoria) : servicos;
    document.getElementById('contador').textContent =
      `${filtrados.length} serviço(s) ${categoria ? 'na categoria ' + categoria : 'disponível(is)'}.`;
    lista.innerHTML = filtrados.map((s) => `
      <article class="card card-servico" aria-labelledby="servico-${s.id}">
        <div class="card-servico-topo">
          <span class="icone-caixa">${icone(s.icone)}</span>
          <div>
            <span class="categoria">${escapeHtml(s.categoria)}</span>
            <h2 id="servico-${s.id}">${escapeHtml(s.nome)}</h2>
          </div>
        </div>
        <p>${escapeHtml(s.descricao)}</p>
        <ul class="meta-servico">
          <li>${icone('setor')}<span><strong>Setor responsável:</strong> ${escapeHtml(s.setor_nome)} (${escapeHtml(s.setor_sigla)})</span></li>
          <li>${icone('relogio')}<span><strong>Prazo de atendimento:</strong> até ${s.prazo_horas} h</span></li>
        </ul>
        <a class="btn btn-primario" href="/solicitacoes.html?servico=${s.id}#nova"
           aria-label="Abrir solicitação de ${escapeHtml(s.nome)}">Abrir solicitação</a>
      </article>`).join('') || '<p class="vazio">Nenhum serviço encontrado.</p>';
  }

  function montarFiltros() {
    const caixa = document.getElementById('filtros');
    const categorias = [...new Set(servicos.map((s) => s.categoria))].sort();
    caixa.innerHTML = ['', ...categorias].map((c) =>
      `<button type="button" class="filtro" data-categoria="${escapeHtml(c)}" aria-pressed="${c === ''}">${c ? escapeHtml(c) : 'Todos'}</button>`
    ).join('');
    caixa.addEventListener('click', (e) => {
      const btn = e.target.closest('.filtro');
      if (!btn) return;
      caixa.querySelectorAll('.filtro').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      render(btn.dataset.categoria);
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      servicos = await api.get('/api/servicos');
      montarFiltros();
      render('');
    } catch (err) {
      document.getElementById('lista-servicos').innerHTML =
        `<p class="mensagem erro" role="alert">${escapeHtml(err.message)}</p>`;
    }
  });
})();
