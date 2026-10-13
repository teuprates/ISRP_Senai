/**
 * Rotas de autenticação: login, logout e consulta da sessão atual.
 * Base: /api/auth
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { HttpError, asyncHandler, texto } = require('../utils');

const router = express.Router();

// POST /api/auth/login  { login: "usuario ou e-mail", senha }
router.post('/login', asyncHandler(async (req, res) => {
  const login = texto(req.body.login);
  const senha = typeof req.body.senha === 'string' ? req.body.senha : '';

  if (!login || !senha) {
    throw new HttpError(400, 'Informe o usuário (ou e-mail) e a senha.');
  }

  const rows = await query(
    `SELECT id, nome, email, usuario, senha_hash, perfil, ativo
       FROM usuarios
      WHERE usuario = ? OR email = ?
      LIMIT 1`,
    [login, login.toLowerCase()]
  );
  const usuario = rows[0];

  // Mensagem genérica para não revelar se o usuário existe
  const senhaOk = usuario ? await bcrypt.compare(senha, usuario.senha_hash) : false;
  if (!usuario || !senhaOk) throw new HttpError(401, 'Usuário ou senha inválidos.');
  if (!usuario.ativo) throw new HttpError(403, 'Usuário inativo. Procure o administrador.');

  // Regenera a sessão para evitar fixação de sessão
  await new Promise((resolve, reject) => req.session.regenerate((err) => (err ? reject(err) : resolve())));
  req.session.usuario = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    usuario: usuario.usuario,
    perfil: usuario.perfil,
  };
  await query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?', [usuario.id]);

  res.json({ mensagem: `Bem-vindo(a), ${usuario.nome}!`, usuario: req.session.usuario });
}));

// POST /api/auth/logout
router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('isrp.sid');
    res.json({ mensagem: 'Sessão encerrada com sucesso.' });
  });
});

// GET /api/auth/sessao  -> informa se há usuário logado (não exige login)
router.get('/sessao', (req, res) => {
  const usuario = req.session && req.session.usuario;
  res.json({ autenticado: Boolean(usuario), usuario: usuario || null });
});

module.exports = router;
