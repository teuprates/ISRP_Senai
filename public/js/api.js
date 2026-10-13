/**
 * ISRP - módulo compartilhado do frontend (JavaScript puro).
 * - Cliente HTTP para a API (fetch + JSON + tratamento de erros)
 * - Estado da sessão e cabeçalho (menu, usuário logado, logout)
 * - Utilitários de interface: mensagens, erros de campo, badges, datas
 */
(function () {
  'use strict';

  class ApiError extends Error {
    constructor(status, mensagem, detalhes) {
      super(mensagem);
      this.status = status;
      this.detalhes = detalhes || null;
    }
  }

  async function request(method, url, body) {
    const opts = { method, credentials: 'same-origin', headers: { Accept: 'application/json' } };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    let res;
    try {
      res = await fetch(url, opts);
    } catch (e) {
      throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique se o ISRP está em execução.');
    }
    let data = null;
    try { data = await res.json(); } catch (e) { /* resposta sem JSON */ }
    if (!res.ok) {
      throw new ApiError(res.status, (data && data.erro) || `Erro ${res.status}`, data && data.detalhes);
    }
    return data;
  }

  const api = {
    get: (url) => request('GET', url),
    post: (url, body) => request('POST', url, body || {}),
    patch: (url, body) => request('PATCH', url, body || {}),
  };

  // ---------------- Utilitários ----------------
  const escapeHtml = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const slug = (v) => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-');

  const badgeStatus = (status) => `<span class="badge status-${slug(status)}">${escapeHtml(status)}</span>`;
  const badgePrioridade = (p) => `<span class="badge prioridade-${slug(p)}" title="Prioridade ${escapeHtml(p)}">${escapeHtml(p)}</span>`;

  const formatarData = (iso, comHora = true) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return comHora
      ? d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
      : d.toLocaleDateString('pt-BR');
  };

  const icone = (nome, classe = 'icone') =>
    `<svg class="${classe}" aria-hidden="true" focusable="false"><use href="/img/icones.svg#${escapeHtml(nome)}"></use></svg>`;

  /** Exibe mensagem acessível (role/aria-live definidos no HTML). */
  function mensagem(el, tipo, texto) {
    if (!el) return;
    el.className = 'mensagem ' + tipo;
    el.textContent = texto;
    if (tipo === 'erro' || tipo === 'sucesso') el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function limparMensagem(el) { if (el) { el.className = 'mensagem'; el.textContent = ''; } }

  /** Marca campos inválidos de um formulário a partir de { campo: "mensagem" }. */
  function errosCampos(form, detalhes) {
    limparErrosCampos(form);
    if (!detalhes) return;
    let primeiro = null;
    Object.entries(detalhes).forEach(([nome, msg]) => {
      const campo = form.elements[nome];
      if (!campo) return;
      const id = 'erro-' + nome;
      campo.setAttribute('aria-invalid', 'true');
      campo.setAttribute('aria-describedby', ((campo.getAttribute('aria-describedby') || '') + ' ' + id).trim());
      const p = document.createElement('p');
      p.className = 'erro-campo';
      p.id = id;
      p.textContent = msg;
      campo.insertAdjacentElement('afterend', p);
      if (!primeiro) primeiro = campo;
    });
    if (primeiro) primeiro.focus();
  }
  function limparErrosCampos(form) {
    form.querySelectorAll('.erro-campo').forEach((p) => {
      const campo = form.querySelector(`[aria-describedby~="${p.id}"]`);
      if (campo) {
        campo.removeAttribute('aria-invalid');
        const resto = campo.getAttribute('aria-describedby').split(' ').filter((x) => x !== p.id).join(' ');
        if (resto) campo.setAttribute('aria-describedby', resto); else campo.removeAttribute('aria-describedby');
      }
      p.remove();
    });
  }

  const parametro = (nome) => new URLSearchParams(window.location.search).get(nome);

  /** Aceita apenas redirecionamentos internos (evita open redirect). */
  const destinoSeguro = (url, padrao) => (url && /^\/(?!\/)[\w\-./?=&#%]*$/.test(url) ? url : padrao);

  // ---------------- Sessão e cabeçalho ----------------
  let sessaoPromise = null;
  const sessao = (forcar = false) => {
    if (!sessaoPromise || forcar) {
      sessaoPromise = api.get('/api/auth/sessao').catch(() => ({ autenticado: false, usuario: null }));
    }
    return sessaoPromise;
  };

  async function sair() {
    try { await api.post('/api/auth/logout'); } finally { window.location.href = '/home.html?saiu=1'; }
  }

  function marcarPaginaAtual() {
    const atual = window.location.pathname === '/' ? '/home.html' : window.location.pathname;
    document.querySelectorAll('#menu-principal ul a').forEach((a) => {
      if (a.getAttribute('href') === atual) a.setAttribute('aria-current', 'page');
    });
  }

  function configurarMenuMobile() {
    const botao = document.querySelector('.menu-toggle');
    const menu = document.getElementById('menu-principal');
    if (!botao || !menu) return;
    botao.addEventListener('click', () => {
      const aberto = menu.classList.toggle('aberto');
      botao.setAttribute('aria-expanded', String(aberto));
    });
  }

  async function montarCabecalho() {
    marcarPaginaAtual();
    configurarMenuMobile();
    const area = document.getElementById('area-usuario');
    const { usuario } = await sessao();
    document.querySelectorAll('[data-requer-admin]').forEach((el) => { el.hidden = !(usuario && usuario.perfil === 'admin'); });
    if (!area) return;
    if (usuario) {
      const primeiroNome = usuario.nome.split(' ')[0];
      area.innerHTML = `<span class="ola">Olá, <strong>${escapeHtml(primeiroNome)}</strong>${usuario.perfil === 'admin' ? ' (admin)' : ''}</span>
        <button type="button" class="btn btn-contorno-claro btn-pequeno" id="btn-sair">Sair</button>`;
      document.getElementById('btn-sair').addEventListener('click', sair);
    } else {
      area.innerHTML = `<a class="btn btn-claro btn-pequeno" href="/login.html">Entrar</a>
        <a class="btn btn-contorno-claro btn-pequeno" href="/cadastro.html">Cadastrar-se</a>`;
    }
  }

  document.addEventListener('DOMContentLoaded', montarCabecalho);

  window.ISRP = {
    api, ApiError, sessao, sair, escapeHtml, slug, badgeStatus, badgePrioridade, formatarData,
    icone, mensagem, limparMensagem, errosCampos, limparErrosCampos, parametro, destinoSeguro,
  };
})();
