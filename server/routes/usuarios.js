/**
 * Rotas de usuários: cadastro público, perfil do usuário logado e listagem (admin).
 * Base: /api/usuarios
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { exigirLogin, exigirAdmin } = require('../middleware/auth');
const { HttpError, asyncHandler, texto, REGEX_EMAIL, REGEX_USUARIO } = require('../utils');

const router = express.Router();

/** Valida os dados do formulário de cadastro e devolve a lista de erros por campo. */
function validarCadastro({ nome, email, usuario, senha, confirmacao }) {
  const erros = {};
  if (nome.length < 3 || nome.length > 120) erros.nome = 'Informe o nome completo (3 a 120 caracteres).';
  if (!REGEX_EMAIL.test(email) || email.length > 160) erros.email = 'Informe um e-mail válido.';
  if (!REGEX_USUARIO.test(usuario)) {
    erros.usuario = 'Use de 3 a 40 caracteres: letras, números, ponto, hífen ou sublinhado.';
  }
  if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
    erros.senha = 'A senha deve ter ao menos 8 caracteres, com letras e números.';
  }
  if (senha !== confirmacao) erros.confirmacao = 'A confirmação não confere com a senha.';
  return erros;
}

// POST /api/usuarios  -> cadastro de novo usuário (perfil "usuario")
router.post('/', asyncHandler(async (req, res) => {
  const dados = {
    nome: texto(req.body.nome),
    email: texto(req.body.email).toLowerCase(),
    usuario: texto(req.body.usuario),
    senha: typeof req.body.senha === 'string' ? req.body.senha : '',
    confirmacao: typeof req.body.confirmacao === 'string' ? req.body.confirmacao : '',
  };

  const erros = validarCadastro(dados);
  if (Object.keys(erros).length) throw new HttpError(400, 'Verifique os campos destacados.', erros);

  const existentes = await query(
    'SELECT email, usuario FROM usuarios WHERE email = ? OR usuario = ?',
    [dados.email, dados.usuario]
  );
  if (existentes.length) {
    const conflitos = {};
    existentes.forEach((u) => {
      if (u.email === dados.email) conflitos.email = 'E-mail já cadastrado.';
      if (u.usuario.toLowerCase() === dados.usuario.toLowerCase()) conflitos.usuario = 'Nome de usuário indisponível.';
    });
    throw new HttpError(409, 'Já existe cadastro com estes dados.', conflitos);
  }

  const hash = await bcrypt.hash(dados.senha, 10);
  const result = await query(
    'INSERT INTO usuarios (nome, email, usuario, senha_hash, perfil) VALUES (?, ?, ?, ?, ?)',
    [dados.nome, dados.email, dados.usuario, hash, 'usuario']
  );

  res.status(201).json({
    mensagem: 'Cadastro realizado com sucesso. Faça login para continuar.',
    usuario: { id: result.insertId, nome: dados.nome, email: dados.email, usuario: dados.usuario, perfil: 'usuario' },
  });
}));

// GET /api/usuarios/me  -> dados do usuário autenticado
router.get('/me', exigirLogin, asyncHandler(async (req, res) => {
  const rows = await query(
    'SELECT id, nome, email, usuario, perfil, criado_em, ultimo_login FROM usuarios WHERE id = ?',
    [req.session.usuario.id]
  );
  if (!rows.length) throw new HttpError(404, 'Usuário não encontrado.');
  res.json(rows[0]);
}));

// GET /api/usuarios  -> lista de usuários (somente admin)
router.get('/', exigirAdmin, asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT u.id, u.nome, u.email, u.usuario, u.perfil, u.ativo, u.criado_em,
            COUNT(s.id) AS total_solicitacoes
       FROM usuarios u
       LEFT JOIN solicitacoes s ON s.usuario_id = u.id
      GROUP BY u.id
      ORDER BY u.nome`
  );
  res.json(rows);
}));

module.exports = router;
