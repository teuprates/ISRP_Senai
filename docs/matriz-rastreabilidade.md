# Matriz de Rastreabilidade — Homologação do Sistema ISRP

**Documento:** `docs/matriz-rastreabilidade.md`  
**Projeto:** ISRP — Sistema Integrado de Solicitações e Processos (SENAI Serviços Digitais — Acadêmico/Fictício)  
**Ciclos Cobertos:** Homologação 1 (Defeitos) e Homologação 2 (Correções e Validação Final)  
**Data:** 13 de Outubro de 2026  
**Responsáveis:** Desenvolvedor de Software e Analista de Qualidade (QA)  
**Branch de Correção:** `homologacao-corrigida` (Commit `1fc7ec5`)

---

## 1. Visão Geral da Rastreabilidade

A presente Matriz de Rastreabilidade estabelece o vínculo bidirecional entre os requisitos do sistema, os defeitos identificados na primeira rodada de testes, as causas-raízes técnicas, os arquivos modificados, as soluções de engenharia implementadas e os testes de regressão executados na segunda homologação.

---

## 2. Matriz de Rastreabilidade de Defeitos e Correções

| ID do defeito | Sintoma original | Causa-raiz | Arquivos alterados | Correção aplicada | Teste de regressão | Resultado final |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **[DEF-01](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/docs/homologacao-01-defeitos.md#def-01)** | Chamados abertos com campo Descrição vazio são aceitos com sucesso (`HTTP 201`), poluindo a base com tickets sem conteúdo. | Backend checava apenas limite máximo (`> 5000`) omitindo o mínimo (`< 10`). Frontend sem atributos `required` e `minlength="10"`. | • [server/routes/solicitacoes.js](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/server/routes/solicitacoes.js#L77-L79)<br>• [public/solicitacoes.html](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/solicitacoes.html#L90-L95) | Restaurada a checagem `if (descricao.length < 10 || descricao.length > 5000)` no backend e recolocados `required minlength="10"` no HTML. | `HOM-001` (submissão de descrição vazia) e `HOM-002` (cadastro válido) | **APROVADO** |
| **[DEF-02](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/docs/homologacao-01-defeitos.md#def-02)** | Após alterar status no modal, a mensagem de sucesso aparece, mas o badge de status e a grade da tabela ao fundo permanecem estáticos no valor anterior. | O handler de submit de `detalhes.js` não invocava `opcoes.onAtualizado(r)` e não chamava `await abrir(id, ...)` para repintar o DOM com o status retornado pela API. | • [public/js/detalhes.js](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/js/detalhes.js#L125-L132) | Reativadas a chamada do callback `onAtualizado(r)` e a re-execução assíncrona `abrir(id, ...)` com inserção da mensagem de confirmação. | `HOM-003` (alteração de status de Aberta para Em atendimento) | **APROVADO** |
| **[DEF-03](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/docs/homologacao-01-defeitos.md#def-03)** | Ao submeter dados inválidos, a caixa de alerta exibe a mensagem incompreensível `"Falha no cadastro: [object Object]"`. | O bloco `catch` de `solicitacoes.js` concatenava primitivamente a string com o objeto `err.detalhes`, e havia removido o helper acessível `errosCampos`. | • [public/js/solicitacoes.js](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/js/solicitacoes.js#L164-L170) | O bloco `catch` passou a utilizar `err.message` no alerta geral e reativou `errosCampos(formNova, err.detalhes)` para destacar os campos inválidos. | `HOM-004` (título com 2 caracteres) | **APROVADO** |
| **[DEF-04](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/docs/homologacao-01-defeitos.md#def-04)** | O novo evento de alteração de status não é inserido na linha do tempo do histórico de imediato, exigindo fechar e reabrir o modal. | A lista `<ol class="linha-tempo">` não era re-requisitada nem re-renderizada pós-salvamento de status, mantendo o HTML prévio em cache. | • [public/js/detalhes.js](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/js/detalhes.js#L125-L132) | Ao invocar `await abrir(id, ...)`, o método busca `api.get('/api/solicitacoes/:id/historico')` e reconstroi toda a linha do tempo com o novo evento visível. | `HOM-005` (transição para Resolvida e conferência imediata da timeline) | **APROVADO** |
| **[DEF-05](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/docs/homologacao-01-defeitos.md#def-05)** | Cartão de KPI "Pendentes" no Painel Admin exibe contagem inferior (metade da fila), gerando falsa percepção de baixa carga. | A rota `/api/admin/indicadores` computava `pendentes: status['Aberta']`, ignorando os chamados que estavam no status `Em atendimento`. | • [server/routes/admin.js](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/server/routes/admin.js#L60-L62) | Expressão de cálculo corrigida para somar ambos os estados: `pendentes: status['Aberta'] + status['Em atendimento']`. | `HOM-006` (leitura dos KPIs e auditoria contra consulta SQL no MySQL) | **APROVADO** |

---

## 3. Matriz de Requisitos vs. Casos de Teste (Ambas as Rodadas)

| Requisito Funcional | Caso de Teste | Descrição do Teste | Rodada 1 | Rodada 2 | Regressão? |
| :--- | :---: | :--- | :---: | :---: | :---: |
| **RF-01 / RF-02** | `HOM-001` | Rejeição de solicitação com descrição vazia | REPROVADO | **APROVADO** | Não (Corrigido) |
| **RF-01 / RF-02** | `HOM-002` | Cadastro de solicitação com dados válidos e persistência | APROVADO | **APROVADO** | Não (Íntegro) |
| **RF-05 / RF-06** | `HOM-003` | Alteração de status e atualização visual de interface | REPROVADO | **APROVADO** | Não (Corrigido) |
| **RF-02 / Usabilidade** | `HOM-004` | Exibição de mensagem de erro legível ao falhar validação | REPROVADO | **APROVADO** | Não (Corrigido) |
| **RF-06** | `HOM-005` | Atualização imediata do histórico pós-alteração de status | REPROVADO | **APROVADO** | Não (Corrigido) |
| **RF-07** | `HOM-006` | Cálculo correto do KPI de pendentes (Aberta + Em atendimento) | REPROVADO | **APROVADO** | Não (Corrigido) |
| **RF-03** | `HOM-007` | Autenticação, sessão segura httpOnly e bloqueio de senha | APROVADO | **APROVADO** | Não (Íntegro) |
| **RF-04** | `HOM-008` | Controle de acesso baseado em papéis (RBAC em rota admin) | APROVADO | **APROVADO** | Não (Íntegro) |
| **RF-08** | `HOM-009` | Filtragem dinâmica de solicitações por status e busca | APROVADO | **APROVADO** | Não (Íntegro) |
| **RF-09** | `HOM-010` | Healthcheck de infraestrutura e conectividade com MySQL | APROVADO | **APROVADO** | Não (Íntegro) |

---

## 4. Conclusão da Rastreabilidade

Todas as falhas observadas na primeira homologação possuem diagnóstico comprovado, modificação pontual e teste de regressão aprovado, sem introdução de efeitos colaterais nos fluxos existentes.
