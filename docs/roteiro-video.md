# Roteiro para Gravação de Vídeo de Apresentação (3 Minutos) — Sistema ISRP

**Documento:** `docs/roteiro-video.md`  
**Projeto:** ISRP — Sistema Integrado de Solicitações e Processos (SENAI Serviços Digitais — Acadêmico/Fictício)  
**Tema:** Apresentação da Arquitetura, Homologação com Defeitos, Correções, Validação Final, Hypercare e Handover  
**Duração Total:** **03:00 (180 segundos)** — Formato condensado, direto e dinâmico  
**Público-Alvo:** Banca examinadora, avaliadores acadêmicos e stakeholders

---

## Orientações Rápidas de Gravação

1. **Janelas Pré-abertas:**
   - Navegador aba 1: `http://localhost:3000/home.html` (desconectado).
   - Navegador aba 2: `http://localhost:3000/admin.html` (logado como `admin`).
   - Navegador aba 3: `http://localhost:3000/solicitacoes.html` (logado como `ana.demo`).
   - VS Code: terminal aberto pronto com o comando `npm run homologacao` digitado.
2. **Ritmo de Fala:** Fale com dicção firme e ritmo dinâmico (~130 a 140 palavras por minuto).

---

## Cronograma e Roteiro Cena a Cena (00:00 a 03:00)

```
00:00 ─── 00:20 : Introdução, Objetivo e Stack Tecnológica
00:20 ─── 00:35 : Demonstração da Versão Inicial e Autenticação
00:35 ─── 01:10 : Homologação 1 — Defeitos Reproduzidos
01:10 ─── 01:40 : Diagnóstico de Causa-Raiz e Correções de Código
01:40 ─── 02:15 : Homologação 2 — Validação e Regressão 100%
02:15 ─── 02:30 : Comparação e Matriz de Rastreabilidade
02:30 ─── 03:00 : Hypercare, Handover e Conclusão
```

---

### Bloco 1: Introdução, Objetivo e Tecnologias
- **Tempo:** **00:00 – 00:20** (20 segundos)
- **O que aparece na tela:** Navegador na página inicial do ISRP (`/home.html`) e corte rápido de 3 segundos para o VS Code mostrando a estrutura de pastas e o `package.json`.
- **O que deve ser demonstrado:** O propósito do ISRP e a stack limpa em Node.js, Express, MySQL 8 e Vanilla JS.
- **Narração Sugerida:**
  > *"Olá! Apresento o ISRP, Sistema Integrado de Solicitações e Processos desenvolvido para a empresa fictícia SENAI Serviços Digitais, centralizando chamados internos de TI, manutenção e acessos. A solução utiliza Node.js com Express, banco de dados relacional MySQL 8 com pool parametrizado e frontend modular em JavaScript puro, sem frameworks pesados."*
- **Evidência Comprovada:**
  - Identidade visual do ISRP em `/home.html` e dependências no `package.json` (`bcryptjs`, `express`, `mysql2`).

---

### Bloco 2: Demonstração da Versão Inicial e Autenticação
- **Tempo:** **00:20 – 00:35** (15 segundos)
- **O que aparece na tela:** Tela `/login.html` autenticando com `ana.demo` e transição para `/solicitacoes.html`.
- **O que deve ser demonstrado:** Login seguro com hash bcrypt e geração de sessão com cookie `HttpOnly`.
- **Narração Sugerida:**
  > *"Na versão inicial, a autenticação valida a senha em hash bcrypt e gera uma sessão segura com cookie HttpOnly, direcionando o colaborador para sua área de solicitações, onde visualiza o catálogo de serviços e seu histórico de chamados."*
- **Evidência Comprovada:**
  - Resposta `HTTP 200` no login e cabeçalho `isrp.sid` com proteção contra fixação de sessão.

---

### Bloco 3: Homologação 1 — Defeitos Controlados Reproduzidos
- **Tempo:** **00:35 – 01:10** (35 segundos)
- **O que aparece na tela:** Transição rápida entre os relatórios da Rodada 1 e a tela reproduzindo 3 defeitos-chave:
  1. Cadastro aceitando descrição vazia (`HOM-001`).
  2. Alerta exibindo `[object Object]` (`HOM-004`).
  3. Painel admin com badge estático e KPI de pendentes marcando 2 em vez de 4 (`HOM-006`).
- **O que deve ser demonstrado:** A reprovação formal da versão na Homologação 1 (50% de aprovação) devido a falhas controladas.
- **Narração Sugerida:**
  > *"Na primeira homologação, atuando como QA, submetemos a versão a 10 testes formais e reprovamos a entrega com 50% de falha. Identificamos 5 defeitos controlados: o formulário aceitava chamados com descrição vazia poluindo o banco; campos inválidos exibiam o erro ilegível '[object Object]'; e no painel administrativo, o badge de status não atualizava no modal e o cartão de pendentes ocultava metade da fila real de chamados."*
- **Evidência Comprovada:**
  - Relatório `docs/homologacao-01-relatorio-final.md` e registros brutos em `docs/evidencias-execucao.json`.

---

### Bloco 4: Diagnóstico de Causa-Raiz e Correções de Código
- **Tempo:** **01:10 – 01:40** (30 segundos)
- **O que aparece na tela:** VS Code na branch `homologacao-corrigida`, mostrando rapidamente os diffs pontuais nos arquivos modificados.
- **O que deve ser demonstrado:** A intervenção mínima e precisa nos 4 arquivos afetados sem refatoração desnecessária.
- **Narração Sugerida:**
  > *"Como desenvolvedores, diagnosticamos a causa-raiz de cada falha: em solicitacoes.js, restauramos a validação de no mínimo 10 caracteres no backend e o required no HTML; em detalhes.js, reativamos o callback onAtualizado e o repainting do modal; no tratamento de erros, substituímos o objeto pela mensagem descritiva com foco acessível; e no painel admin, ajustamos a fórmula somando chamados abertos e em atendimento."*
- **Evidência Comprovada:**
  - Diffs de código nos arquivos `server/routes/solicitacoes.js`, `public/js/detalhes.js`, `public/js/solicitacoes.js` e `server/routes/admin.js` documentados em `docs/homologacao-02-correcoes.md`.

---

### Bloco 5: Homologação 2 — Validação e Regressão 100%
- **Tempo:** **01:40 – 02:15** (35 segundos)
- **O que aparece na tela:** Terminal executando `npm run homologacao` com saída verde `Aprovados: 10 (100%)` e tela do navegador mostrando o formulário bloqueando descrição vazia e o painel admin com status atualizado.
- **O que deve ser demonstrado:** Re-teste completo dos 10 casos na segunda rodada, com 100% de aprovação e zero regressões.
- **Narração Sugerida:**
  > *"Na segunda homologação, re-executamos a suíte completa com o comando npm run homologacao. O resultado foi de 100% de aprovação nos 10 casos de teste! O sistema agora rejeita descrições vazias com HTTP 400, o badge de status e o histórico atualizam instantaneamente na tela do operador, os erros são exibidos com clareza acessível e os indicadores gerenciais refletem exatamente os dados do MySQL."*
- **Evidência Comprovada:**
  - Execução no terminal de `npm run homologacao` (`scripts/test-homologacao-02.js`) gerando `Aprovados: 10 (100%), Reprovados: 0`.

---

### Bloco 6: Comparação e Matriz de Rastreabilidade
- **Tempo:** **02:15 – 02:30** (15 segundos)
- **O que aparece na tela:** Exibição da tabela consolidada em `docs/matriz-rastreabilidade.md`.
- **O que deve ser demonstrado:** A ligação direta entre cada defeito, sua causa, o arquivo corrigido e o teste final aprovado.
- **Narração Sugerida:**
  > *"Nossa Matriz de Rastreabilidade comprova que saímos de 50% de reprovação na Rodada 1 para 100% de conformidade na Rodada 2, garantindo que as correções foram cirúrgicas e não causaram qualquer regressão nas rotas de login, segurança RBAC ou persistência de dados."*
- **Evidência Comprovada:**
  - Documento `docs/matriz-rastreabilidade.md` com a tabela comparativa e requisitos RF-01 a RF-09.

---

### Bloco 7: Hypercare, Handover e Conclusão
- **Tempo:** **02:30 – 03:00** (30 segundos)
- **O que aparece na tela:** Terminal mostrando a resposta do endpoint `/api/health` (`status: ok, banco: conectado`) e a árvore de diretórios com a pasta `docs/` contendo toda a documentação de entrega.
- **O que deve ser demonstrado:** A prontidão para a fase de Hypercare (operação assistida), a entrega dos artefatos (Handover) e fechamento formal.
- **Narração Sugerida:**
  > *"Com a aprovação na Homologação 2, o ISRP está habilitado para o Hypercare, monitorando a saúde da API e a volumetria de chamados em operação assistida. Realizamos o Handover formal com todos os relatórios, matrizes e scripts versionados no repositório. A versão está pronta e segura para avaliação da banca. Muito obrigado!"*
- **Evidência Comprovada:**
  - Endpoint `GET /api/health` retornando `200 OK` em tempo real e arquivos finais em `docs/homologacao-02-relatorio-final.md`.

---

## Tabela Resumo do Cronômetro

| Bloco | Assunto Principal | Janela de Tempo | Duração |
| :---: | :--- | :---: | :---: |
| **1** | Introdução, Objetivo e Stack Tecnológica | 00:00 – 00:20 | 20s |
| **2** | Versão Inicial e Autenticação com Sessão | 00:20 – 00:35 | 15s |
| **3** | Homologação 1 e Defeitos Reproduzidos | 00:35 – 01:10 | 35s |
| **4** | Causa-Raiz e Diffs de Código das Correções | 01:10 – 01:40 | 30s |
| **5** | Homologação 2 e Demonstração 100% Aprovada | 01:40 – 02:15 | 35s |
| **6** | Matriz de Rastreabilidade e Evolução | 02:15 – 02:30 | 15s |
| **7** | Hypercare, Handover e Considerações Finais | 02:30 – 03:00 | 30s |
| **TOTAL** | **Apresentação Completa e Auditável** | **00:00 – 03:00** | **180s (3 min)** |
