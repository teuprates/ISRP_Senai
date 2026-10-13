/**
 * ISRP - Sistema Integrado de Solicitações e Processos
 * Projeto acadêmico fictício (SENAI Serviços Digitais - empresa fictícia).
 * Ponto de entrada do servidor Express.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const session = require('express-session');

const db = require('./server/db');
const { protegerPagina } = require('./server/middleware/auth');
const { HttpError } = require('./server/utils');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const PRODUCAO = process.env.NODE_ENV === 'production';

if (!process.env.SESSION_SECRET) {
  console.warn('[ISRP] SESSION_SECRET não definido no .env — usando valor de desenvolvimento.');
}

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));

// Cabeçalhos básicos de segurança
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});

// Sessão mantida no servidor; o navegador guarda apenas o identificador (cookie httpOnly)
app.use(session({
  name: 'isrp.sid',
  secret: process.env.SESSION_SECRET || 'isrp-dev-secret-nao-usar-em-producao',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: PRODUCAO,
    maxAge: (Number(process.env.SESSION_MAX_AGE_MIN) || 120) * 60 * 1000,
  },
}));

// Log simples de requisições da API (útil como evidência no Hypercare)
app.use('/api', (req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - inicio} ms)`);
  });
  next();
});

// ---------- API ----------
const { setores, servicos } = require('./server/routes/setores');
app.use('/api/auth', require('./server/routes/auth'));
app.use('/api/usuarios', require('./server/routes/usuarios'));
app.use('/api/solicitacoes', require('./server/routes/solicitacoes'));
app.use('/api/admin', require('./server/routes/admin'));
app.use('/api/setores', setores);
app.use('/api/servicos', servicos);

app.get('/api/health', async (req, res) => {
  try {
    await db.ping();
    res.json({ status: 'ok', banco: 'conectado', horario: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'erro', banco: 'indisponível' });
  }
});

app.use('/api', (req, res, next) => next(new HttpError(404, 'Rota não encontrada.')));

// ---------- Páginas ----------
app.get('/solicitacoes.html', protegerPagina());
app.get('/admin.html', protegerPagina({ admin: true }));
app.get('/', (req, res) => res.redirect('/home.html'));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

// ---------- Tratamento uniforme de erros ----------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  const status = err.status || 500;
  if (status >= 500) console.error('[ISRP] Erro interno:', err);
  res.status(status).json({
    erro: status >= 500 ? 'Erro interno do servidor. Tente novamente mais tarde.' : err.message,
    ...(err.detalhes ? { detalhes: err.detalhes } : {}),
  });
});

// ---------- Inicialização ----------
db.ping()
  .then(() => console.log('[ISRP] Conexão com o MySQL estabelecida.'))
  .catch((err) => console.error('[ISRP] ATENÇÃO: não foi possível conectar ao MySQL:', err.code || err.message))
  .finally(() => {
    app.listen(PORT, () => console.log(`[ISRP] Servidor em http://localhost:${PORT}`));
  });
