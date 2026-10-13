/**
 * Script Principal de Homologação do Sistema ISRP
 * Invocado por: npm run homologacao
 * Uso:
 *   npm run homologacao           (executa a Homologação 2 - validação completa e regressão)
 *   node scripts/homologacao.js 1 (executa a Homologação 1 - defeitos controlados)
 *   node scripts/homologacao.js 2 (executa a Homologação 2 - validação completa pós-correção)
 */
const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
let rodada = '2'; // Padrão: Homologação 2 (validação final da versão corrigida)

for (const arg of args) {
  if (arg === '1' || arg === '--rodada=1' || arg === '-1') rodada = '1';
  else if (arg === '2' || arg === '--rodada=2' || arg === '-2') rodada = '2';
}

const scriptAlvo = rodada === '1' ? 'test-homologacao.js' : 'test-homologacao-02.js';
const caminhoScript = path.join(__dirname, scriptAlvo);

console.log('===================================================================');
console.log(`[ISRP] Iniciando Suíte de Testes — Homologação ${rodada}`);
console.log(`[ISRP] Script delegado: scripts/${scriptAlvo}`);
console.log('===================================================================\n');

const proc = spawn(process.execPath, [caminhoScript], {
  stdio: 'inherit',
  env: process.env,
});

proc.on('close', (codigo) => {
  if (codigo === 0) {
    console.log(`\n[ISRP] Execução da Homologação ${rodada} concluída com sucesso.`);
  } else {
    console.error(`\n[ISRP] Execução da Homologação ${rodada} finalizada com código ${codigo}.`);
  }
  process.exit(codigo || 0);
});
