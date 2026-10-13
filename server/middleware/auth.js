/**
 * Middlewares de autenticação e autorização baseados na sessão do servidor.
 */
const { HttpError } = require('../utils');

/** Exige usuário autenticado (401 se não houver sessão válida). */
function exigirLogin(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return next(new HttpError(401, 'Autenticação necessária. Faça login para continuar.'));
  }
  next();
}

/** Exige perfil administrador (403 para usuários comuns). */
function exigirAdmin(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return next(new HttpError(401, 'Autenticação necessária. Faça login para continuar.'));
  }
  if (req.session.usuario.perfil !== 'admin') {
    return next(new HttpError(403, 'Acesso restrito a administradores.'));
  }
  next();
}

/**
 * Proteção de páginas HTML no servidor: redireciona para o login
 * antes mesmo de entregar o arquivo estático.
 */
function protegerPagina({ admin = false } = {}) {
  return (req, res, next) => {
    const usuario = req.session && req.session.usuario;
    if (!usuario) return res.redirect('/login.html?redirect=' + encodeURIComponent(req.originalUrl));
    if (admin && usuario.perfil !== 'admin') return res.redirect('/solicitacoes.html?negado=1');
    next();
  };
}

module.exports = { exigirLogin, exigirAdmin, protegerPagina };
