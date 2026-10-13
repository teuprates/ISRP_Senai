/**
 * Rotas públicas de setores e serviços.
 * Base: /api/setores  e  /api/servicos
 */
const express = require('express');
const { query } = require('../db');
const { HttpError, asyncHandler, idValido } = require('../utils');

const setores = express.Router();
const servicos = express.Router();

const SQL_SERVICOS = `
  SELECT sv.id, sv.nome, sv.descricao, sv.categoria, sv.prazo_horas, sv.icone,
         st.id AS setor_id, st.nome AS setor_nome, st.sigla AS setor_sigla
    FROM servicos sv
    JOIN setores st ON st.id = sv.setor_id
   WHERE sv.ativo = 1`;

/** Converte a coluna texto "a;b;c" em array. */
const listaResponsabilidades = (s) => s.responsabilidades.split(';').map((r) => r.trim()).filter(Boolean);

// GET /api/setores  -> setores com seus serviços
setores.get('/', asyncHandler(async (req, res) => {
  const [lista, svs] = await Promise.all([
    query('SELECT * FROM setores ORDER BY nome'),
    query(SQL_SERVICOS + ' ORDER BY sv.nome'),
  ]);
  res.json(lista.map((s) => ({
    ...s,
    responsabilidades: listaResponsabilidades(s),
    servicos: svs.filter((v) => v.setor_id === s.id).map(({ id, nome, prazo_horas }) => ({ id, nome, prazo_horas })),
  })));
}));

// GET /api/setores/:id
setores.get('/:id', asyncHandler(async (req, res) => {
  const id = idValido(req.params.id);
  const rows = await query('SELECT * FROM setores WHERE id = ?', [id]);
  if (!rows.length) throw new HttpError(404, 'Setor não encontrado.');
  const svs = await query(SQL_SERVICOS + ' AND sv.setor_id = ? ORDER BY sv.nome', [id]);
  res.json({ ...rows[0], responsabilidades: listaResponsabilidades(rows[0]), servicos: svs });
}));

// GET /api/servicos?categoria=
servicos.get('/', asyncHandler(async (req, res) => {
  const categoria = typeof req.query.categoria === 'string' ? req.query.categoria.trim() : '';
  const rows = categoria
    ? await query(SQL_SERVICOS + ' AND sv.categoria = ? ORDER BY sv.nome', [categoria])
    : await query(SQL_SERVICOS + ' ORDER BY sv.nome');
  res.json(rows);
}));

// GET /api/servicos/:id
servicos.get('/:id', asyncHandler(async (req, res) => {
  const id = idValido(req.params.id);
  const rows = await query(SQL_SERVICOS + ' AND sv.id = ?', [id]);
  if (!rows.length) throw new HttpError(404, 'Serviço não encontrado.');
  res.json(rows[0]);
}));

module.exports = { setores, servicos };
