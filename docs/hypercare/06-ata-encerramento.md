# Ata de Encerramento do Hypercare — ISRP

**Responsável:** Marcelo Prates (PM) · **Fechamento** · 13/10/2026

| Campo | Registro |
| --- | --- |
| Data e equipe | 13/10/2026 · Marcelo Prates (PM), Mateus Prates (QA), Leonardo Nonato (Tester), Raphael Monteiro (Dev 1), Tiago Macedo (Dev 2) |
| Sistema e build | ISRP, `homologação-v2` @ `59dca8c` |
| Decisão sobre o Hypercare | **Recomenda-se encerrar** após cumprir as ressalvas do Handover (medição de desempenho e ensaio de rollback) |
| Decisão sobre o Handover | **Aceitar com ressalvas** (ver `05-termo-handover.md`) |

## Resumo dos incidentes

Cinco defeitos controlados (DEF-01 a DEF-05; 2 de severidade S2 e 3 de S3) foram identificados na Homologação 1, que reprovou a versão com 5 de 10 casos aprovados. Todos foram reproduzidos, tiveram causa raiz confirmada em código, foram corrigidos em um hotfix de 5 arquivos e retestados.

## Resultados antes × depois

Casos aprovados: 5 de 10 → 10 de 10. Defeitos abertos: 5 → 0. KPI "Pendentes": 4 exibido contra 6 reais → 4 contra 4. Chamado vazio aceito (HTTP 201) → rejeitado (HTTP 400). Regressões: 0. Detalhes em `04-comparativo-antes-depois.md`. Os indicadores de desempenho (p95, 5xx, throughput) aguardam a medição.

## Riscos e pendências

1. Desempenho não medido (responsáveis: Mateus Prates e Leonardo Nonato).
2. Rollback documentado, mas não ensaiado (Raphael Monteiro).
3. Assinaturas e aprovação do cliente simulado (todos).

## Recomendação

Encerrar o Hypercare quando as pendências 1 e 2 estiverem concluídas; manter o Hypercare por mais um ciclo se a medição apontar p95 acima de 2 s ou taxa 5xx acima de 1%.

## Melhoria para o próximo ciclo

Proposta (a equipe pode ajustar na retrospectiva): incluir a medição de desempenho na própria suíte de homologação, para que cada rodada registre p95 e taxa 5xx junto dos resultados funcionais.

## Respostas da retrospectiva (preencher na reunião de fechamento)

| Integrante | Pergunta | Resposta |
| --- | --- | --- |
| Marcelo Prates (PM) | Como o SLA influenciou a prioridade? | |
| Mateus Prates (QA) | Qual evidência tornou o hotfix aceitável? | |
| Leonardo Nonato (Tester) | Qual foi o primeiro sinal do problema? | |
| Raphael Monteiro (Dev 1) | Como distinguir sintoma de causa raiz? | |
| Tiago Macedo (Dev 2) | Qual foi a dependência mais importante entre os papéis? | |

## Assinaturas da equipe

PM: ______________ · QA: ______________ · Tester: ______________ · Dev 1: ______________ · Dev 2: ______________
