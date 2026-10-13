/**
 * Rotas de solicitações: criação, listagem, detalhes, histórico e alteração de status.
 * Base: /api/solicitacoes  (todas exigem autenticação)
 */
const express = require('express');
const { query, transaction } = require('../db');
const { exigirLogin, exigirAdmin } = require('../middleware/auth');
const {
  HttpError, asyncHandler, texto, idValido, STATUS, PRIORIDADES, TRANSICOES,
} = require('../utils');

const router = express.Router();
router.use(exigirLogin);

const SQL_BASE = `
  SELECT s.id, s.protocolo, s.titulo, s.descricao, s.categoria, s.prioridade, s.status,
         s.criado_em, s.atualizado_em, s.usuario_id, s.servico_id,
         u.nome AS solicitante, sv.nome AS servico_nome, sv.prazo_horas,
         st.id AS setor_id, st.nome AS setor_nome, st.sigla AS setor_sigla
    FROM solicitacoes s
    JOIN usuarios u       ON u.id = s.usuario_id
    LEFT JOIN servicos sv ON sv.id = s.servico_id
    LEFT JOIN setores st  ON st.id = sv.setor_id`;

const ehAdmin = (req) => req.session.usuario.perfil === 'admin';

/** Busca a solicitação e verifica se o usuário pode acessá-la (dono ou admin). */
async function carregarComPermissao(req, id) {
  const rows = await query(SQL_BASE + ' WHERE s.id = ?', [id]);
  const sol = rows[0];
  if (!sol) throw new HttpError(404, 'Solicitação não encontrada.');
  if (!ehAdmin(req) && sol.usuario_id !== req.session.usuario.id) {
    throw new HttpError(403, 'Você não tem permissão para acessar esta solicitação.');
  }
  return sol;
}

// GET /api/solicitacoes?status=&prioridade=&busca=&minhas=1
router.get('/', asyncHandler(async (req, res) => {
  const where = [];
  const params = [];

  // Usuário comum só enxerga as próprias solicitações (regra aplicada no servidor)
  if (!ehAdmin(req) || req.query.minhas === '1') {
    where.push('s.usuario_id = ?');
    params.push(req.session.usuario.id);
  }
  if (req.query.status) {
    if (!STATUS.includes(req.query.status)) throw new HttpError(400, 'Filtro de status inválido.');
    where.push('s.status = ?');
    params.push(req.query.status);
  }
  if (req.query.prioridade) {
    if (!PRIORIDADES.includes(req.query.prioridade)) throw new HttpError(400, 'Filtro de prioridade inválido.');
    where.push('s.prioridade = ?');
    params.push(req.query.prioridade);
  }
  const busca = texto(req.query.busca);
  if (busca) {
    where.push('(s.titulo LIKE ? OR s.protocolo LIKE ?)');
    params.push(`%${busca}%`, `%${busca}%`);
  }

  const sql = SQL_BASE + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY s.criado_em DESC, s.id DESC';
  res.json(await query(sql, params));
}));

// POST /api/solicitacoes  { titulo, descricao, categoria, prioridade, servico_id? }
router.post('/', asyncHandler(async (req, res) => {
  const titulo = texto(req.body.titulo);
  const descricao = texto(req.body.descricao);
  let categoria = texto(req.body.categoria);
  const prioridade = texto(req.body.prioridade) || 'Média';
  const servicoId = req.body.servico_id ? Number(req.body.servico_id) : null;

  const erros = {};
  // DEFEITO CONTROLADO DEF-01 (Opção 1): Validação incompleta de campos obrigatórios (permite descrição vazia ou insuficiente)
  if (descricao.length > 5000) erros.descricao = 'A descrição não pode exceder 5000 caracteres.';
  if (!PRIORIDADES.includes(prioridade)) erros.prioridade = 'Prioridade inválida.';

  if (servicoId !== null) {
    if (!Number.isInteger(servicoId) || servicoId <= 0) {
      erros.servico_id = 'Serviço inválido.';
    } else {
      const sv = await query('SELECT categoria FROM servicos WHERE id = ? AND ativo = 1', [servicoId]);
      if (!sv.length) erros.servico_id = 'Serviço não encontrado.';
      else if (!categoria) categoria = sv[0].categoria;
    }
  }
  if (!categoria || categoria.length > 60) erros.categoria = 'Selecione uma categoria.';
  if (Object.keys(erros).length) throw new HttpError(400, 'Verifique os campos destacados.', erros);

  const usuarioId = req.session.usuario.id;
  const id = await transaction(async (conn) => {
    const [r] = await conn.execute(
      `INSERT INTO solicitacoes (titulo, descricao, categoria, prioridade, status, usuario_id, servico_id)
       VALUES (?, ?, ?, ?, 'Aberta', ?, ?)`,
      [titulo, descricao, categoria, prioridade, usuarioId, servicoId]
    );
    await conn.execute(
      `UPDATE solicitacoes SET protocolo = CONCAT('ISRP-', YEAR(criado_em), '-', LPAD(id, 5, '0')) WHERE id = ?`,
      [r.insertId]
    );
    await conn.execute(
      `INSERT INTO historico_solicitacoes (solicitacao_id, usuario_id, status_anterior, status_novo, comentario)
       VALUES (?, ?, NULL, 'Aberta', 'Solicitação registrada pelo usuário.')`,
      [r.insertId, usuarioId]
    );
    return r.insertId;
  });

  const [nova] = await query(SQL_BASE + ' WHERE s.id = ?', [id]);
  res.status(201).json({ mensagem: `Solicitação ${nova.protocolo} registrada com sucesso.`, solicitacao: nova });
}));

// GET /api/solicitacoes/:id
router.get('/:id', asyncHandler(async (req, res) => {
  res.json(await carregarComPermissao(req, idValido(req.params.id)));
}));

// GET /api/solicitacoes/:id/historico
router.get('/:id/historico', asyncHandler(async (req, res) => {
  const id = idValido(req.params.id);
  await carregarComPermissao(req, id);
  const rows = await query(
    `SELECT h.id, h.status_anterior, h.status_novo, h.comentario, h.criado_em,
            u.nome AS responsavel, u.perfil AS responsavel_perfil
       FROM historico_solicitacoes h
       JOIN usuarios u ON u.id = h.usuario_id
      WHERE h.solicitacao_id = ?
      ORDER BY h.criado_em ASC, h.id ASC`,
    [id]
  );
  res.json(rows);
}));

// PATCH /api/solicitacoes/:id/status  { status, comentario? }  (somente admin)
router.patch('/:id/status', exigirAdmin, asyncHandler(async (req, res) => {
  const id = idValido(req.params.id);
  const novo = texto(req.body.status);
  const comentario = texto(req.body.comentario);

  if (!STATUS.includes(novo)) throw new HttpError(400, `Status inválido. Valores aceitos: ${STATUS.join(', ')}.`);
  if (comentario.length > 500) throw new HttpError(400, 'O comentário deve ter no máximo 500 caracteres.');

  await transaction(async (conn) => {
    const [rows] = await conn.execute('SELECT status FROM solicitacoes WHERE id = ? FOR UPDATE', [id]);
    if (!rows.length) throw new HttpError(404, 'Solicitação não encontrada.');
    const atual = rows[0].status;
    if (atual === novo) throw new HttpError(409, `A solicitação já está com o status "${novo}".`);
    if (!TRANSICOES[atual].includes(novo)) {
      throw new HttpError(409, `Transição não permitida: "${atual}" → "${novo}".`);
    }
    await conn.execute('UPDATE solicitacoes SET status = ? WHERE id = ?', [novo, id]);
    await conn.execute(
      `INSERT INTO historico_solicitacoes (solicitacao_id, usuario_id, status_anterior, status_novo, comentario)
       VALUES (?, ?, ?, ?, ?)`,
      [id, req.session.usuario.id, atual, novo, comentario || null]
    );
  });

  const [atualizada] = await query(SQL_BASE + ' WHERE s.id = ?', [id]);
  res.json({ mensagem: `Status alterado para "${novo}".`, solicitacao: atualizada });
}));

module.exports = router;
