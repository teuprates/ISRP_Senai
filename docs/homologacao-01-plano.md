# Plano de Homologação 1 — Sistema ISRP

**Documento:** `docs/homologacao-01-plano.md`  
**Projeto:** ISRP — Sistema Integrado de Solicitações e Processos (SENAI Serviços Digitais — Acadêmico/Fictício)  
**Ciclo:** Homologação 1 (Versão com Defeitos Controlados)  
**Data:** 13 de Outubro de 2026  
**Responsável:** Analista de Qualidade de Software (QA)  
**Branch do Repositório:** `homologacao-com-defeitos`  
**Versão Sob Teste:** `v1.0.0-homologacao-com-defeitos` (Commit base: `af86a96`, Commit de homologação: `35fefd8`)

---

## 1. Introdução e Objetivo

O presente Plano de Homologação define as diretrizes, a abrangência, os critérios e o cronograma de execução dos testes da **Homologação 1** do sistema **ISRP (Sistema Integrado de Solicitações e Processos)**.

O objetivo primordial desta etapa é submeter o sistema a uma bateria de testes funcionais, de integração e de persistência relacional em ambiente controlado e isolado, identificando formalmente defeitos reproduzíveis, mapeando seus impactos na operação do usuário e da equipe técnica, e emitindo um parecer fundamentado sobre a maturidade da versão.

Esta etapa constitui uma **simulação acadêmica rigorosa** de uma primeira entrega de desenvolvimento, na qual defeitos controlados foram introduzidos e auditados para exercitar os processos de garantia de qualidade (QA), rastreabilidade de requisitos e análise de causa-raiz.

---

## 2. Escopo dos Testes

### 2.1. Módulos e Funcionalidades Incluídos

| Módulo | Funcionalidades Avaliadas | Requisitos Associados |
| :--- | :--- | :--- |
| **Autenticação & Sessão** | Login de usuários e administradores, criação e validação de cookie de sessão (`isrp.sid`), logout e bloqueio de credenciais incorretas. | RF-03 |
| **Controle de Acesso (RBAC)** | Bloqueio de acesso a páginas e rotas restritas a administradores por usuários comuns (`perfil: usuario`). | RF-04 |
| **Cadastro de Solicitações** | Formulário de abertura de chamados, preenchimento de campos obrigatórios, regras de tamanho mínimo/máximo e validações de serviço/categoria. | RF-01, RF-02 |
| **Listagem & Filtros** | Consulta de solicitações abertas, filtragem por status (`Aberta`, `Em atendimento`, etc.), prioridade e termo de busca textual. | RF-08 |
| **Atendimento & Workflow** | Visualização do modal de detalhes, alteração de status por atendentes administradores, regras de transição permitidas. | RF-05, RF-06 |
| **Histórico & Auditoria** | Registro cronológico de alterações de status com autor, data/hora e justificativa textual. | RF-06 |
| **Painel Administrativo (KPIs)** | Consolidação de indicadores gerenciais (Total de solicitações, pendentes, chamados do dia, SLA e tempo médio). | RF-07 |
| **Infraestrutura & Persistência** | Conectividade com banco MySQL 8, rota de healthcheck (`/api/health`), transações atômicas e integridade referencial. | RF-09 |

### 2.2. Fora do Escopo

- Testes de estresse de volumetria maciça (acima de 5.000 requisições simultâneas).
- Testes de penetração maliciosa (o escopo restringe-se a defeitos funcionais e de usabilidade; a infraestrutura de segurança e senhas criptografadas em bcrypt foram intencionalmente preservadas intactas).
- Modificação ou escrita no banco de produção original `isrp_db`.

---

## 3. Ambiente e Configuração de Testes

### 3.1. Arquitetura e Stack Técnica

- **Linguagem / Runtime:** Node.js (v18+)
- **Framework Web:** Express.js 5.3 (rotas RESTful em JSON, sessões `express-session`)
- **Banco de Dados:** MySQL 8.x (mecanismo InnoDB, transações ACID, chaves estrangeiras com integridade relacional)
- **Frontend:** HTML5 semântico, Vanilla CSS moderno, JavaScript Vanilla modular assíncrono (Fetch API)
- **Sistema Operacional:** Windows 11

### 3.2. Isolamento de Ambiente

Para respeitar as diretrizes de integridade e não afetar ambientes ou dados originais sem autorização:
1. **Branch de Controle:** Foi criada e isolada a branch Git `homologacao-com-defeitos`, preservando a versão limpa funcional na branch `main` e no arquivo de backup `ISRP.zip`.
2. **Banco de Dados Dedicado:** Foi instanciado o esquema de banco isolado `isrp_homolog_db`, criado via script automatizado com dados fictícios de demonstração. O arquivo `.env` do ambiente de testes aponta exclusivamente para:
   ```properties
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_NAME=isrp_homolog_db
   ```
3. **Dados Fictícios de Usuários:**
   - **Administrador:** `admin` / `Admin@123` (perfil `admin`, ID 1)
   - **Usuário 1:** `ana.demo` / `Usuario@123` (perfil `usuario`, ID 2)
   - **Usuário 2:** `bruno.demo` / `Usuario@123` (perfil `usuario`, ID 3)

---

## 4. Defeitos Selecionados para a Homologação 1

Conforme as diretrizes da Homologação 1, foram selecionados **5 defeitos controlados** a partir dos cenários compatíveis com o código existente:

1. **DEF-01 (Opção 1):** Validação incompleta de campos obrigatórios no cadastro de solicitações (aceite de descrição em branco).
2. **DEF-02 (Opção 2):** Falha na atualização visual do status depois de uma resposta válida da API no modal de atendimento.
3. **DEF-03 (Opção 4):** Mensagem de erro inadequada quando a API retorna uma falha de validação (exibição de `[object Object]`).
4. **DEF-04 (Opção 5):** Histórico que não aparece imediatamente após uma alteração de status.
5. **DEF-05 (Opção 6):** Indicador do painel administrativo que apresenta um total incorreto (métrica de chamados pendentes).

A justificativa técnica e o mapeamento detalhado de cada defeito encontram-se registrados em [docs/homologacao-01-defeitos.md](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/docs/homologacao-01-defeitos.md).

---

## 5. Estratégia de Execução dos Testes

### 5.1. Níveis de Teste

1. **Testes Funcionais de Caixa-Preta (Frontend & API):** Verificação de comportamento do ponto de vista do usuário final e do atendente.
2. **Testes de Integração Frontend <-> Backend:** Verificação dos contratos de API REST (códigos de status HTTP, payloads de envio e retorno, manipulação de erros).
3. **Testes de Persistência e Integridade de Dados:** Consultas diretas ao MySQL para confirmar se as transações foram efetivamente gravadas com consistência relacional.

### 5.2. Critérios de Avaliação

- **APROVADO:** O comportamento observado corresponde integralmente ao resultado esperado documentado na especificação de requisitos.
- **REPROVADO:** O comportamento observado diverge do resultado esperado, apresentando falha de validação, erro de cálculo, congelamento de interface ou inconsistência no banco de dados.
- **PENDENTE:** O caso de teste não pôde ser executado devido a indisponibilidade de ambiente ou ferramentas auxiliares (devendo ser acompanhado de justificativa e guia de execução manual).

### 5.3. Critérios de Liberação para Produção

- **Taxa Mínima de Aprovação:** 100% dos Casos de Teste de Severidade Crítica e Alta.
- **Defeitos Tolerados:** Zero defeitos de severidade Crítica ou Alta.
- **Resultado Esperado desta Homologação 1:** **REPROVAÇÃO DA VERSÃO**, comprovando a capacidade da equipe de QA de barrar entregas imaturas antes da fase de Hypercare ou implantação em produção.

---

## 6. Matriz de Rastreabilidade de Requisitos

| Caso de Teste | Requisito Relacionado | Descrição do Caso de Teste | Status Previsto |
| :--- | :--- | :--- | :--- |
| `HOM-001` | RF-01 / RF-02 | Validação de campo obrigatório (descrição vazia) | REPROVADO (DEF-01) |
| `HOM-002` | RF-01 / RF-02 | Cadastro de solicitação com dados válidos e persistência | APROVADO |
| `HOM-003` | RF-05 / RF-06 | Alteração de status pelo Admin e atualização visual imediata | REPROVADO (DEF-02) |
| `HOM-004` | RF-02 / Usabilidade | Mensagem de erro em falha de validação na API | REPROVADO (DEF-03) |
| `HOM-005` | RF-06 | Exibição imediata de histórico pós-alteração de status | REPROVADO (DEF-04) |
| `HOM-006` | RF-07 | Totalizador de solicitações pendentes no Painel Admin | REPROVADO (DEF-05) |
| `HOM-007` | RF-03 | Autenticação, geração de cookie httpOnly e bloqueio | APROVADO |
| `HOM-008` | RF-04 | Controle de Acesso Baseado em Papéis (RBAC) | APROVADO |
| `HOM-009` | RF-08 | Filtragem dinâmica por status e busca textual | APROVADO |
| `HOM-010` | RF-09 | Healthcheck de infraestrutura e persistência relacional | APROVADO |
