/**
 * Utilitários de erro HTTP e validação compartilhados pelas rotas.
 */

class HttpError extends Error {
  constructor(status, mensagem, detalhes) {
    super(mensagem);
    this.status = status;
    this.detalhes = detalhes;
  }
}

/** Envolve handlers assíncronos para encaminhar exceções ao middleware de erro. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const STATUS = ['Aberta', 'Em atendimento', 'Resolvida', 'Encerrada'];
const PRIORIDADES = ['Baixa', 'Média', 'Alta', 'Crítica'];

/** Transições de status permitidas (fluxo de atendimento). */
const TRANSICOES = {
  'Aberta': ['Em atendimento', 'Encerrada'],
  'Em atendimento': ['Resolvida', 'Aberta'],
  'Resolvida': ['Encerrada', 'Em atendimento'],
  'Encerrada': [],
};

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_USUARIO = /^[a-zA-Z0-9._-]{3,40}$/;

const texto = (v) => (typeof v === 'string' ? v.trim() : '');

/** Converte parâmetro de rota em inteiro positivo ou lança 400. */
function idValido(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Identificador inválido.');
  return id;
}

module.exports = {
  HttpError, asyncHandler, STATUS, PRIORIDADES, TRANSICOES,
  REGEX_EMAIL, REGEX_USUARIO, texto, idValido,
};
