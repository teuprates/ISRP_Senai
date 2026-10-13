# Hotfix: Registro de Causa Raiz, Aprovação e Plano de Rollback

**Responsáveis:** Raphael Monteiro (Dev 1, backend/banco) · Tiago Macedo (Dev 2, frontend/integração) · Aprovação: Marcelo Prates (PM) com parecer de Mateus Prates (QA) · **Dia 3 simulado** · 13/10/2026

## 1. Identificação da build

| Item | Valor |
| --- | --- |
| Build anterior (com defeitos) | branch `homologação-v1`, commit `5fff248` |
| Build do hotfix | branch `homologação-v2`, commit `59dca8c` |
| Baseline original (referência) | branch `main`, commit `281abca` |
| Arquivos alterados (5) | `server/routes/solicitacoes.js`, `server/routes/admin.js`, `public/js/detalhes.js`, `public/js/solicitacoes.js`, `public/solicitacoes.html` |
| Mudança de esquema de banco | **Nenhuma** (nenhum arquivo de `banco/` ou `scripts/init-db.js` foi alterado) |
| Novas dependências | Nenhuma (o `package.json` só ganhou os scripts `homologacao:1` e `homologacao:2`; `package-lock.json` inalterado) |

Comando para conferir o código alterado: `git diff --stat 5fff248 59dca8c -- server public`. O restante do diff entre os commits é documentação, scripts de teste e `.env.example`.

## 2. Registro de causa raiz por defeito

| Defeito | Dono | Hipótese inicial | Causa confirmada | Prova |
| --- | --- | --- | --- | --- |
| DEF-01 | Dev 1 (+ Dev 2 no HTML) | Validação de mínimo ausente | Sim: faltava `descricao.length < 10` no backend e `required`/`minlength` no `textarea` | HOM-001: antes HTTP 201 com registro id 7; depois HTTP 400 e 0 registros |
| DEF-05 | Dev 1 | Fórmula de pendentes incompleta | Sim: `pendentes` somava só `Aberta` | HOM-006: SQL `pendentes_reais`: 6 contra 4 exibidos; depois 4 contra 4 |
| DEF-02 | Dev 2 | Callback de atualização não chamado | Sim: `onAtualizado()` e `abrir()` removidos | HOM-003 |
| DEF-04 | Dev 2 | Histórico não é recarregado | Sim: mesma causa de DEF-02 | HOM-005 |
| DEF-03 | Dev 2 | Concatenação de objeto em string | Sim: `catch` concatenava `err.detalhes` | HOM-004 |

Diffs completos: `docs/homologacao-v2/homologacao-02-correcoes.md`.

## 3. Avaliação de risco do hotfix

**Risco: baixo.** Mudança pequena (10 linhas inseridas e 13 removidas em 5 arquivos), sem alteração de banco, de contratos de API ou de dependências. A área de maior sensibilidade é a validação do cadastro, que passa a rejeitar descrições com menos de 10 caracteres. Isso é o comportamento definido nos requisitos RF-01/RF-02.

## 4. Testes executados (Tester) e parecer (QA)

| Tipo | Casos | Resultado |
| --- | --- | --- |
| Correção (reteste dos defeitos) | HOM-001, 003, 004, 005, 006 | 5 de 5 aprovados |
| Cenário positivo | HOM-002 (cadastro válido, HTTP 201) | Aprovado |
| Negativo | HOM-001 (descrição vazia, 400) e HOM-004 (título curto) | Aprovados |
| Regressão | HOM-007 (login/sessão), 008 (RBAC), 009 (filtros), 010 (healthcheck) | 4 de 4 aprovados |
| **Total** | 10 casos (`npm run homologacao`) | **10 de 10 (100%)**, 0 regressões |

**Parecer de QA:** critérios de aceite atendidos, com rastreabilidade defeito → causa → arquivo → teste em `docs/matriz-rastreabilidade.md`.

## 5. Decisão e janela de mudança

| Campo | Registro |
| --- | --- |
| Build/branch | `homologação-v2` @ `59dca8c` |
| Janela | Dia 3 simulado (45 min) |
| Incidentes relacionados | DEF-01 a DEF-05 |
| Critérios de aceite atendidos | Sim: 10 de 10 casos, 0 regressões |
| **Decisão** | **Aprovar** |
| Responsável pela decisão | Marcelo Prates (PM) |
| Comunicação ao cliente simulado | Mensagem de abertura e de encerramento da janela em `08-diario-decisoes-e-riscos.md` |

## 6. Plano de rollback

**Condições de acionamento** (qualquer uma, após o deploy do hotfix):

1. Falha em HOM-007 ou HOM-008 (login, sessão ou controle de acesso);
2. `GET /api/health` diferente de HTTP 200 por mais de 2 verificações seguidas;
3. Taxa de erro 5xx acima de 1% (medida com `scripts/medir-metricas.js`) ou p95 acima de 2 s;
4. Registro de solicitação válida rejeitado (HTTP 400 indevido) ou perda/inconsistência de dados;
5. KPI "Pendentes" divergente do SQL `Aberta + Em atendimento`.

**Passos (sem migração de banco, então não há rollback de dados):**

| # | Ação | Responsável |
| --- | --- | --- |
| 1 | Avisar o cliente simulado e congelar novas mudanças | PM |
| 2 | Parar o servidor (`Ctrl+C` ou parar o processo Node) | Dev 2 |
| 3 | Voltar o código: `git checkout 5fff248` (ou `git revert 59dca8c` para manter o histórico linear) | Dev 1 |
| 4 | Reiniciar: `npm start` | Dev 2 |
| 5 | Validar: `GET /api/health` = 200 e `node scripts/homologacao.js 1` | Tester |
| 6 | Registrar o incidente de regressão e a decisão no diário | PM e QA |

**Efeito do rollback:** a build anterior volta a ter DEF-01 a DEF-05. Mitigações enquanto durar: orientar a equipe de atendimento a conferir a fila no banco (pendentes = Aberta + Em atendimento) e recarregar o modal após alterar o status.

**Teste do rollback:** ainda não ensaiado. Executar uma vez, antes da gravação, o roteiro de verificação abaixo e marcar:

- [ ] `git checkout 5fff248`, reiniciar e confirmar que `node scripts/homologacao.js 1` reproduz 5 reprovações
- [ ] `git checkout homologação-v2`, reiniciar e confirmar `Aprovados: 10`
- [ ] Data/hora e responsável do ensaio: ______________________________

## 7. Deploy emergencial (Dev 2)

1. `git checkout homologação-v2` e conferir `git log -1` = `59dca8c`;
2. `npm install` (sem novas dependências) e conferir o `.env` (modelo em `.env.example`);
3. `npm start`, depois `GET /api/health` deve retornar `{"status":"ok","banco":"conectado"}`;
4. Rodar `npm run homologacao` (10 de 10) e acompanhar o log de requisições no terminal (`[data] METODO /rota -> status (N ms)`) pela próxima janela de monitoramento.
