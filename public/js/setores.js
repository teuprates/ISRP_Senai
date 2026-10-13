/** ISRP - lista de setores com responsabilidades e serviços atendidos (dados da API). */
(function () {
  'use strict';
  const { api, escapeHtml, icone } = window.ISRP;

  document.addEventListener('DOMContentLoaded', async () => {
    const alvo = document.getElementById('lista-setores');
    try {
      const setores = await api.get('/api/setores');
      alvo.innerHTML = setores.map((s) => `
        <article class="card card-setor" aria-labelledby="setor-${s.id}">
          <div class="card-setor-topo">
            <span class="icone-caixa">${icone('setor')}</span>
            <div>
              <span class="sigla">${escapeHtml(s.sigla)}</span>
              <h2 id="setor-${s.id}">${escapeHtml(s.nome)}</h2>
            </div>
          </div>
          <p>${escapeHtml(s.descricao)}</p>
          <div>
            <h3>Responsabilidades</h3>
            <ul>${s.responsabilidades.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
          </div>
          <div>
            <h3>Serviços atendidos</h3>
            <ul class="servicos-setor">
              ${s.servicos.length
                ? s.servicos.map((v) => `<li><a href="/solicitacoes.html?servico=${v.id}#nova">${escapeHtml(v.nome)} · ${v.prazo_horas} h</a></li>`).join('')
                : '<li>Nenhum serviço vinculado.</li>'}
            </ul>
          </div>
          <div class="contato-setor">
            <span><strong>E-mail (fictício):</strong> ${escapeHtml(s.email_contato)}</span>
            <span><strong>Ramal:</strong> ${escapeHtml(s.ramal || '—')} · <strong>Horário:</strong> ${escapeHtml(s.horario)}</span>
          </div>
        </article>`).join('');
    } catch (err) {
      alvo.innerHTML = `<p class="mensagem erro" role="alert">${escapeHtml(err.message)}</p>`;
    }
  });
})();
