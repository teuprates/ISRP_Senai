# Termo de Transição / Checklist de Handover — ISRP

**Dia 5 simulado** · 13/10/2026 · Sistema: ISRP (SENAI Serviços Digitais, fictício) · Build entregue: `homologação-v2` @ `59dca8c`
**Destinatário:** equipe de sustentação (simulada) e cliente simulado (professor)

## 1. Checklist de verificação

Marcação: [x] concluído e com evidência · [ ] pendente.

| Item de verificação | Situação | Responsável | Evidência / observações |
| --- | :-: | --- | --- |
| Escopo e arquitetura relevante documentados | [x] | Raphael Monteiro | Node 18+/Express 5, MySQL 8 com pool, sessões `isrp.sid` HttpOnly, bcrypt; ver `docs/homologacao-v1/homologacao-01-plano.md` e `package.json` |
| Incidentes, correções e riscos registrados | [x] | Marcelo Prates | `01-backlog-priorizado-sla.md`, `08-diario-decisoes-e-riscos.md`, `docs/matriz-rastreabilidade.md` |
| Build, configuração e dependências registradas | [x] | Tiago Macedo | `59dca8c`, `.env.example`, `package.json`; sem novas dependências (`03`, seção 1) |
| Monitoramento, SLAs e contatos definidos | [x] | Marcelo Prates | SLA S1–S4 em `01`; monitoramento via `/api/health`, log de requisições e `scripts/medir-metricas.js`; contatos na seção 3 |
| Testes e regressão documentados | [x] | Leonardo Nonato | 10 casos, 10 aprovados, 0 regressões (`docs/homologacao-v2/`) |
| Rollback documentado | [x] | Raphael Monteiro | `03`, seção 6 |
| Rollback ensaiado | [ ] | Raphael Monteiro | Checklist de ensaio em `03` (seção 6), a executar |
| Métricas de desempenho (p95, 5xx, throughput) medidas antes e depois | [ ] | Mateus Prates | `scripts/medir-metricas.js`; resultado em `docs/hypercare/evidencias/` |
| Comparativo antes × depois preenchido | [x] funcional / [ ] desempenho | Mateus Prates | `04` (campos de desempenho dependem da linha acima) |
| Pendências com prazo e responsável | [x] | Marcelo Prates | seção 2 abaixo |
| Ata de encerramento do Hypercare | [x] | Marcelo Prates | `06-ata-encerramento.md` |
| Assinaturas dos 5 integrantes | [ ] | Todos | seção 4 |
| Aprovação do cliente simulado | [ ] | Marcelo Prates | seção 4 |

## 2. Pendências e riscos aceitos

| Pendência | Risco | Responsável | Prazo | Plano de acompanhamento |
| --- | --- | --- | --- | --- |
| Medir p95, 5xx e throughput antes e depois | Médio: desempenho não comprovado | Mateus Prates e Leonardo Nonato | Antes da gravação do vídeo | Rodar `medir-metricas.js` nas duas branches e atualizar `02` e `04` |
| Ensaiar o rollback | Baixo: procedimento simples, sem migração de banco | Raphael Monteiro | Antes da gravação do vídeo | Seguir a checklist de `03` |
| 3 chamados com SLA vencido nos dados de exemplo | Baixo: dados de demonstração | Equipe de sustentação | 1º ciclo de manutenção | Tratar na fila normal |

## 3. Contatos e responsabilidades pós-Hypercare

| Área | Contato (equipe de implantação) |
| --- | --- |
| Gestão, SLA e comunicação | Marcelo Prates |
| Qualidade, aceite e métricas | Mateus Prates |
| Testes, reprodução e regressão | Leonardo Nonato |
| Backend, banco, queries e rollback | Raphael Monteiro |
| Frontend, build e deploy emergencial | Tiago Macedo |

## 4. Decisão e assinaturas

**Recomendação da equipe:** **Aceitar com ressalvas.** A operação é transferível: 10 de 10 testes, 0 defeitos abertos, rollback documentado e sem mudança de banco. As ressalvas são as três pendências da seção 2 (medição de desempenho, ensaio de rollback e assinaturas), todas com responsável e prazo, todas de risco baixo ou médio e sem incidente crítico aberto.

**Decisão final (preencher pelo PM após cumprir as ressalvas):** ( ) Aceitar ( ) Aceitar com ressalvas ( ) Rejeitar
**Justificativa:** ______________________________________________________________

| Papel | Nome | Assinatura | Data |
| --- | --- | --- | --- |
| PM | Marcelo Prates | ______________________ | ___/___/2026 |
| QA | Mateus Prates | ______________________ | ___/___/2026 |
| Tester | Leonardo Nonato | ______________________ | ___/___/2026 |
| Dev 1 | Raphael Monteiro | ______________________ | ___/___/2026 |
| Dev 2 | Tiago Macedo | ______________________ | ___/___/2026 |
| Cliente simulado (professor) | ______________________ | ______________________ | ___/___/2026 |

> As assinaturas e a decisão final ficam em branco de propósito: só valem se feitas pelos próprios integrantes. Sem os 5 nomes assinados e uma decisão formal, o critério de Handover fica limitado a "Insuficiente".
