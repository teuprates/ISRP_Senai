# Comparativo Antes × Depois

**Responsável:** Mateus Prates (QA) · **Dia 4 simulado** · 13/10/2026

**Antes** = build com defeitos (`5fff248`, evidência de 13/10/2026 15:28). **Depois** = build do hotfix (`59dca8c`, evidência de 13/10/2026 15:48). Fontes: `docs/homologacao-v1/evidencias-execucao.json` e `docs/homologacao-v2/evidencias-execucao-02.json`.

## 1. Indicadores exigidos pela atividade

| Indicador | Antes (Dia 1) | Depois (Dia 4) | Meta / interpretação |
| --- | --- | --- | --- |
| p95 de resposta da API | __ ms (a medir) | __ ms (a medir) | ≤ 2.000 ms. Medir com `scripts/medir-metricas.js`. |
| Taxa de erro | 50% dos casos reprovados (5 de 10); 5xx: __ % (a medir) | 0% dos casos reprovados (0 de 10); 5xx: __ % (a medir) | Falhas funcionais zeradas. 5xx ≤ 1%, ainda sem medição. |
| Disponibilidade | `/api/health` HTTP 200, banco conectado (1 verificação) | `/api/health` HTTP 200, banco conectado (1 verificação) | Sem indisponibilidade observada. A amostra é de uma verificação por rodada e não comprova percentual de uptime. |
| Tempo de query crítica | __ ms (a medir) | __ ms (a medir) | ≤ 300 ms (`/api/admin/indicadores`). |
| Chamados críticos (defeitos S2 abertos) | 2 (DEF-01, DEF-05) | 0 | Redução total. |
| Tempo médio de resposta (API) | __ ms (a medir) | __ ms (a medir) | Dentro do SLA da seção 3. |

Os campos `__` são preenchidos com o resultado de `node scripts/medir-metricas.js antes|depois`. Não há valores estimados.

## 2. Indicadores funcionais com evidência real

| Indicador | Antes | Depois | Evidência |
| --- | --- | --- | --- |
| Casos de teste aprovados | 5 de 10 (50%) | 10 de 10 (100%) | Relatórios finais 1 e 2 |
| Defeitos abertos | 5 (2 S2 + 3 S3) | 0 | `matriz-rastreabilidade.md` |
| Chamado com descrição vazia | Aceito: HTTP 201 | Rejeitado: HTTP 400, 0 registros | HOM-001 |
| KPI "Pendentes" | Exibe 4 com 6 reais (erro 33%) | Exibe 4 com 4 reais (erro 0%) | HOM-006 (SQL `pendentes_reais`) |
| Badge/histórico após alterar status | Desatualizados | Atualizados no ato | HOM-003, HOM-005 |
| Mensagem de erro de validação | `[object Object]` | Mensagem legível e campo destacado (`aria-invalid`) | HOM-004 |
| Regressões nos casos já aprovados | n/a | 0 (HOM-002, 007, 008, 009, 010) | Relatório final 2 |

## 3. Leitura e cuidados

- **Indicadores que não mudaram:** SLA vencido (3) e tempo médio de resolução (46,7 h) são idênticos nas duas rodadas porque dependem dos dados de exemplo, que a correção não altera. Não indicam melhora ou piora.
- **Base de dados diferente entre as rodadas:** a Homologação 1 terminou com 9 solicitações e a 2 com 7, pois cada execução recria os dados de teste. A comparação válida é a do KPI contra o próprio SQL de cada rodada (6 × 4 antes; 4 × 4 depois), não do número absoluto de pendentes entre rodadas.
- **Desempenho:** a conclusão de "SLA estabilizado" só pode ser afirmada depois da medição de p95 e taxa 5xx. Até lá, o que está comprovado é a estabilização funcional.
