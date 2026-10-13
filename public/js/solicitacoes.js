/**
 * ISRP - gerenciamento da página de solicitações do usuário comum.
 * Listagem, filtros dinâmicos, exibição do formulário e detalhes/histórico.
 */
(function () {
  'use strict';
  const { api, escapeHtml, badgeStatus, badgePrioridade, formatarData, mensagem, limparMensagem, errosCampos, limparErrosCampos, parametro } = window.ISRP;

  let servicosDisponiveis = [];

  async function carregarServicosForm() {
    const select = document.getElementById('servico_id');
    try {
      servicosDisponiveis = await api.get('/api/servicos');
      servicosDisponiveis.forEach((s) => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.nome} (${s.setor_sigla})`;
        select.appendChild(opt);
      });
    } catch (e) {
      console.error('Erro ao carregar serviços para o select:', e);
    }
  }

  function preencherServicoPreSelecionado() {
    const servicoId = parametro('servico');
    if (servicoId) {
      const select = document.getElementById('servico_id');
      select.value = servicoId;
      const servico = servicosDisponiveis.find((s) => String(s.id) === String(servicoId));
      if (servico) {
        document.getElementById('categoria').value = servico.categoria;
        document.getElementById('dica-setor').textContent = `Setor: ${servico.setor_nome} (${servico.setor_sigla}) · Prazo estimado: até ${servico.prazo_horas}h`;
      }
      mostrarFormNova(true);
    }
  }

  function configurarSelectServico() {
    const select = document.getElementById('servico_id');
    const categoria = document.getElementById('categoria');
    const dica = document.getElementById('dica-setor');

    select.addEventListener('change', () => {
      const id = select.value;
      if (!id) {
        dica.textContent = 'O setor responsável será definido pelo serviço.';
        return;
      }
      const s = servicosDisponiveis.find((sv) => String(sv.id) === String(id));
      if (s) {
        categoria.value = s.categoria;
        dica.textContent = `Setor: ${s.setor_nome} (${s.setor_sigla}) · Prazo estimado: até ${s.prazo_horas}h`;
      }
    });
  }

  function mostrarFormNova(exibir) {
    const secao = document.getElementById('nova');
    const btn = document.getElementById('btn-nova');
    if (!secao || !btn) return;
    secao.hidden = !exibir;
    btn.setAttribute('aria-expanded', String(exibir));
    if (exibir) {
      secao.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('titulo').focus();
    }
  }

  async function carregarSolicitacoes() {
    const tbody = document.getElementById('tabela-solicitacoes');
    tbody.innerHTML = '<tr><td colspan="7" class="vazio">Carregando solicitações...</td></tr>';

    const busca = document.getElementById('filtro-busca').value.trim();
    const status = document.getElementById('filtro-status').value;
    const prioridade = document.getElementById('filtro-prioridade').value;

    const params = new URLSearchParams();
    if (busca) params.append('busca', busca);
    if (status) params.append('status', status);
    if (prioridade) params.append('prioridade', prioridade);

    try {
      const lista = await api.get('/api/solicitacoes?' + params.toString());
      if (!lista.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="vazio">Nenhuma solicitação encontrada.</td></tr>';
        return;
      }

      tbody.innerHTML = lista.map((s) => `
        <tr>
          <td class="protocolo" data-rotulo="Protocolo">${escapeHtml(s.protocolo)}</td>
          <td class="titulo-col" data-rotulo="Título"><strong>${escapeHtml(s.titulo)}</strong></td>
          <td data-rotulo="Serviço / Setor">${escapeHtml(s.servico_nome || '—')}<span class="sub">${escapeHtml(s.setor_sigla || s.categoria)}</span></td>
          <td data-rotulo="Prioridade">${badgePrioridade(s.prioridade)}</td>
          <td data-rotulo="Status">${badgeStatus(s.status)}</td>
          <td data-rotulo="Aberta em">${formatarData(s.criado_em)}</td>
          <td data-rotulo="Ações">
            <button type="button" class="btn btn-secundario btn-pequeno btn-ver-detalhes" data-id="${s.id}">Ver detalhes</button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('.btn-ver-detalhes').forEach((btn) => {
        btn.addEventListener('click', () => {
          window.ISRP.detalhes.abrir(Number(btn.dataset.id), {
            admin: false,
            origem: btn,
            onAtualizado: () => carregarSolicitacoes()
          });
        });
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" class="mensagem erro" role="alert">${escapeHtml(err.message)}</td></tr>`;
    }
  }

  function configurarEventos() {
    const btnNova = document.getElementById('btn-nova');
    const btnCancelar = document.getElementById('btn-cancelar');
    const formNova = document.getElementById('form-nova');
    const formFiltros = document.getElementById('form-filtros');
    const msgNova = document.getElementById('mensagem-nova');
    const btnEnviar = document.getElementById('btn-enviar');

    btnNova.addEventListener('click', () => {
      const visivel = !document.getElementById('nova').hidden;
      mostrarFormNova(!visivel);
    });

    btnCancelar.addEventListener('click', () => {
      formNova.reset();
      limparMensagem(msgNova);
      limparErrosCampos(formNova);
      mostrarFormNova(false);
    });

    formFiltros.addEventListener('submit', (e) => {
      e.preventDefault();
      carregarSolicitacoes();
    });

    formNova.addEventListener('submit', async (e) => {
      e.preventDefault();
      limparMensagem(msgNova);
      limparErrosCampos(formNova);

      const dados = {
        titulo: formNova.titulo.value.trim(),
        descricao: formNova.descricao.value.trim(),
        categoria: formNova.categoria.value,
        prioridade: formNova.prioridade.value,
        servico_id: formNova.servico_id.value ? Number(formNova.servico_id.value) : null,
      };

      btnEnviar.disabled = true;
      btnEnviar.textContent = 'Enviando...';

      try {
        const r = await api.post('/api/solicitacoes', dados);
        mensagem(document.getElementById('mensagem-pagina'), 'sucesso', r.mensagem);
        formNova.reset();
        mostrarFormNova(false);
        await carregarSolicitacoes();
      } catch (err) {
        mensagem(msgNova, 'erro', err.message);
        errosCampos(formNova, err.detalhes);
      } finally {
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Registrar solicitação';
      }
    });

    if (window.location.hash === '#nova') {
      mostrarFormNova(true);
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    configurarEventos();
    await carregarServicosForm();
    configurarSelectServico();
    preencherServicoPreSelecionado();
    carregarSolicitacoes();
  });
})();
