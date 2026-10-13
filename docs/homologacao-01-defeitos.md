# Registro de Defeitos — Homologação 1 (ISRP)

**Documento:** `docs/homologacao-01-defeitos.md`  
**Projeto:** ISRP — Sistema Integrado de Solicitações e Processos  
**Ciclo:** Homologação 1 (Versão com Defeitos Controlados)  
**Data:** 13 de Outubro de 2026  
**Responsável:** Analista de Qualidade de Software (QA)  
**Ambiente:** `http://localhost:3000` | Banco: `isrp_homolog_db`  
**Branch:** `homologacao-com-defeitos`

---

## Quadro Resumo dos Defeitos Identificados

| ID | Título do Defeito | Item da Lista de Entrada | Severidade | Prioridade | Caso de Teste | Componente Afetado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | Validação incompleta de campos obrigatórios no cadastro de solicitações | Item 1 | Alta | Alta | `HOM-001` | Backend / Frontend |
| **DEF-02** | Falha na atualização visual do status após resposta válida da API | Item 2 | Média | Alta | `HOM-003` | Frontend (`detalhes.js`) |
| **DEF-03** | Mensagem de erro inadequada quando a API retorna falha (`[object Object]`) | Item 4 | Média | Média | `HOM-004` | Frontend (`solicitacoes.js`) |
| **DEF-04** | Histórico não aparece imediatamente após alteração de status | Item 5 | Média | Média | `HOM-005` | Frontend (`detalhes.js`) |
| **DEF-05** | Indicador do painel administrativo apresenta total de pendentes incorreto | Item 6 | Alta | Alta | `HOM-006` | Backend (`admin.js`) |

---

## Detalhamento dos Defeitos

### DEF-01

- **ID do Defeito:** `DEF-01`
- **Título:** Validação incompleta de campos obrigatórios no cadastro de solicitações (aceite de descrição em branco).
- **Item Correspondente:** Item 1 — *Validação incompleta de campos obrigatórios no cadastro de solicitações*.
- **Por que foi Selecionado:** O fluxo de abertura de chamados é o ponto de contato fundamental do usuário final com a TI corporativa. Permitir que chamados técnicos sejam criados sem descrição compromete toda a cadeia de atendimento da Central de Suporte (CST) e da Manutenção (MANUT). O defeito é perfeitamente compatível com a arquitetura Express/MySQL do ISRP.
- **Caso de Teste Relacionado:** [`HOM-001`](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/docs/homologacao-01-casos-de-teste.md#hom-001)
- **Localização no Código-Fonte:**
  - Backend: [server/routes/solicitacoes.js:L77-L79](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/server/routes/solicitacoes.js#L77-L79)
  - Frontend: [public/solicitacoes.html:L90-L94](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/solicitacoes.html#L90-L94)
- **Causa Raiz Técnica (RCA):**
  - No backend, a condição de validação `if (descricao.length < 10 || descricao.length > 5000)` foi alterada para checar apenas o limite superior (`if (descricao.length > 5000)`), suprimindo a checagem de tamanho mínimo.
  - No frontend, os atributos de validação nativa do HTML5 `required` e `minlength="10"` foram removidos da tag `<textarea id="descricao">`.
- **Passos para Reprodução:**
  1. Efetuar login com usuário comum (`ana.demo` / `Usuario@123`).
  2. Acessar `/solicitacoes.html` e abrir o formulário de abertura.
  3. Preencher o Título com "Falha de inicialização".
  4. Selecionar uma Categoria válida.
  5. Deixar o campo Descrição vazio.
  6. Clicar em "Registrar solicitação".
- **Comportamento Esperado:** O formulário deve bloquear o envio e exibir mensagem indicando que a descrição é obrigatória (mínimo de 10 caracteres). O backend deve rejeitar requisições diretas com `HTTP 400 Bad Request`.
- **Comportamento Observado:** A requisição é aceita com `HTTP 201 Created` e persistida no MySQL com o campo `descricao = ""`.
- **Severidade e Prioridade:** Severidade Alta | Prioridade Alta.
- **Impacto para o Usuário e Negócio:** Técnicos recebem notificações de novos chamados, mas ao abrir o ticket encontram um documento em branco. Isso paralisa o atendimento, obriga o atendente a contatar manualmente o usuário por e-mail ou telefone para entender o problema, elevando o tempo de SLA e poluindo a base de dados.
- **Proposta de Correção Futura:** Restaurar a validação `if (descricao.length < 10 || descricao.length > 5000)` em `server/routes/solicitacoes.js` e recolocar os atributos `required minlength="10"` no elemento `<textarea>` em `public/solicitacoes.html`.

---

### DEF-02

- **ID do Defeito:** `DEF-02`
- **Título:** Falha na atualização visual do status após resposta válida da API.
- **Item Correspondente:** Item 2 — *Falha na atualização visual do status depois de uma resposta válida da API*.
- **Por que foi Selecionado:** Representa uma falha clássica de sincronização de estado em Single Page/Vanilla JS, onde a mutação ocorre no servidor com sucesso, mas a interface omite o repainting ou o callback de atualização dos elementos DOM.
- **Caso de Teste Relacionado:** [`HOM-003`](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/docs/homologacao-01-casos-de-teste.md#hom-003)
- **Localização no Código-Fonte:**
  - Frontend: [public/js/detalhes.js:L128-L131](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/js/detalhes.js#L128-L131)
- **Causa Raiz Técnica (RCA):**
  - No handler de submissão do formulário de status em `detalhes.js`, após a chamada `await api.patch(...)` retornar `HTTP 200`, o código executa apenas `mensagem(caixa, 'sucesso', r.mensagem)`, omitindo a re-execução de `await abrir(id, ...)` e a chamada de retorno `opcoes.onAtualizado(r)`. Com isso, o badge de status e os dados no DOM do modal permanecem com o estado anterior.
- **Passos para Reprodução:**
  1. Acessar `/login.html` como `admin` e ir para `/admin.html`.
  2. Clicar em "Atender / Status" em uma solicitação com status "Aberta".
  3. No modal, alterar o status para "Em atendimento" com comentário qualquer e clicar em "Salvar alteração".
  4. Observar o badge de status localizado na lista `<dl class="detalhes-lista">` no topo do modal.
- **Comportamento Esperado:** O badge de status no modal e a linha correspondente na tabela da fila geral devem mudar imediatamente para "Em atendimento".
- **Comportamento Observado:** O badge no modal continua exibindo "Aberta". A tabela de fundo também permanece exibindo "Aberta". Apenas uma mensagem em texto verde é exibida abaixo do seletor, gerando contradição na mesma tela.
- **Severidade e Prioridade:** Severidade Média | Prioridade Alta.
- **Impacto para o Usuário e Negócio:** Inconsistência de feedback. O atendente acredita que a alteração não surtiu efeito e tende a submeter o formulário novamente, disparando erros de conflito 409 (`A solicitação já está com o status...`), além de gerar perda de tempo operacional.
- **Proposta de Correção Futura:** Reincluir a invocação de `if (typeof opcoes.onAtualizado === 'function') opcoes.onAtualizado(r);` e a chamada assíncrona `await abrir(id, { ...opcoes, origem: gatilho });` com a inserção da mensagem de sucesso no cabeçalho do modal.

---

### DEF-03

- **ID do Defeito:** `DEF-03`
- **Título:** Mensagem de erro inadequada quando a API retorna falha de validação (`[object Object]`).
- **Item Correspondente:** Item 4 — *Mensagem de erro inadequada quando a API retorna uma falha*.
- **Por que foi Selecionado:** Erro de conversão de tipos muito frequente no frontend. Quando o servidor envia um dicionário de detalhes de validação (`{ campo: "mensagem" }`), concatená-lo com string primitiva sem serialização gera o texto incompreensível `[object Object]`.
- **Caso de Teste Relacionado:** [`HOM-004`](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/docs/homologacao-01-casos-de-teste.md#hom-004)
- **Localização no Código-Fonte:**
  - Frontend: [public/js/solicitacoes.js:L166-L169](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/js/solicitacoes.js#L166-L169)
- **Causa Raiz Técnica (RCA):**
  - O bloco `catch (err)` em `public/js/solicitacoes.js` executa:
    ```javascript
    const msgExibida = err.detalhes ? ('Falha no cadastro: ' + err.detalhes) : (err.message || 'Erro');
    mensagem(msgNova, 'erro', msgExibida);
    ```
    Como `err.detalhes` é um objeto retornado pelo JSON da API (ex: `{ titulo: "O título deve ter entre 5 e 150 caracteres." }`), o operador `+` converte o objeto para sua representação `Object.prototype.toString()`, resultando em `"[object Object]"`. Além disso, a função acessível `errosCampos(formNova, err.detalhes)` foi removida.
- **Passos para Reprodução:**
  1. Acessar `/solicitacoes.html` logado.
  2. Abrir o formulário de abertura.
  3. Preencher o Título com "Erro" (4 caracteres, violando o mínimo de 5).
  4. Preencher os demais campos e submeter.
- **Comportamento Esperado:** Mensagem clara informando que o título deve ter entre 5 e 150 caracteres, com contorno vermelho no campo e anúncio por leitor de tela (`aria-describedby`).
- **Comportamento Observado:** Exibição do alerta: `"Falha no cadastro: [object Object]"`, sem destaque no campo causador do erro.
- **Severidade e Prioridade:** Severidade Média | Prioridade Média.
- **Impacto para o Usuário e Negócio:** Barreira de usabilidade e violação de acessibilidade (WCAG 3.3.1). O usuário é incapaz de diagnosticar qual dado digitado causou a recusa, gerando desistência e queixas formais.
- **Proposta de Correção Futura:** Corrigir o bloco `catch` para exibir `err.message` no alerta geral e reativar a chamada utilitária `errosCampos(formNova, err.detalhes)`, que itera sobre as chaves do objeto e exibe cada mensagem ao lado do respectivo campo com `aria-invalid="true"`.

---

### DEF-04

- **ID do Defeito:** `DEF-04`
- **Título:** Histórico de alterações não aparece imediatamente após alteração de status.
- **Item Correspondente:** Item 5 — *Histórico que não aparece imediatamente após uma alteração de status*.
- **Por que foi Selecionado:** O histórico é o principal instrumento de conformidade, auditoria e prestação de contas dos atendimentos corporativos. Uma falha que omita a atualização da timeline gera sensação de perda de dados.
- **Caso de Teste Relacionado:** [`HOM-005`](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/docs/homologacao-01-casos-de-teste.md#hom-005)
- **Localização no Código-Fonte:**
  - Frontend: [public/js/detalhes.js:L128-L131](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/js/detalhes.js#L128-L131)
- **Causa Raiz Técnica (RCA):**
  - No fluxo de atualização de status, após o sucesso da requisição `PATCH /api/solicitacoes/:id/status`, a lista de eventos contida no container `<ol class="linha-tempo">` não é repopulada. O frontend não executa `api.get('/api/solicitacoes/:id/historico')` para anexar o novo evento ao DOM existente.
- **Passos para Reprodução:**
  1. Acessar `/admin.html` como `admin`.
  2. Abrir o modal de detalhes da solicitação ID 1.
  3. Mudar o status para "Resolvida", preencher comentário ("Equipamento reparado") e salvar.
  4. Rolar até a seção "Histórico de alterações" no diálogo.
- **Comportamento Esperado:** A linha do tempo exibe imediatamente o novo item com a data atual, autor e comentário inserido.
- **Comportamento Observado:** A linha do tempo permanece exatamente com os nós prévios à edição. O novo nó só aparece caso o operador feche o modal e clique novamente no botão "Atender / Status".
- **Severidade e Prioridade:** Severidade Média | Prioridade Média.
- **Impacto para o Usuário e Negócio:** Perda de rastreabilidade imediata. O analista de suporte não consegue confirmar visualmente se seu comentário técnico foi devidamente gravado no registro histórico do chamado.
- **Proposta de Correção Futura:** Recarregar o histórico completo via `api.get('/api/solicitacoes/:id/historico')` e reinserir o HTML retornado por `htmlHistorico(historico)` no elemento `#dlg-corpo`.

---

### DEF-05

- **ID do Defeito:** `DEF-05`
- **Título:** Indicador do painel administrativo apresenta total de chamados pendentes incorreto.
- **Item Correspondente:** Item 6 — *Indicador do painel administrativo que apresenta um total incorreto*.
- **Por que foi Selecionado:** Os painéis de controle e KPIs são vitais para a fase de Hypercare e dimensionamento de equipe. Uma métrica corrompida de "Pendentes" falseia os relatórios gerenciais e as metas de SLA.
- **Caso de Teste Relacionado:** [`HOM-006`](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/docs/homologacao-01-casos-de-teste.md#hom-006)
- **Localização no Código-Fonte:**
  - Backend: [server/routes/admin.js:L61](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/server/routes/admin.js#L61)
- **Causa Raiz Técnica (RCA):**
  - No endpoint `GET /api/admin/indicadores`, a composição do objeto JSON calculou o atributo `pendentes` apenas como:
    ```javascript
    pendentes: status['Aberta'],
    ```
    ignorando a adição dos chamados com status `Em atendimento` (`status['Aberta'] + status['Em atendimento']`).
- **Passos para Reprodução:**
  1. Ter na base de dados 2 chamados em status `Aberta` e 2 chamados em status `Em atendimento`.
  2. Efetuar login como `admin` e abrir `/admin.html`.
  3. Visualizar o número exibido no cartão "Pendentes".
- **Comportamento Esperado:** O cartão "Pendentes" deve somar chamados abertos e chamados em atendimento, apresentando o total de **4**.
- **Comportamento Observado:** O cartão apresenta o número **2**, ocultando metade da carga pendente da equipe.
- **Severidade e Prioridade:** Severidade Alta | Prioridade Alta.
- **Impacto para o Usuário e Negócio:** Visão distorcida da produtividade da TI. A gerência toma decisões orçamentárias e de escala de pessoal baseadas em números subestimados, resultando em descumprimento de prazos e acúmulo invisível de tickets.
- **Proposta de Correção Futura:** Restaurar a expressão de cálculo em `server/routes/admin.js`:
  ```javascript
  pendentes: (status['Aberta'] || 0) + (status['Em atendimento'] || 0),
  ```
