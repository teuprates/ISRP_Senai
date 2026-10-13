# Relatório de Métricas e Gargalos

**Responsável:** Mateus Prates (QA) · **Entregue em:** Dia 1 simulado (atualizado no Dia 4) · **Data:** 13/10/2026

## 1. Fontes das medições

| Fonte | Conteúdo | Local |
| --- | --- | --- |
| Suíte da Homologação 1 (build com defeitos) | 10 casos, respostas HTTP e consultas SQL | `docs/homologacao-v1/evidencias-execucao.json` |
| Suíte da Homologação 2 (build corrigido) | os mesmos 10 casos | `docs/homologacao-v2/evidencias-execucao-02.json` |
| Medição de desempenho | p50/p95/p99, taxa 5xx, throughput | `scripts/medir-metricas.js` → `docs/hypercare/evidencias/metricas-antes.json` e `metricas-depois.json` |

> **Estado da medição de desempenho:** as suítes de homologação validam funcionalidade e não registraram tempos de resposta. Os valores de p95, taxa 5xx e throughput só existem depois de rodar `scripts/medir-metricas.js` (instruções na seção 5). Por isso, nenhum desses valores aparece preenchido neste relatório: os campos ficam em branco até a medição, para não apresentar número sem evidência.

## 2. Diário de métricas (Dia 1 — build com defeitos)

| Métrica | Valor | Referência | Interpretação / evidência |
| --- | --- | --- | --- |
| Casos de teste aprovados | 5 de 10 (50%) | 100% | Versão reprovada (HOM-001, 003, 004, 005, 006) |
| Defeitos abertos | 5 (2 S2 + 3 S3) | 0 | `homologacao-01-defeitos.md` |
| KPI "Pendentes" exibido × real | 4 × 6 (erro de 33%) | exibido = real | HOM-006: `por_status` = Aberta 4, Em atendimento 2 |
| Chamados vazios aceitos pela API | 1 (id 7, `descricao=""`, HTTP 201) | 0 | HOM-001 |
| Healthcheck `/api/health` | HTTP 200, `banco: conectado` | 200 | HOM-010 |
| SLA vencido (dados de exemplo) | 3 | informativo | KPI do painel admin |
| Tempo médio de resolução (dados de exemplo) | 46,7 h | informativo | KPI do painel admin |
| **p95 de resposta da API** | __ ms | ≤ 2.000 ms | a medir com `medir-metricas.js antes` |
| **Taxa de erro HTTP 5xx** | __ % | ≤ 1% | a medir |
| **Throughput** | __ req/min | informativo | a medir |
| **Tempo da query de indicadores** | __ ms | ≤ 300 ms | a medir (`/api/admin/indicadores`) |

As referências de desempenho (p95 ≤ 2 s, 5xx ≤ 1%, query ≤ 300 ms) foram adotadas do roteiro da atividade; a equipe pode ajustá-las, desde que registre a mudança no diário de decisões.

## 3. Mapa de sintomas, hipóteses e fatos

| Sintoma observado | Hipótese inicial | Fato comprovado (causa raiz) | Evidência |
| --- | --- | --- | --- |
| Chamado vazio aceito | Validação ausente | **Confirmado:** o backend só checava o máximo (`> 5000`), sem o mínimo (`< 10`); o `textarea` não tinha `required` | diff em `homologacao-02-correcoes.md` §2.1 |
| KPI menor que a fila | Fórmula incompleta | **Confirmado:** `pendentes: status['Aberta']` ignorava "Em atendimento" | HOM-006, SQL `pendentes_reais = 6` |
| Badge e histórico parados | Callback não chamado | **Confirmado:** `detalhes.js` não chamava `onAtualizado()` nem `abrir()` | diff em `homologacao-02-correcoes.md` §2.2 |
| `[object Object]` | Concatenação de objeto | **Confirmado:** `catch` concatenava `err.detalhes` (objeto) | diff em `homologacao-02-correcoes.md` §2.3 |

## 4. Gargalos identificados

1. **Qualidade de entrada de dados (maior risco):** sem validação de mínimo no backend, qualquer cliente HTTP grava chamado vazio, e a validação só no navegador não protege.
2. **Confiabilidade dos indicadores:** o painel é a base de decisão do Hypercare, e estava incorreto.
3. **Sincronização da interface:** o modal de atendimento exibia dado desatualizado após salvar.

Gargalos de desempenho (CPU, locks, lentidão de query) não foram investigados porque não há medição. A investigação depende dos resultados do script de métricas.

## 5. Como medir p95, taxa 5xx e throughput

```bash
# 1) Build com defeitos
git checkout homologação-v1      # branch da Homologação 1
npm start                         # em outro terminal
node scripts/medir-metricas.js antes

# 2) Build corrigido
git checkout homologação-v2      # branch da Homologação 2
npm start                         # reiniciar o servidor
node scripts/medir-metricas.js depois
```

O script mede `/api/health`, `/api/solicitacoes` e `/api/admin/indicadores` (200 requisições por endpoint, 10 em paralelo; ajustável com `REQS` e `CONCORRENCIA`) e grava `docs/hypercare/evidencias/metricas-<antes|depois>.json`. Depois, copie os valores para este relatório (seção 2) e para `04-comparativo-antes-depois.md`.
