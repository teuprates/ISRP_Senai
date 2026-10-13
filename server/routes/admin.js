/**
 * Rotas administrativas: indicadores do painel.
 * Base: /api/admin  (todas exigem perfil administrador)
 */
const express = require('express');
const { query } = require('../db');
const { exigirAdmin } = require('../middleware/auth');
const { asyncHandler, STATUS, PRIORIDADES } = require('../utils');

const router = express.Router();
router.use(exigirAdmin);

// GET /api/admin/indicadores
router.get('/indicadores', asyncHandler(async (req, res) => {
  const [porStatus, porPrioridade, porSetor, [totais], [sla], [tempo]] = await Promise.all([
    query('SELECT status, COUNT(*) AS total FROM solicitacoes GROUP BY status'),
    query('SELECT prioridade, COUNT(*) AS total FROM solicitacoes GROUP BY prioridade'),
    query(
      `SELECT st.sigla, st.nome, COUNT(s.id) AS total,
              SUM(s.status IN ('Aberta','Em atendimento')) AS pendentes
         FROM setores st
         LEFT JOIN servicos sv ON sv.setor_id = st.id
         LEFT JOIN solicitacoes s ON s.servico_id = sv.id
        GROUP BY st.id
        ORDER BY total DESC, st.nome`
    ),
    query(
      `SELECT (SELECT COUNT(*) FROM solicitacoes) AS solicitacoes,
              (SELECT COUNT(*) FROM usuarios) AS usuarios,
              (SELECT COUNT(*) FROM solicitacoes WHERE DATE(criado_em) = CURDATE()) AS abertas_hoje`
    ),
    // SLA vencido: pendentes cujo prazo do serviço já expirou
    query(
      `SELECT COUNT(*) AS vencidas
         FROM solicitacoes s
         JOIN servicos sv ON sv.id = s.servico_id
        WHERE s.status IN ('Aberta','Em atendimento')
          AND s.criado_em + INTERVAL sv.prazo_horas HOUR < NOW()`
    ),
    // Tempo médio (h) entre abertura e primeira resolução
    query(
      `SELECT ROUND(AVG(TIMESTAMPDIFF(MINUTE, s.criado_em, r.resolvida_em)) / 60, 1) AS horas
         FROM solicitacoes s
         JOIN (SELECT solicitacao_id, MIN(criado_em) AS resolvida_em
                 FROM historico_solicitacoes
                WHERE status_novo = 'Resolvida'
                GROUP BY solicitacao_id) r ON r.solicitacao_id = s.id`
    ),
  ]);

  // Garante que todos os status/prioridades apareçam, mesmo com zero
  const status = Object.fromEntries(STATUS.map((st) => [st, 0]));
  porStatus.forEach((r) => { status[r.status] = Number(r.total); });
  const prioridade = Object.fromEntries(PRIORIDADES.map((p) => [p, 0]));
  porPrioridade.forEach((r) => { prioridade[r.prioridade] = Number(r.total); });

  res.json({
    total_solicitacoes: Number(totais.solicitacoes),
    total_usuarios: Number(totais.usuarios),
    abertas_hoje: Number(totais.abertas_hoje),
    // DEFEITO CONTROLADO DEF-05 (Opção 6): Indicador do painel administrativo apresenta total incorreto
    pendentes: status['Aberta'],
    sla_vencido: Number(sla.vencidas),
    tempo_medio_resolucao_horas: tempo.horas === null ? null : Number(tempo.horas),
    por_status: status,
    por_prioridade: prioridade,
    por_setor: porSetor.map((r) => ({ ...r, total: Number(r.total), pendentes: Number(r.pendentes || 0) })),
  });
}));

module.exports = router;
