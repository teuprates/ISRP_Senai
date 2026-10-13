/**
 * Inicializa o banco executando banco/Script_BD_ISRP.sql com as credenciais do .env.
 * Uso: npm run db:init
 * ATENÇÃO: recria as tabelas do ISRP (dados existentes serão perdidos).
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  const arquivo = path.join(__dirname, '..', 'banco', 'Script_BD_ISRP.sql');
  let sql = fs.readFileSync(arquivo, 'utf8');
  const nomeBanco = process.env.DB_NAME || 'isrp_db';
  if (nomeBanco !== 'isrp_db') sql = sql.replace(/\bisrp_db\b/g, nomeBanco);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    charset: 'utf8mb4',
  });
  try {
    await conn.query(sql);
    const [[c]] = await conn.query(
      `SELECT (SELECT COUNT(*) FROM \`${nomeBanco}\`.usuarios) AS usuarios,
              (SELECT COUNT(*) FROM \`${nomeBanco}\`.setores) AS setores,
              (SELECT COUNT(*) FROM \`${nomeBanco}\`.servicos) AS servicos,
              (SELECT COUNT(*) FROM \`${nomeBanco}\`.solicitacoes) AS solicitacoes,
              (SELECT COUNT(*) FROM \`${nomeBanco}\`.historico_solicitacoes) AS historico`
    );
    console.log(`[ISRP] Banco "${nomeBanco}" criado/recriado com sucesso.`, c);
  } finally {
    await conn.end();
  }
})().catch((err) => {
  console.error('[ISRP] Falha ao inicializar o banco:', err.code || '', err.message);
  process.exit(1);
});
