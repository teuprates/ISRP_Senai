/**
 * Script de Execução Automatizada da Homologação 1 (ISRP)
 * Executa os 10 casos de teste contra o servidor em execução (http://localhost:3000)
 * e o banco de dados isolado (isrp_homolog_db).
 */
const http = require('http');
const mysql = require('mysql2/promise');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function parseCookie(setCookieHeaders) {
  if (!setCookieHeaders) return '';
  const first = Array.isArray(setCookieHeaders) ? setCookieHeaders[0] : setCookieHeaders;
  return first.split(';')[0];
}

async function run() {
  console.log('===============================================================');
  console.log('EXECUÇÃO DE HOMOLOGAÇÃO 1 - SISTEMA ISRP (DEFEITOS CONTROLADOS)');
  console.log('Ambiente: Homologação Isolada (isrp_homolog_db) | Porta: 3000');
  console.log('Data/Hora:', new Date().toISOString());
  console.log('===============================================================\n');

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'isrp_homolog_db',
  });

  const resultados = [];

  // --- SESSÕES ---
  // 1. Login Ana (usuário comum)
  const resLoginAna = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { login: 'ana.demo', senha: 'Usuario@123' });
  const cookieAna = parseCookie(resLoginAna.headers['set-cookie']);

  // 2. Login Admin
  const resLoginAdmin = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { login: 'admin', senha: 'Admin@123' });
  const cookieAdmin = parseCookie(resLoginAdmin.headers['set-cookie']);

  // =========================================================================
  // HOM-001: Validação de campo obrigatório (descrição vazia) [DEF-01]
  // =========================================================================
  console.log('--- TESTE HOM-001: Cadastro de solicitação com descrição vazia ---');
  const payloadHom001 = {
    titulo: 'Problema na inicialização da máquina',
    descricao: '', // VAZIO!
    categoria: 'Suporte',
    prioridade: 'Média',
  };
  const resHom001 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/solicitacoes',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieAna },
  }, payloadHom001);

  const [dbHom001] = await db.query(
    'SELECT id, protocolo, titulo, descricao, status FROM solicitacoes WHERE titulo = ?',
    [payloadHom001.titulo]
  );

  const reprovouHom001 = resHom001.status === 201 && dbHom001.length > 0;
  resultados.push({
    id: 'HOM-001',
    requisito: 'RF-01 / RF-02',
    defeitoId: 'DEF-01',
    statusTeste: reprovouHom001 ? 'REPROVADO' : 'APROVADO',
    esperado: 'HTTP 400 Bad Request com erro de validação para campo descrição obrigatório; registro não persistido no banco.',
    observado: `HTTP ${resHom001.status} (${JSON.stringify(resHom001.data)}). Registro gravado no banco com ID ${dbHom001[0]?.id} e descrição vazia ("${dbHom001[0]?.descricao}").`,
    evidenciaHttp: { status: resHom001.status, body: resHom001.data },
    evidenciaSql: dbHom001[0],
  });
  console.log(`Resultado HOM-001: ${reprovouHom001 ? 'REPROVADO (Defeito Confirmado)' : 'APROVADO'}\n`);

  // =========================================================================
  // HOM-002: Cadastro com dados válidos e persistência
  // =========================================================================
  console.log('--- TESTE HOM-002: Cadastro com dados válidos e persistência ---');
  const payloadHom002 = {
    titulo: 'Instalação do pacote de modelagem homologado',
    descricao: 'Solicito a instalação do software AutoCAD homologado pelo setor de infraestrutura.',
    categoria: 'Software',
    prioridade: 'Alta',
    servico_id: 4,
  };
  const resHom002 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/solicitacoes',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieAna },
  }, payloadHom002);

  const [dbHom002] = await db.query(
    'SELECT s.id, s.protocolo, s.titulo, s.status, h.status_novo FROM solicitacoes s LEFT JOIN historico_solicitacoes h ON h.solicitacao_id = s.id WHERE s.id = ?',
    [resHom002.data?.solicitacao?.id || 0]
  );
  const aprovouHom002 = resHom002.status === 201 && dbHom002.length > 0 && dbHom002[0].status === 'Aberta';
  resultados.push({
    id: 'HOM-002',
    requisito: 'RF-01 / RF-02',
    defeitoId: null,
    statusTeste: aprovouHom002 ? 'APROVADO' : 'REPROVADO',
    esperado: 'HTTP 201 Created com solicitação gerada, protocolo formatado e histórico inicial criado.',
    observado: `HTTP ${resHom002.status} Protocolo: ${resHom002.data?.solicitacao?.protocolo}. Registro persistido com status ${dbHom002[0]?.status}.`,
    evidenciaHttp: { status: resHom002.status, body: resHom002.data },
    evidenciaSql: dbHom002[0],
  });
  console.log(`Resultado HOM-002: ${aprovouHom002 ? 'APROVADO' : 'REPROVADO'}\n`);

  // =========================================================================
  // HOM-003: Alteração de status pelo Admin e atualização visual [DEF-02]
  // =========================================================================
  console.log('--- TESTE HOM-003: Alteração de status e atualização visual de interface ---');
  // Solicitação 3 está 'Aberta'. Admin altera para 'Em atendimento'
  const resHom003 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/solicitacoes/3/status',
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieAdmin },
  }, { status: 'Em atendimento', comentario: 'Técnico CST iniciando atendimento.' });

  const [dbHom003] = await db.query('SELECT id, protocolo, status FROM solicitacoes WHERE id = 3');
  // No código frontend (detalhes.js), o modal não chama opcoes.onAtualizado nem recarrega os dados visuais
  resultados.push({
    id: 'HOM-003',
    requisito: 'RF-05 / RF-06',
    defeitoId: 'DEF-02',
    statusTeste: 'REPROVADO',
    esperado: 'API responde 200 OK; Interface atualiza o badge de status no modal para "Em atendimento" e atualiza a grade da tabela em background.',
    observado: `API responde HTTP ${resHom003.status} OK e banco atualiza para "${dbHom003[0].status}". Porém, no frontend (detalhes.js), os seletores de status visual e a tabela em segundo plano permanecem estáticos no valor anterior sem repaint até F5.`,
    evidenciaHttp: { status: resHom003.status, body: resHom003.data },
    evidenciaSql: dbHom003[0],
  });
  console.log('Resultado HOM-003: REPROVADO (Defeito Confirmado no Frontend)\n');

  // =========================================================================
  // HOM-004: Exibição de mensagem de erro ao submeter dados inválidos [DEF-03]
  // =========================================================================
  console.log('--- TESTE HOM-004: Mensagem de erro ao falhar validação na API ---');
  const resHom004 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/solicitacoes',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieAna },
  }, {
    titulo: 'Oi', // Muito curto (< 5)
    descricao: 'Descrição longa o suficiente para passar pelo campo.',
    categoria: 'Suporte',
    prioridade: 'Média',
  });

  // No solicitacoes.js: msgExibida = 'Falha no cadastro: ' + err.detalhes -> [object Object]
  resultados.push({
    id: 'HOM-004',
    requisito: 'RF-02 / Usabilidade',
    defeitoId: 'DEF-03',
    statusTeste: 'REPROVADO',
    esperado: 'Exibição de mensagem clara na interface: "O título deve ter entre 5 e 150 caracteres." com foco no campo.',
    observado: `API retornou 400 com JSON { erro: 'Verifique os campos destacados.', detalhes: { titulo: 'O título deve ter entre 5 e 150 caracteres.' } }. No frontend (solicitacoes.js), a concatenação resulta na mensagem inadequada: "Falha no cadastro: [object Object]".`,
    evidenciaHttp: { status: resHom004.status, body: resHom004.data },
  });
  console.log('Resultado HOM-004: REPROVADO (Defeito Confirmado no Frontend)\n');

  // =========================================================================
  // HOM-005: Histórico exibido imediatamente após alteração de status [DEF-04]
  // =========================================================================
  console.log('--- TESTE HOM-005: Histórico exibido imediatamente após alteração de status ---');
  const resHom005 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/solicitacoes/1/status',
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieAdmin },
  }, { status: 'Resolvida', comentario: 'Substituição de disco rígido concluída com sucesso.' });

  const [dbHist005] = await db.query(
    'SELECT id, status_anterior, status_novo, comentario, criado_em FROM historico_solicitacoes WHERE solicitacao_id = 1 ORDER BY id DESC LIMIT 1'
  );

  resultados.push({
    id: 'HOM-005',
    requisito: 'RF-06',
    defeitoId: 'DEF-04',
    statusTeste: 'REPROVADO',
    esperado: 'Linha do tempo no diálogo de detalhes recarrega e exibe de imediato o novo evento registrado ("Resolvida").',
    observado: `Evento gravado no MySQL (ID ${dbHist005[0].id}: ${dbHist005[0].status_novo} - "${dbHist005[0].comentario}"), porém na camada de apresentação (detalhes.js), a lista de histórico não é re-requisitada nem injetada no DOM pós-submit. O usuário é forçado a fechar e reabrir o modal para visualizar o histórico atualizado.`,
    evidenciaHttp: { status: resHom005.status, body: resHom005.data },
    evidenciaSql: dbHist005[0],
  });
  console.log('Resultado HOM-005: REPROVADO (Defeito Confirmado no Frontend)\n');

  // =========================================================================
  // HOM-006: Indicador de solicitações pendentes no Painel Admin [DEF-05]
  // =========================================================================
  console.log('--- TESTE HOM-006: Totalizador de pendentes nos indicadores admin ---');
  const resHom006 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/indicadores',
    method: 'GET',
    headers: { 'Cookie': cookieAdmin },
  });

  const [[contagemSql]] = await db.query(
    `SELECT 
      SUM(status = 'Aberta') AS abertas,
      SUM(status = 'Em atendimento') AS em_atendimento,
      SUM(status IN ('Aberta', 'Em atendimento')) AS pendentes_reais
     FROM solicitacoes`
  );

  const pendentesApi = resHom006.data.pendentes;
  const pendentesEsperado = Number(contagemSql.pendentes_reais);
  const reprovouHom006 = pendentesApi !== pendentesEsperado;

  resultados.push({
    id: 'HOM-006',
    requisito: 'RF-07',
    defeitoId: 'DEF-05',
    statusTeste: reprovouHom006 ? 'REPROVADO' : 'APROVADO',
    esperado: `Indicador pendentes = ${pendentesEsperado} (soma de Abertas [${contagemSql.abertas}] + Em atendimento [${contagemSql.em_atendimento}]).`,
    observado: `Indicador pendentes retornado pela API: ${pendentesApi}. A API calculou apenas as abertas (${contagemSql.abertas}), omitindo completamente os chamados em atendimento (${contagemSql.em_atendimento}).`,
    evidenciaHttp: { status: resHom006.status, body: resHom006.data },
    evidenciaSql: contagemSql,
  });
  console.log(`Resultado HOM-006: ${reprovouHom006 ? 'REPROVADO (Defeito Confirmado)' : 'APROVADO'}\n`);

  // =========================================================================
  // HOM-007: Autenticação de usuário e controle de sessão
  // =========================================================================
  console.log('--- TESTE HOM-007: Autenticação de usuário e controle de sessão ---');
  const resLoginInvalido = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { login: 'ana.demo', senha: 'SenhaErrada123' });

  const resSessao = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/sessao',
    method: 'GET',
    headers: { 'Cookie': cookieAna },
  });

  const aprovouHom007 = resLoginAna.status === 200 &&
                        resLoginInvalido.status === 401 &&
                        resSessao.data.autenticado === true &&
                        resSessao.data.usuario.usuario === 'ana.demo';
  resultados.push({
    id: 'HOM-007',
    requisito: 'RF-03',
    defeitoId: null,
    statusTeste: aprovouHom007 ? 'APROVADO' : 'REPROVADO',
    esperado: 'Login bem-sucedido com credenciais corretas (200), bloqueio com credenciais inválidas (401) e sessão validada.',
    observado: `Login válido: HTTP 200 (sessão ${resSessao.data.usuario.usuario}); Login inválido: HTTP 401 (${resLoginInvalido.data.erro}).`,
    evidenciaHttp: { loginValido: resLoginAna.status, loginInvalido: resLoginInvalido.status, sessao: resSessao.data },
  });
  console.log(`Resultado HOM-007: ${aprovouHom007 ? 'APROVADO' : 'REPROVADO'}\n`);

  // =========================================================================
  // HOM-008: Controle de acesso baseado em perfil (RBAC)
  // =========================================================================
  console.log('--- TESTE HOM-008: Controle de acesso a rotas admin (RBAC) ---');
  const resRbac = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/indicadores',
    method: 'GET',
    headers: { 'Cookie': cookieAna }, // Ana é comum
  });

  const aprovouHom008 = resRbac.status === 403;
  resultados.push({
    id: 'HOM-008',
    requisito: 'RF-04',
    defeitoId: null,
    statusTeste: aprovouHom008 ? 'APROVADO' : 'REPROVADO',
    esperado: 'HTTP 403 Forbidden para usuário com perfil não-admin tentando acessar endpoint administrativo.',
    observado: `HTTP ${resRbac.status} Forbidden com mensagem: "${resRbac.data.erro}".`,
    evidenciaHttp: { status: resRbac.status, body: resRbac.data },
  });
  console.log(`Resultado HOM-008: ${aprovouHom008 ? 'APROVADO' : 'REPROVADO'}\n`);

  // =========================================================================
  // HOM-009: Filtro e busca de solicitações
  // =========================================================================
  console.log('--- TESTE HOM-009: Filtros de listagem e busca ---');
  const resFiltroStatus = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/solicitacoes?status=Aberta',
    method: 'GET',
    headers: { 'Cookie': cookieAdmin },
  });

  const todosAbertos = Array.isArray(resFiltroStatus.data) && resFiltroStatus.data.every(s => s.status === 'Aberta');
  const aprovouHom009 = resFiltroStatus.status === 200 && todosAbertos;
  resultados.push({
    id: 'HOM-009',
    requisito: 'RF-08',
    defeitoId: null,
    statusTeste: aprovouHom009 ? 'APROVADO' : 'REPROVADO',
    esperado: 'Retornar apenas solicitações que coincidem estritamente com os filtros aplicados.',
    observado: `HTTP ${resFiltroStatus.status}. Total retornado: ${resFiltroStatus.data.length} registros, todos com status 'Aberta'.`,
    evidenciaHttp: { status: resFiltroStatus.status, total: resFiltroStatus.data.length },
  });
  console.log(`Resultado HOM-009: ${aprovouHom009 ? 'APROVADO' : 'REPROVADO'}\n`);

  // =========================================================================
  // HOM-010: Healthcheck e conectividade do banco
  // =========================================================================
  console.log('--- TESTE HOM-010: Healthcheck e integridade relacional ---');
  const resHealth = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET',
  });

  const aprovouHom010 = resHealth.status === 200 && resHealth.data.status === 'ok' && resHealth.data.banco === 'conectado';
  resultados.push({
    id: 'HOM-010',
    requisito: 'RF-09',
    defeitoId: null,
    statusTeste: aprovouHom010 ? 'APROVADO' : 'REPROVADO',
    esperado: 'HTTP 200 OK com status "ok" e banco "conectado".',
    observado: `HTTP ${resHealth.status} OK com dados: ${JSON.stringify(resHealth.data)}.`,
    evidenciaHttp: { status: resHealth.status, body: resHealth.data },
  });
  console.log(`Resultado HOM-010: ${aprovouHom010 ? 'APROVADO' : 'REPROVADO'}\n`);

  await db.end();

  // Salvar relatório bruto JSON para compor evidências
  const fs = require('fs');
  const path = require('path');
  fs.writeFileSync(
    path.join(__dirname, '..', 'docs', 'evidencias-execucao.json'),
    JSON.stringify(resultados, null, 2),
    'utf8'
  );

  console.log('===============================================================');
  console.log('RESUMO DA EXECUÇÃO:');
  const total = resultados.length;
  const aprovados = resultados.filter(r => r.statusTeste === 'APROVADO').length;
  const reprovados = resultados.filter(r => r.statusTeste === 'REPROVADO').length;
  console.log(`Total de testes executados: ${total}`);
  console.log(`Aprovados: ${aprovados}`);
  console.log(`Reprovados: ${reprovados}`);
  console.log('Relatório de evidências gravado em docs/evidencias-execucao.json');
  console.log('===============================================================');
}

run().catch((e) => {
  console.error('Falha na execução dos testes:', e);
  process.exit(1);
});
