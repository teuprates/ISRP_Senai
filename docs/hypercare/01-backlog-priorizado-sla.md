# Backlog Priorizado do Hypercare e Controle de SLA

**Responsável:** Marcelo Prates (PM) · **Entregue em:** Dia 2 simulado · **Data:** 13/10/2026

## 1. Matriz de severidade adotada (S1–S4)

| Nível | Critério | Exemplo no ISRP |
| --- | --- | --- |
| S1 — Crítica | Indisponibilidade ampla, perda de dados, segurança ou corrupção de registros | Login ou RBAC quebrados; banco indisponível |
| S2 — Alta | Função essencial degradada ou dado incorreto para todos, sem contorno seguro | Cadastro aceitando chamado vazio; KPI gerencial errado |
| S3 — Média | Impacto limitado ou contornável | Tela não atualiza após salvar (recarregar a página resolve) |
| S4 — Baixa | Cosmético ou melhoria | Alinhamento visual |

Equivalência com a homologação: severidade **Alta** = S2; **Média** = S3.

## 2. Metas de SLA do Hypercare (definidas pela equipe)

Os prazos abaixo são metas internas da simulação, não valores do sistema (o SLA por serviço, em horas, é outro conceito e fica na tabela `servicos`).

| Severidade | Primeira resposta | Resolução (hotfix testado) |
| --- | --- | --- |
| S1 | 15 min | 2 h |
| S2 | 1 h | 4 h |
| S3 | 4 h | 1 dia útil |
| S4 | planejado | conforme capacidade |

## 3. Backlog priorizado

Critérios de ordenação: severidade, alcance, risco para os dados, existência de contorno e dependências entre correções.

| Ordem | ID | Título | Sev. | SLA (resolução) | Responsável técnico | Reprodução (Tester) | Justificativa da prioridade | Status |
| :-: | --- | --- | :-: | --- | --- | --- | --- | --- |
| 1 | DEF-01 / INC-A | Cadastro aceita descrição vazia | S2 | 4 h | Dev 1 (backend) com Dev 2 (HTML) | HOM-001, HTTP 201 e registro id 7 com `descricao=""` | Corrompe a base a cada envio e não tem contorno: o servidor não barra. Afeta toda a fila de atendimento. | Resolvido e retestado |
| 2 | DEF-05 / INC-B | KPI "Pendentes" subestimado | S2 | 4 h | Dev 1 (backend) | HOM-006, exibia 4 com 6 reais (Aberta 4 + Em atendimento 2) | Decisão gerencial baseada em dado errado (33% da fila oculta). Correção de uma linha, risco baixo. | Resolvido e retestado |
| 3 | DEF-02 / INC-C | Badge e tabela não atualizam após mudar status | S3 | 1 dia útil | Dev 2 (frontend) | HOM-003 | Atendente vê status antigo, mas recarregar a página contorna. | Resolvido e retestado |
| 4 | DEF-04 / INC-C | Histórico não aparece após alterar status | S3 | 1 dia útil | Dev 2 (frontend) | HOM-005 | Mesma causa raiz de DEF-02 (`detalhes.js`). Corrigido junto para uma só mudança. | Resolvido e retestado |
| 5 | DEF-03 / INC-D | Mensagem `[object Object]` no formulário | S3 | 1 dia útil | Dev 2 (frontend) | HOM-004 | Atrapalha o preenchimento, sem perda de dados e sem indisponibilidade. | Resolvido e retestado |

**Duplicidades relacionadas:** DEF-02 e DEF-04 compartilham a causa (`public/js/detalhes.js`) e foram tratados no mesmo hotfix.

## 4. Controle de SLA

Cada defeito foi reproduzido na execução da Homologação 1 (evidência de 13/10/2026, 15:28) e resolvido no hotfix da Homologação 2 (evidência de 13/10/2026, 15:48). Como a simulação ocorre em um único encontro, os tempos reais ficaram abaixo das metas da tabela; o horário de abertura de cada item está em `homologacao-v1/evidencias-execucao.json` e o de reteste em `homologacao-v2/evidencias-execucao-02.json`.

| ID | Reproduzido (Dia 1/2) | Hotfix (Dia 3) | Reteste aprovado (Dia 4) | Dentro do SLA? |
| --- | :-: | :-: | :-: | :-: |
| DEF-01 | Sim | Sim | HOM-001 aprovado | Sim |
| DEF-05 | Sim | Sim | HOM-006 aprovado | Sim |
| DEF-02 | Sim | Sim | HOM-003 aprovado | Sim |
| DEF-04 | Sim | Sim | HOM-005 aprovado | Sim |
| DEF-03 | Sim | Sim | HOM-004 aprovado | Sim |

## 5. Backlog residual (após o Hypercare)

| Item | Sev. | Responsável | Prazo | Risco aceito |
| --- | :-: | --- | --- | --- |
| Medir p95, taxa 5xx e throughput antes × depois com `scripts/medir-metricas.js` | S3 | Mateus Prates (QA) com Leonardo Nonato (Tester) | Antes da gravação do vídeo | Sem a medição, o SLA de desempenho não está comprovado |
| Executar o teste de rollback (checklist em `03`) | S3 | Raphael Monteiro (Dev 1) | Antes da gravação do vídeo | Rollback documentado, ainda não ensaiado |
| SLA vencido = 3 chamados nos dados de demonstração (não relacionados aos defeitos) | S4 | Equipe de sustentação | Primeiro ciclo de manutenção | Aceito: são dados de exemplo da base |
