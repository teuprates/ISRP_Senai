# Casos de Teste — Homologação 2 (ISRP - Pós-Correção)

**Documento:** `docs/homologacao-02-casos-de-teste.md`  
**Projeto:** ISRP — Sistema Integrado de Solicitações e Processos  
**Ciclo:** Homologação 2 (Validação Final e Regressão)  
**Data da Execução:** 13 de Outubro de 2026  
**Ambiente de Execução:** `http://localhost:3000` | Banco: `isrp_homolog_db`  
**Responsável:** Analista de Qualidade de Software (QA)  
**Branch de Teste:** `homologacao-corrigida` (Commit `1fc7ec5`)

---

## Índice Consolidado da Segunda Rodada de Testes

| ID | Requisito | Cenário Testado | Status Rodada 1 | Status Rodada 2 | Comparação / Diagnóstico |
| :--- | :--- | :--- | :---: | :---: | :--- |
| [HOM-001](#hom-001) | RF-01 / RF-02 | Validação de campo obrigatório (descrição vazia) | REPROVADO | **APROVADO** | Defeito DEF-01 corrigido; validação bloqueou com 400. |
| [HOM-002](#hom-002) | RF-01 / RF-02 | Cadastro de solicitação válida e persistência | APROVADO | **APROVADO** | Sem regressão; fluxo principal mantido íntegro (201). |
| [HOM-003](#hom-003) | RF-05 / RF-06 | Alteração de status e atualização visual da interface | REPROVADO | **APROVADO** | Defeito DEF-02 corrigido; badge e grid atualizados no DOM. |
| [HOM-004](#hom-004) | RF-02 / Usab. | Exibição de mensagem de erro legível ao falhar API | REPROVADO | **APROVADO** | Defeito DEF-03 corrigido; texto claro e errosCampos ativos. |
| [HOM-005](#hom-005) | RF-06 | Exibição imediata de histórico pós-alteração de status | REPROVADO | **APROVADO** | Defeito DEF-04 corrigido; timeline atualiza de imediato. |
| [HOM-006](#hom-006) | RF-07 | Cálculo do KPI de pendentes (Aberta + Em atendimento) | REPROVADO | **APROVADO** | Defeito DEF-05 corrigido; métrica 100% aderente ao SQL. |
| [HOM-007](#hom-007) | RF-03 | Autenticação, sessão httpOnly e bloqueio de senha | APROVADO | **APROVADO** | Sem regressão; segurança bcrypt e sessão intactas. |
| [HOM-008](#hom-008) | RF-04 | Controle de Acesso Baseado em Papéis (RBAC em rota admin) | APROVADO | **APROVADO** | Sem regressão; bloqueio 403 Forbidden estritamente ativo. |
| [HOM-009](#hom-009) | RF-08 | Filtragem dinâmica por status e consulta de dados | APROVADO | **APROVADO** | Sem regressão; consultas e filtros retornam dados exatos. |
| [HOM-010](#hom-010) | RF-09 | Healthcheck de infraestrutura e conectividade com MySQL | APROVADO | **APROVADO** | Sem regressão; /api/health responde 200 em tempo recorde. |

---

### HOM-001

- **ID do Caso de Teste:** `HOM-001`
- **Requisito Relacionado:** `RF-01` e `RF-02` (Abertura de Solicitações e Validação de Entradas Obrigatórias)
- **Tipo de Teste:** Funcional / Validação Negativa de API e Interface
- **Pré-condições:** Usuário `ana.demo` autenticado; formulário aberto em `/solicitacoes.html`.
- **Dados de Entrada:**
  ```json
  {
    "titulo": "Problema na inicialização da máquina",
    "descricao": "",
    "categoria": "Suporte",
    "prioridade": "Média"
  }
  ```
- **Passos para Reprodução:**
  1. Acessar `/login.html` como `ana.demo` / `Usuario@123`.
  2. Acessar `/solicitacoes.html` e abrir o formulário.
  3. Preencher Título com texto válido, Categoria com "Suporte", Prioridade com "Média".
  4. Deixar o campo Descrição vazio (`""`).
  5. Tentar submeter o formulário ou despachar requisição `POST /api/solicitacoes`.
- **Resultado Esperado:** O sistema deve impedir o registro, retornando `HTTP 400 Bad Request` com o erro de validação `"Descreva a solicitação com ao menos 10 caracteres."`. Nenhum registro deve ser criado na tabela `solicitacoes`.
- **Resultado Observado após a Correção:**
  - A API retornou `HTTP 400 Bad Request` com corpo:
    ```json
    {
      "erro": "Verifique os campos destacados.",
      "detalhes": {
        "descricao": "Descreva a solicitação com ao menos 10 caracteres."
      }
    }
    ```
  - Consulta de auditoria no MySQL confirmou zero registros criados (`COUNT(*) = 0` para o título informado).
- **Status:** **APROVADO**
- **Evidência Disponível:**
  - Código HTTP: `400 Bad Request`
  - Consulta SQL: `SELECT COUNT(*) FROM solicitacoes WHERE titulo = 'Problema na inicialização da máquina';` -> Retorno: `0`.
  - Código corrigido: [server/routes/solicitacoes.js:L78](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/server/routes/solicitacoes.js#L78).
- **Comparação com a Rodada 1:** Na Rodada 1 o sistema aceitava indevidamente o payload vazio (`HTTP 201 Created`), gerando registro nulo (REPROVADO). Na Rodada 2, a validação de fronteira barrou a submissão conforme especificado (APROVADO).

---

### HOM-002

- **ID do Caso de Teste:** `HOM-002`
- **Requisito Relacionado:** `RF-01` e `RF-02` (Cadastro Válido de Solicitações e Persistência)
- **Tipo de Teste:** Integração / Persistência no Banco (Teste de Regressão)
- **Pré-condições:** Usuário `ana.demo` autenticado.
- **Dados de Entrada:**
  ```json
  {
    "titulo": "Instalação do pacote de modelagem homologado",
    "descricao": "Solicito a instalação do software AutoCAD homologado pelo setor de infraestrutura.",
    "categoria": "Software",
    "prioridade": "Alta",
    "servico_id": 4
  }
  ```
- **Passos para Reprodução:**
  1. Submeter solicitação com todos os campos válidos via formulário ou API `POST /api/solicitacoes`.
- **Resultado Esperado:** `HTTP 201 Created`, geração de protocolo sequencial (`ISRP-2026-XXXXX`), status inicial `Aberta` e inserção do registro inicial em `historico_solicitacoes`.
- **Resultado Observado após a Correção:**
  - A API retornou `HTTP 201 Created` com protocolo gerado com sucesso.
  - Registro gravado na tabela `solicitacoes` com status `Aberta` e histórico inicial registrado.
- **Status:** **APROVADO**
- **Evidência Disponível:**
  - Resposta HTTP: `201 Created`
  - Consulta SQL: Registro validado com chave estrangeira vinculada ao setor de Infraestrutura.
- **Comparação com a Rodada 1:** Manteve o comportamento íntegro e aprovado em ambas as rodadas. A correção do DEF-01 não causou nenhuma regressão no cadastro legítimo.

---

### HOM-003

- **ID do Caso de Teste:** `HOM-003`
- **Requisito Relacionado:** `RF-05` e `RF-06` (Alteração de Status e Atualização Visual da Interface)
- **Tipo de Teste:** Integração Frontend-API / Sincronização de Estado
- **Pré-condições:** Usuário `admin` autenticado; chamado ID 3 com status inicial `Aberta`.
- **Dados de Entrada:**
  ```json
  {
    "status": "Em atendimento",
    "comentario": "Técnico CST iniciando atendimento após validação."
  }
  ```
- **Passos para Reprodução:**
  1. No painel admin (`/admin.html`), abrir o modal do chamado ID 3.
  2. Alterar o status para "Em atendimento" e clicar em "Salvar alteração".
  3. Observar o badge de status no topo do modal e a grade da tabela ao fundo.
- **Resultado Esperado:** API responde `200 OK`; modal recarrega o badge de status para "Em atendimento"; tabela na página ao fundo atualiza a coluna de status sem necessidade de recarregar a página com F5.
- **Resultado Observado após a Correção:**
  - A API respondeu `HTTP 200 OK` e atualizou o banco para `Em atendimento`.
  - O código corrigido de [public/js/detalhes.js:L128](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/js/detalhes.js#L128) executou `opcoes.onAtualizado(r)` e `await abrir(id, ...)`.
  - O modal re-renderizou o cabeçalho exibindo `<span class="badge status-em-atendimento">Em atendimento</span>` acompanhado da mensagem verde de sucesso, e a grade ao fundo teve seus dados sincronizados.
- **Status:** **APROVADO**
- **Evidência Disponível:**
  - Resposta HTTP: `200 OK` com `solicitacao.status: "Em atendimento"`.
  - Consulta SQL: `SELECT status FROM solicitacoes WHERE id = 3;` -> Retornou `'Em atendimento'`.
- **Comparação com a Rodada 1:** Na Rodada 1 o badge de status e a grade permaneciam congelados no estado anterior (REPROVADO). Na Rodada 2, a sincronização de estado repintou os elementos no DOM imediatamente (APROVADO).

---

### HOM-004

- **ID do Caso de Teste:** `HOM-004`
- **Requisito Relacionado:** `RF-02` e Usabilidade / Acessibilidade de Formulários
- **Tipo de Teste:** Interface / Tratamento de Erro e Acessibilidade
- **Pré-condições:** Usuário logado em `/solicitacoes.html`.
- **Dados de Entrada:**
  ```json
  {
    "titulo": "Oi",
    "descricao": "Descrição detalhada do incidente ocorrido na estação de trabalho.",
    "categoria": "Suporte",
    "prioridade": "Média"
  }
  ```
- **Passos para Reprodução:**
  1. Preencher Título com apenas 2 caracteres ("Oi" — viola o mínimo de 5).
  2. Preencher os demais campos e submeter o formulário.
  3. Observar a caixa de alerta `#mensagem-nova` e o campo Título.
- **Resultado Esperado:** Mensagem clara e amigável: `"Verifique os campos destacados."` no alerta geral, acompanhada de parágrafo explicativo `<p class="erro-campo">O título deve ter entre 5 e 150 caracteres.</p>` e contorno em vermelho com foco no campo (`aria-invalid="true"`).
- **Resultado Observado após a Correção:**
  - A API retornou `HTTP 400 Bad Request`.
  - O frontend exibiu no alerta geral o texto `"Verifique os campos destacados."` e a função utilitária `errosCampos` inseriu a mensagem descritiva no campo Título com `aria-invalid="true"`. A anomalia da string `[object Object]` foi totalmente eliminada.
- **Status:** **APROVADO**
- **Evidência Disponível:**
  - Resposta HTTP: `400 Bad Request` com detalhes estruturados.
  - Código corrigido: [public/js/solicitacoes.js:L167-L168](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/js/solicitacoes.js#L167-L168).
- **Comparação com a Rodada 1:** Na Rodada 1 o erro era renderizado como `"Falha no cadastro: [object Object]"` sem indicação visual no campo (REPROVADO). Na Rodada 2, o tratamento de erro opera com clareza e acessibilidade (APROVADO).

---

### HOM-005

- **ID do Caso de Teste:** `HOM-005`
- **Requisito Relacionado:** `RF-06` (Auditoria e Linha do Tempo de Histórico)
- **Tipo de Teste:** Interface / Histórico e Auditoria
- **Pré-condições:** Administrador autenticado; chamado ID 1 aberto no modal.
- **Dados de Entrada:**
  ```json
  {
    "status": "Resolvida",
    "comentario": "Substituição de disco rígido concluída e validada."
  }
  ```
- **Passos para Reprodução:**
  1. Como admin, abrir o modal de detalhes da solicitação 1.
  2. Mudar o status para "Resolvida", preencher o comentário e salvar.
  3. Observar a seção "Histórico de alterações" no diálogo.
- **Resultado Esperado:** A linha do tempo recarrega instantaneamente e exibe o novo registro contendo data/hora atual, autor e comentário.
- **Resultado Observado após a Correção:**
  - A requisição `PATCH` concluiu com sucesso (`HTTP 200`).
  - A função `abrir(id)` buscou `/api/solicitacoes/1/historico` e reconstruiu a lista `<ol class="linha-tempo">` no DOM com o novo item visível de imediato.
- **Status:** **APROVADO**
- **Evidência Disponível:**
  - Resposta da API: Consulta de histórico retornou a lista atualizada com o evento gravado.
  - Consulta SQL: Registro confirmado em `historico_solicitacoes`.
- **Comparação com a Rodada 1:** Na Rodada 1 o histórico permanecia estático no modal exigindo fechar e reabrir (REPROVADO). Na Rodada 2 a lista de eventos atualiza de forma reativa (APROVADO).

---

### HOM-006

- **ID do Caso de Teste:** `HOM-006`
- **Requisito Relacionado:** `RF-07` (Métricas de Atendimento e Painel Admin)
- **Tipo de Teste:** Backend / Integridade de Indicadores e Cálculos Agregados
- **Pré-condições:** Administrador autenticado; chamados distribuídos entre status `Aberta` e `Em atendimento`.
- **Dados de Entrada:** Requisição `GET /api/admin/indicadores` com cookie de sessão de admin.
- **Passos para Reprodução:**
  1. Requisitar `/api/admin/indicadores` e inspecionar a propriedade `pendentes`.
  2. Comparar com a consulta SQL: `SELECT COUNT(*) FROM solicitacoes WHERE status IN ('Aberta', 'Em atendimento');`.
- **Resultado Esperado:** O valor retornado pela API e renderizado no cartão `#kpi-pendentes` deve ser exatamente a soma de chamados abertos e em atendimento (`pendentes = Aberta + Em atendimento`).
- **Resultado Observado após a Correção:**
  - Na base de homologação com 2 chamados em `Aberta` e 2 chamados em `Em atendimento`, a API retornou:
    `"pendentes": 4`.
  - A consulta relacional confirmou exatamente 4 registros pendentes (`SUM(status IN ('Aberta', 'Em atendimento')) = 4`).
- **Status:** **APROVADO**
- **Evidência Disponível:**
  - Resposta da API: `{ "total_solicitacoes": 7, "pendentes": 4, "abertas_hoje": 0, ... }`.
  - Código corrigido: [server/routes/admin.js:L61](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/server/routes/admin.js#L61).
- **Comparação com a Rodada 1:** Na Rodada 1 a API retornava 2 porque ignorava os chamados em atendimento (REPROVADO). Na Rodada 2 o cálculo soma ambos os status perfeitamente (APROVADO).

---

### HOM-007

- **ID do Caso de Teste:** `HOM-007`
- **Requisito Relacionado:** `RF-03` (Autenticação e Sessão de Usuários)
- **Tipo de Teste:** Segurança / Autenticação (Teste de Regressão)
- **Pré-condições:** Usuário cadastrado no MySQL.
- **Dados de Entrada:** Login válido (`ana.demo` / `Usuario@123`) e inválido (`ana.demo` / `SenhaIncorreta999`).
- **Passos para Reprodução:**
  1. Enviar login válido e verificar cookie `isrp.sid`.
  2. Enviar login inválido e verificar resposta de erro 401.
  3. Consultar `/api/auth/sessao`.
- **Resultado Esperado:** Login válido aceito com cookie `HttpOnly; SameSite=Lax`; login inválido rejeitado com 401 sem vazar detalhes; sessão confirmada com perfil `usuario`.
- **Resultado Observado após a Correção:** Login válido respondeu `HTTP 200 OK` gerando cookie protegido; login inválido rejeitado com `HTTP 401` (`"Usuário ou senha inválidos."`); sessão validada com sucesso.
- **Status:** **APROVADO**
- **Comparação com a Rodada 1:** Manteve status APROVADO em ambas as rodadas. Nenhuma quebra de segurança após as correções.

---

### HOM-008

- **ID do Caso de Teste:** `HOM-008`
- **Requisito Relacionado:** `RF-04` (Controle de Acesso Baseado em Papéis - RBAC)
- **Tipo de Teste:** Segurança / Autorização (Teste de Regressão)
- **Pré-condições:** Usuário comum `ana.demo` autenticado.
- **Dados de Entrada:** Requisição `GET /api/admin/indicadores` com sessão de usuário comum.
- **Passos para Reprodução:**
  1. Tentar acessar endpoint restrito a administradores com cookie de usuário comum.
- **Resultado Esperado:** Interceptação imediata pelo middleware com `HTTP 403 Forbidden` (`"Acesso restrito a administradores."`).
- **Resultado Observado após a Correção:** A API retornou `HTTP 403 Forbidden` com `{ erro: "Acesso restrito a administradores." }`.
- **Status:** **APROVADO**
- **Comparação com a Rodada 1:** Manteve status APROVADO em ambas as rodadas. Permissões RBAC intactas.

---

### HOM-009

- **ID do Caso de Teste:** `HOM-009`
- **Requisito Relacionado:** `RF-08` (Filtros Dinâmicos e Listagem de Solicitações)
- **Tipo de Teste:** Funcional / Consultas Parametrizadas (Teste de Regressão)
- **Pré-condições:** Administrador autenticado.
- **Dados de Entrada:** `GET /api/solicitacoes?status=Aberta`
- **Passos para Reprodução:**
  1. Requisitar listagem filtrada por status.
  2. Verificar se todos os itens possuem status correspondente.
- **Resultado Esperado:** Lista contendo apenas chamados com status `Aberta`.
- **Resultado Observado após a Correção:** `HTTP 200 OK` retornando registros que cumprem estritamente o filtro aplicado.
- **Status:** **APROVADO**
- **Comparação com a Rodada 1:** Manteve status APROVADO em ambas as rodadas. Sem regressão.

---

### HOM-010

- **ID do Caso de Teste:** `HOM-010`
- **Requisito Relacionado:** `RF-09` (Infraestrutura, Healthcheck e Integridade de Conexão)
- **Tipo de Teste:** Não-Funcional / Prontidão Operacional (Teste de Regressão)
- **Pré-condições:** Servidor Node e pool MySQL ativos.
- **Dados de Entrada:** `GET /api/health`
- **Passos para Reprodução:**
  1. Enviar requisição GET para rota de saúde.
- **Resultado Esperado:** `HTTP 200 OK` com `{ status: "ok", banco: "conectado" }`.
- **Resultado Observado após a Correção:** `HTTP 200 OK` respondendo em 1ms com status `"ok"` e banco `"conectado"`.
- **Status:** **APROVADO**
- **Comparação com a Rodada 1:** Manteve status APROVADO em ambas as rodadas. Sem regressão de infraestrutura.

---

## Resumo Estatístico Comparativo

| Métrica | Rodada 1 (Com Defeitos) | Rodada 2 (Pós-Correção) | Evolução |
| :--- | :---: | :---: | :---: |
| **Total de Testes** | 10 | 10 | — |
| **Aprovados** | 5 (50%) | **10 (100%)** | **+50%** |
| **Reprovados** | 5 (50%) | **0 (0%)** | **-50%** |
| **Pendentes** | 0 (0%) | **0 (0%)** | — |
