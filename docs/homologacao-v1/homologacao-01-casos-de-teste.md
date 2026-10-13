# Casos de Teste — Homologação 1 (ISRP)

**Documento:** `docs/homologacao-01-casos-de-teste.md`  
**Projeto:** ISRP — Sistema Integrado de Solicitações e Processos  
**Ciclo:** Homologação 1 (Versão com Defeitos Controlados)  
**Data:** 13 de Outubro de 2026  
**Ambiente de Execução:** `http://localhost:3000` | Banco: `isrp_homolog_db`  
**Responsável:** Analista de Qualidade de Software (QA)

---

## Índice dos Casos de Teste

| ID | Requisito | Título / Cenário | Status | Defeito Associado |
| :--- | :--- | :--- | :--- | :--- |
| [HOM-001](#hom-001) | RF-01 / RF-02 | Validação de campo obrigatório (descrição vazia) no cadastro | **REPROVADO** | [DEF-01](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/docs/homologacao-01-defeitos.md#def-01) |
| [HOM-002](#hom-002) | RF-01 / RF-02 | Cadastro de solicitação com dados válidos e persistência | **APROVADO** | — |
| [HOM-003](#hom-003) | RF-05 / RF-06 | Alteração de status e atualização visual da interface | **REPROVADO** | [DEF-02](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/docs/homologacao-01-defeitos.md#def-02) |
| [HOM-004](#hom-004) | RF-02 / Usabilidade | Exibição de mensagem de erro ao falhar validação na API | **REPROVADO** | [DEF-03](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/docs/homologacao-01-defeitos.md#def-03) |
| [HOM-005](#hom-005) | RF-06 | Exibição imediata de histórico após alteração de status | **REPROVADO** | [DEF-04](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/docs/homologacao-01-defeitos.md#def-04) |
| [HOM-006](#hom-006) | RF-07 | Cálculo do totalizador de pendentes nos indicadores admin | **REPROVADO** | [DEF-05](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/docs/homologacao-01-defeitos.md#def-05) |
| [HOM-007](#hom-007) | RF-03 | Autenticação, criação de sessão httpOnly e bloqueio de senha | **APROVADO** | — |
| [HOM-008](#hom-008) | RF-04 | Controle de Acesso Baseado em Papéis (RBAC em rota admin) | **APROVADO** | — |
| [HOM-009](#hom-009) | RF-08 | Filtragem dinâmica por status e consulta de dados | **APROVADO** | — |
| [HOM-010](#hom-010) | RF-09 | Healthcheck de infraestrutura e conectividade com MySQL | **APROVADO** | — |

---

### HOM-001

- **ID do Caso de Teste:** `HOM-001`
- **Requisito Relacionado:** `RF-01` (Abertura de Solicitações) e `RF-02` (Validação de Entradas Obrigatórias)
- **Pré-condições:** Usuário `ana.demo` autenticado no sistema; formulário de nova solicitação acessível em `/solicitacoes.html`.
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
  1. Acessar `/login.html` e autenticar com `ana.demo` / `Usuario@123`.
  2. Navegar até `/solicitacoes.html` e clicar em `+ Nova solicitação`.
  3. Preencher o Título com "Problema na inicialização da máquina".
  4. Selecionar Categoria "Suporte" e Prioridade "Média".
  5. Deixar o campo Descrição completamente em branco (`""`).
  6. Submeter o formulário clicando em "Registrar solicitação" ou disparar `POST /api/solicitacoes`.
- **Resultado Esperado:** O sistema deve impedir o envio tanto no frontend quanto no backend, retornando `HTTP 400 Bad Request` com a mensagem `"Descreva a solicitação com ao menos 10 caracteres."`. A solicitação **NÃO** deve ser salva no banco de dados.
- **Resultado Observado:** A requisição foi aceita pela API com `HTTP 201 Created` (`mensagem: "Solicitação ISRP-2026-00007 registrada com sucesso."`). O registro foi gravado na tabela `solicitacoes` com a descrição em branco.
- **Status:** **REPROVADO**
- **Evidência Disponível:**
  - Resposta HTTP: `201 Created`
  - Consulta SQL: `SELECT id, protocolo, titulo, descricao FROM solicitacoes WHERE id = 7;` -> Retornou registro gravado com campo `descricao` vazio (`""`).
  - Código defeituoso: [server/routes/solicitacoes.js:L77-L79](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/server/routes/solicitacoes.js#L77-L79) e [public/solicitacoes.html:L93](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/solicitacoes.html#L93).
- **Severidade:** Alta
- **Prioridade:** Alta
- **Impacto para o Usuário:** Chamados são criados sem nenhuma descrição do problema. Os técnicos da CST/MANUT recebem chamados vazios, gerando retrabalho, lentidão na triagem e impossibilidade de diagnóstico.

---

### HOM-002

- **ID do Caso de Teste:** `HOM-002`
- **Requisito Relacionado:** `RF-01` e `RF-02` (Cadastro Válido de Solicitações e Persistência)
- **Pré-condições:** Usuário `ana.demo` autenticado; serviços corporativos previamente cadastrados no banco.
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
  1. Autenticar como `ana.demo`.
  2. Acessar `/solicitacoes.html` e abrir o formulário.
  3. Preencher todos os campos com dados válidos conforme payload acima.
  4. Clicar em "Registrar solicitação".
- **Resultado Esperado:** Retorno `HTTP 201 Created`, atribuição de protocolo formatado sequencial (`ISRP-2026-XXXXX`), status inicial `Aberta`, e inserção do registro inicial na tabela `historico_solicitacoes`.
- **Resultado Observado:** Retorno `HTTP 201 Created` com protocolo gerado `ISRP-2026-00008` (ou sequencial), gravado com sucesso no MySQL com chave estrangeira vinculada ao serviço 4 e histórico inicial registrado.
- **Status:** **APROVADO**
- **Evidência Disponível:**
  - Resposta HTTP: `201 Created`
  - Consulta SQL: `SELECT s.id, s.protocolo, s.status, h.comentario FROM solicitacoes s JOIN historico_solicitacoes h ON h.solicitacao_id = s.id WHERE s.id = 8;`
- **Severidade:** Normal
- **Prioridade:** Normal
- **Impacto para o Usuário:** Fluxo principal de abertura de solicitações íntegras opera perfeitamente quando os campos estão preenchidos.

---

### HOM-003

- **ID do Caso de Teste:** `HOM-003`
- **Requisito Relacionado:** `RF-05` (Atendimento e Transição de Status) e `RF-06` (Interface do Atendente)
- **Pré-condições:** Administrador `admin` logado; solicitação ID 3 com status inicial `Aberta`.
- **Dados de Entrada:**
  ```json
  {
    "status": "Em atendimento",
    "comentario": "Técnico CST iniciando atendimento."
  }
  ```
- **Passos para Reprodução:**
  1. Autenticar como `admin` e acessar `/admin.html`.
  2. Localizar a solicitação `ISRP-2026-00003` na tabela e clicar em "Atender / Status".
  3. No modal de detalhes, selecionar o novo status "Em atendimento" e inserir o comentário.
  4. Clicar em "Salvar alteração".
  5. Observar o badge de status no topo do modal e a listagem da tabela principal ao fundo.
- **Resultado Esperado:** A API processa a mudança (`HTTP 200 OK`); o modal re-renderiza o badge de status para `Em atendimento`; a linha correspondente na tabela da página `/admin.html` atualiza o status de imediato.
- **Resultado Observado:** A API retorna `HTTP 200 OK` e atualiza o banco de dados. Contudo, na interface web (`public/js/detalhes.js`), o badge no topo do modal permanece estático como `Aberta`, e a tabela ao fundo também não é atualizada. O atendente tem a impressão de que a alteração não foi salva, a menos que feche o modal e recarregue a página (F5).
- **Status:** **REPROVADO**
- **Evidência Disponível:**
  - Resposta HTTP: `200 OK` (`mensagem: "Status alterado para \"Em atendimento\"."`).
  - Código defeituoso: [public/js/detalhes.js:L128-L131](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/js/detalhes.js#L128-L131), onde a chamada a `opcoes.onAtualizado(r)` e a re-renderização do modal foram suprimidas.
- **Severidade:** Média
- **Prioridade:** Alta
- **Impacto para o Usuário:** Falha de feedback visual no painel do operador. Atendentes clicam repetidas vezes no botão de salvar, gerando frustração e desconfiança na confiabilidade do sistema.

---

### HOM-004

- **ID do Caso de Teste:** `HOM-004`
- **Requisito Relacionado:** `RF-02` (Validação de Entradas) e Usabilidade / Acessibilidade de Formulários
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
  1. Acessar `/solicitacoes.html` e abrir o formulário de nova solicitação.
  2. Inserir no campo Título apenas 2 caracteres ("Oi" — viola o limite mínimo de 5 caracteres).
  3. Preencher os demais campos corretamente e clicar em "Registrar solicitação".
  4. Observar a mensagem de erro exibida na caixa de alerta `#mensagem-nova`.
- **Resultado Esperado:** Exibição de mensagem amigável e acessível: `"Verifique os campos destacados: O título deve ter entre 5 e 150 caracteres."`, acompanhada de marcação do campo inválido (`aria-invalid="true"`).
- **Resultado Observado:** O elemento de alerta `#mensagem-nova` exibiu literalmente a string: `"Falha no cadastro: [object Object]"`, ocultando completamente o motivo real do erro para o usuário final.
- **Status:** **REPROVADO**
- **Evidência Disponível:**
  - Resposta da API: `HTTP 400 Bad Request` com corpo `{ erro: "Verifique os campos destacados.", detalhes: { titulo: "O título deve ter entre 5 e 150 caracteres." } }`.
  - DOM Renderizado: `<div id="mensagem-nova" class="mensagem erro">Falha no cadastro: [object Object]</div>`.
  - Código defeituoso: [public/js/solicitacoes.js:L166-L169](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/js/solicitacoes.js#L166-L169).
- **Severidade:** Média
- **Prioridade:** Média
- **Impacto para o Usuário:** Usuários não conseguem entender por que sua solicitação não foi aceita, gerando abandono do formulário e aumento de ligações telefônicas para a central de suporte.

---

### HOM-005

- **ID do Caso de Teste:** `HOM-005`
- **Requisito Relacionado:** `RF-06` (Auditoria e Linha do Tempo de Histórico)
- **Pré-condições:** Administrador logado; solicitação ID 1 aberta no modal de detalhes.
- **Dados de Entrada:**
  ```json
  {
    "status": "Resolvida",
    "comentario": "Substituição de disco rígido concluída com sucesso."
  }
  ```
- **Passos para Reprodução:**
  1. Autenticar como `admin` e abrir o modal de detalhes da solicitação 1.
  2. Alterar o status para "Resolvida", preenchendo o comentário técnico.
  3. Submeter a alteração.
  4. Observar a seção "Histórico de alterações" (linha do tempo) dentro do modal aberto.
- **Resultado Esperado:** A linha do tempo recarrega instantaneamente, apresentando o novo nó cronológico contendo: `Aberta → Resolvida`, data/hora atual, nome do responsável e o comentário inserido.
- **Resultado Observado:** O histórico renderizado na tela permaneceu com os registros antigos. O novo evento foi persistido no MySQL, mas não é injetado no DOM do modal pós-submit. O operador só consegue visualizá-lo se fechar o diálogo e reabri-lo.
- **Status:** **REPROVADO**
- **Evidência Disponível:**
  - Resposta HTTP: `200 OK`
  - Banco de Dados: O registro foi inserido com sucesso na tabela `historico_solicitacoes`.
  - Código defeituoso: [public/js/detalhes.js:L128-L131](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/js/detalhes.js#L128-L131).
- **Severidade:** Média
- **Prioridade:** Média
- **Impacto para o Usuário:** Falta de feedback imediato de auditoria. O operador não tem certeza se seu comentário técnico foi anexado ao histórico do chamado.

---

### HOM-006

- **ID do Caso de Teste:** `HOM-006`
- **Requisito Relacionado:** `RF-07` (Painel Administrativo e Métricas de Atendimento)
- **Pré-condições:** Administrador autenticado; base de dados com chamados distribuídos entre status `Aberta`, `Em atendimento`, `Resolvida` e `Encerrada`.
- **Dados de Entrada:** Requisição `GET /api/admin/indicadores` com cookie de sessão de admin.
- **Passos para Reprodução:**
  1. Autenticar como `admin`.
  2. Acessar `/admin.html`.
  3. Inspecionar o valor exibido no cartão de KPI "Pendentes" (`#kpi-pendentes`).
  4. Comparar com o total de chamados nos status `Aberta` e `Em atendimento` na base de dados.
- **Resultado Esperado:** O cartão "Pendentes" e a API devem reportar o somatório exato de chamados em aberto e em atendimento (`pendentes = Aberta + Em atendimento`). No banco de teste com 2 abertas e 2 em atendimento, o total esperado é **4**.
- **Resultado Observado:** A API e o cartão na interface reportam **2**. A rota `/api/admin/indicadores` computou apenas `status['Aberta']`, ignorando integralmente os chamados em atendimento.
- **Status:** **REPROVADO**
- **Evidência Disponível:**
  - Resposta da API: `{ "total_solicitacoes": 7, "pendentes": 2, ... }`.
  - Consulta SQL de Auditoria:
    ```sql
    SELECT 
      SUM(status = 'Aberta') AS abertas,
      SUM(status = 'Em atendimento') AS em_atendimento,
      SUM(status IN ('Aberta', 'Em atendimento')) AS pendentes_reais
    FROM solicitacoes;
    ```
    -> Retornou `abertas = 2`, `em_atendimento = 2`, `pendentes_reais = 4`.
  - Código defeituoso: [server/routes/admin.js:L61](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/server/routes/admin.js#L61).
- **Severidade:** Alta
- **Prioridade:** Alta
- **Impacto para o Usuário:** Tomada de decisão gerencial comprometida. O gestor da TI subdimensiona a carga real da equipe, acreditando haver metade da fila pendente que realmente existe.

---

### HOM-007

- **ID do Caso de Teste:** `HOM-007`
- **Requisito Relacionado:** `RF-03` (Autenticação e Sessão de Usuários)
- **Pré-condições:** Servidor em execução; credenciais cadastradas na tabela `usuarios`.
- **Dados de Entrada:**
  - Cenário A (Válido): `{ "login": "ana.demo", "senha": "Usuario@123" }`
  - Cenário B (Inválido): `{ "login": "ana.demo", "senha": "SenhaErrada123" }`
- **Passos para Reprodução:**
  1. Enviar requisição `POST /api/auth/login` com o Cenário A.
  2. Verificar status retornado e presença do cabeçalho `set-cookie: isrp.sid`.
  3. Enviar requisição `POST /api/auth/login` com o Cenário B.
  4. Verificar status de rejeição.
  5. Consultar `GET /api/auth/sessao` com o cookie da sessão válida.
- **Resultado Esperado:** Cenário A retorna `HTTP 200 OK` com cookie de sessão `HttpOnly`, `SameSite=lax`; Cenário B retorna `HTTP 401 Unauthorized` com mensagem `"Usuário ou senha inválidos."`; `GET /api/auth/sessao` retorna `{ autenticado: true, usuario: ... }`.
- **Resultado Observado:** Cenário A retornou `HTTP 200 OK` com cookie de sessão seguro; Cenário B retornou `HTTP 401` com mensagem genérica de segurança; validação de sessão retornou status de autenticado verdadeiro.
- **Status:** **APROVADO**
- **Evidência Disponível:**
  - HTTP 200 no login válido, HTTP 401 no login inválido.
  - Cookie de sessão recebido: `isrp.sid=...; Path=/; HttpOnly; SameSite=Lax`.
- **Severidade:** Crítica
- **Prioridade:** Alta
- **Impacto para o Usuário:** Mecanismo de segurança e login funciona de acordo com as melhores práticas OWASP.

---

### HOM-008

- **ID do Caso de Teste:** `HOM-008`
- **Requisito Relacionado:** `RF-04` (Controle de Acesso Baseado em Papéis - RBAC)
- **Pré-condições:** Usuário comum `ana.demo` (`perfil: usuario`) logado.
- **Dados de Entrada:** Requisição `GET /api/admin/indicadores` com cookie de sessão de `ana.demo`.
- **Passos para Reprodução:**
  1. Autenticar como `ana.demo`.
  2. Tentar acessar via API o endpoint `/api/admin/indicadores`.
  3. Tentar acessar a página `/admin.html` no navegador.
- **Resultado Esperado:** O backend deve interceptar a requisição e retornar `HTTP 403 Forbidden` com a mensagem `"Acesso restrito a administradores."`. Na página HTML, o middleware `protegerPagina({ admin: true })` deve redirecionar para `/solicitacoes.html?negado=1`.
- **Resultado Observado:** A requisição da API retornou `HTTP 403 Forbidden` com `{ erro: "Acesso restrito a administradores." }`. O acesso indevido foi rigorosamente barrado.
- **Status:** **APROVADO**
- **Evidência Disponível:**
  - Código HTTP: `403 Forbidden`
  - Resposta JSON: `{"erro":"Acesso restrito a administradores."}`
  - Middleware: [server/middleware/auth.js:L15-L23](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/server/middleware/auth.js#L15-L23).
- **Severidade:** Crítica
- **Prioridade:** Alta
- **Impacto para o Usuário:** Garante que usuários comuns não visualizem dados gerenciais ou alterem status de chamados de terceiros.

---

### HOM-009

- **ID do Caso de Teste:** `HOM-009`
- **Requisito Relacionado:** `RF-08` (Filtros e Busca de Solicitações)
- **Pré-condições:** Usuário administrador logado; solicitações em múltiplos status na base.
- **Dados de Entrada:** `GET /api/solicitacoes?status=Aberta`
- **Passos para Reprodução:**
  1. Autenticar como `admin`.
  2. Disparar `GET /api/solicitacoes?status=Aberta`.
  3. Analisar todos os itens da lista JSON retornada.
- **Resultado Esperado:** Todos os itens retornados devem possuir estritamente `status === "Aberta"`.
- **Resultado Observado:** A API retornou os registros correspondentes, todos com `status: "Aberta"`, ordenados por data de criação decrescente.
- **Status:** **APROVADO**
- **Evidência Disponível:**
  - Resposta HTTP: `200 OK`
  - Total de registros retornados: 2 registros, ambos com o status correto.
- **Severidade:** Normal
- **Prioridade:** Normal
- **Impacto para o Usuário:** Atendentes e usuários conseguem filtrar chamados com agilidade.

---

### HOM-010

- **ID do Caso de Teste:** `HOM-010`
- **Requisito Relacionado:** `RF-09` (Infraestrutura, Healthcheck e Integridade de Conexão)
- **Pré-condições:** Servidor Express ativo; instância MySQL em execução.
- **Dados de Entrada:** Requisição `GET /api/health`
- **Passos para Reprodução:**
  1. Enviar requisição `GET /api/health` sem autenticação.
  2. Verificar payload de resposta e código HTTP.
- **Resultado Esperado:** `HTTP 200 OK` com JSON `{ status: "ok", banco: "conectado", horario: "..." }`.
- **Resultado Observado:** Retorno `HTTP 200 OK` em 8ms com status "ok" e banco "conectado".
- **Status:** **APROVADO**
- **Evidência Disponível:**
  - Código HTTP: `200 OK`
  - Resposta: `{"status":"ok","banco":"conectado","horario":"2026-10-13T18:28:20.100Z"}`
- **Severidade:** Normal
- **Prioridade:** Normal
- **Impacto para o Usuário:** Monitoramento de saúde e prontidão da aplicação funcional para Hypercare.

---

## Resumo Estatístico dos Casos de Teste

| Categoria | Quantidade | Percentual |
| :--- | :--- | :--- |
| **Total de Casos de Teste** | **10** | **100%** |
| **Aprovados** | **5** | **50%** |
| **Reprovados** | **5** | **50%** |
| **Pendentes** | **0** | **0%** |
