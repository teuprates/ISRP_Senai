# Roteiro para Gravação de Vídeo de Apresentação — Sistema ISRP

**Documento:** `docs/roteiro-video.md`  
**Projeto:** ISRP — Sistema Integrado de Solicitações e Processos (SENAI Serviços Digitais — Projeto Acadêmico Fictício)  
**Tema:** Apresentação da Arquitetura, Ciclos de Homologação (Defeitos vs. Correções), Hypercare e Handover  
**Duração Sugerida:** ~12 a 15 minutos (tempo de referência para avaliação acadêmica; ajuste os tempos caso sua atividade determine limite específico)  
**Público-Alvo:** Avaliadores acadêmicos, banca examinadora, stakeholders e equipe técnica

---

## Orientações Gerais para o Apresentador

1. **Configuração Prévia:**
   - Deixe o servidor rodando em background (`node server.js`).
   - Abra abas do navegador em `http://localhost:3000`: uma aba anônima (ou desconectada) em `/login.html`, uma com o usuário `admin` logado em `/admin.html` e outra com a usuária `ana.demo` em `/solicitacoes.html`.
   - Deixe o VS Code aberto no repositório com o terminal e a pasta `docs/` visíveis na barra lateral.
2. **Postura e Dicção:**
   - Fale de forma clara, objetiva e profissional, alternando com naturalidade entre a visão de Desenvolvedor e a visão de Analista de Qualidade (QA).
3. **Evidências Visuais:**
   - Mostre sempre na tela a evidência (resposta no navegador, código no editor, log no terminal ou consulta SQL) ao fazer uma afirmação técnica.

---

## Quadro Cronológico e Roteiro Cena a Cena

---

### Bloco 1: Introdução e Objetivo do ISRP
- **Tempo Estimado:** 00:00 – 01:15 (~1 min e 15 s)
- **O que aparece na tela:** Tela inicial do sistema (`/home.html`), com rolagem suave destacando o cabeçalho, logo e resumo institucional.
- **O que deve ser demonstrado:** A proposta do ISRP como plataforma integrada para registro e acompanhamento de incidentes e requisições da empresa fictícia "SENAI Serviços Digitais".
- **Narração Sugerida:**
  > *"Olá a todos! Sejam muito bem-vindos a esta apresentação do ISRP — Sistema Integrado de Solicitações e Processos, desenvolvido para a empresa fictícia SENAI Serviços Digitais. O objetivo principal do ISRP é centralizar e desburocratizar o fluxo de chamados internos de TI, manutenção, infraestrutura e segurança da informação, oferecendo transparência ao colaborador e um painel de gestão centralizado para a equipe de suporte com controle de SLA e auditoria de histórico."*
- **Evidência que comprova a afirmação:**
  - Página inicial carregada com identidade visual, cartões de serviços e navegação institucional semântica.

---

### Bloco 2: Tecnologias Utilizadas e Estrutura de Pastas
- **Tempo Estimado:** 01:15 – 02:30 (~1 min e 15 s)
- **O que aparece na tela:** VS Code exibindo o arquivo `package.json` e a árvore de diretórios (`server/`, `public/`, `banco/`, `docs/`, `scripts/`).
- **O que deve ser demonstrado:** A arquitetura limpa em Node.js com Express, MySQL 8 com conexão parametrizada e pool, Vanilla JS modular no frontend e a separação dos relatórios em `docs/`.
- **Narração Sugerida:**
  > *"No aspecto tecnológico, o ISRP foi construído utilizando Node.js na versão 18 com framework Express 5.3 para a camada de API RESTful. A persistência é gerenciada por um banco relacional MySQL 8 através do driver mysql2 com pool de conexões e queries parametrizadas para proteção total contra injeção SQL. As senhas dos usuários são criptografadas com hash bcrypt e as sessões utilizam cookies HttpOnly com proteção de fixação de sessão. No frontend, adotamos JavaScript modular puro, HTML5 semântico e CSS moderno, garantindo alto desempenho, acessibilidade e total controle de interface sem dependências pesadas de terceiros."*
- **Evidência que comprova a afirmação:**
  - `package.json` com dependências `bcryptjs`, `dotenv`, `express`, `express-session` e `mysql2`.
  - Arquivo `server/db.js` evidenciando o pool e queries preparadas.

---

### Bloco 3: Demonstração Breve da Versão Inicial e Autenticação
- **Tempo Estimado:** 02:30 – 03:45 (~1 min e 15 s)
- **O que aparece na tela:** Navegador em `/login.html` realizando login com a usuária comum `ana.demo` e, em seguida, exibição da tela `/solicitacoes.html`.
- **O que deve ser demonstrado:** Login funcional, criação da sessão segura, cabeçalho dinâmico com boas-vindas e listagem inicial de solicitações.
- **Narração Sugerida:**
  > *"Na versão inicial funcional, podemos observar a autenticação segura do usuário. Ao acessar com as credenciais da usuária Ana, o backend valida o hash bcrypt, regenera a sessão e emite o cookie seguro 'isrp.sid'. A interface reconhece a sessão ativa e apresenta a área de 'Minhas Solicitações', onde o usuário comum pode consultar seus chamados existentes e abrir novos pedidos por setor."*
- **Evidência que comprova a afirmação:**
  - Aba Network das ferramentas do desenvolvedor (F12) mostrando a rota `POST /api/auth/login` retornando `200 OK` e o cabeçalho `Set-Cookie: isrp.sid; HttpOnly; SameSite=Lax`.

---

### Bloco 4: A Primeira Homologação — Metodologia e Escopo
- **Tempo Estimado:** 03:45 – 05:00 (~1 min e 15 s)
- **O que aparece na tela:** Exibição do documento `docs/homologacao-01-relatorio-final.md` no editor ou navegador, com destaque para a tabela de métricas (50% de reprovação).
- **O que deve ser demonstrado:** A estratégia de QA adotada para isolar a primeira rodada na branch `homologacao-com-defeitos` com o banco `isrp_homolog_db`, sem tocar na versão de produção.
- **Narração Sugerida:**
  > *"Para a primeira homologação, atuamos no papel de Analistas de Qualidade de Software. Preservamos a versão original íntegra e criamos uma branch isolada chamada 'homologacao-com-defeitos', conectada a um banco de testes isolado. Estabelecemos 10 casos de teste formais, cobrindo segurança, persistência e interface. O resultado dessa primeira rodada foi a REPROVAÇÃO DA VERSÃO, com 5 testes aprovados e 5 reprovados devido a defeitos controlados nas regras de negócio, interface e relatórios."*
- **Evidência que comprova a afirmação:**
  - Gráfico de pizza e tabela de métricas em `docs/homologacao-01-relatorio-final.md` e histórico de commits Git (`af86a96` e `35fefd8`).

---

### Bloco 5: Demonstração dos Principais Defeitos Reproduzidos
- **Tempo Estimado:** 05:00 – 07:00 (~2 minutos)
- **O que aparece na tela:** Navegador reproduzindo os defeitos ao vivo ou exibindo as evidências capturadas na primeira rodada.
- **O que deve ser demonstrado:**
  1. Cadastro aceitando descrição vazia (`DEF-01` / `HOM-001`).
  2. Modal de alteração de status mantendo o badge anterior sem atualizar a tela (`DEF-02` / `HOM-003`).
  3. Mensagem de erro `"Falha no cadastro: [object Object]"` ao digitar título curto (`DEF-03` / `HOM-004`).
  4. Histórico que não aparecia imediatamente após salvar (`DEF-04` / `HOM-005`).
  5. Painel Admin com cartão "Pendentes" mostrando número divergente da fila (`DEF-05` / `HOM-006`).
- **Narração Sugerida:**
  > *"Vamos observar na prática os defeitos que inviabilizaram a aprovação na rodada 1. Primeiro, no formulário de solicitações, o sistema permitia cadastrar um chamado com descrição vazia, aceitando dados incompletos. Segundo, quando o usuário tentava digitar um título curto, a tela mostrava o texto ilegível '[object Object]'. No painel do administrador, ao alterar o status de um chamado, o badge de status e a grade da tabela ficavam estáticos, sem atualizar, e o histórico recente não aparecia. Por fim, o indicador de chamados pendentes nos KPIs somava apenas os chamados abertos, ocultando metade da carga real de trabalho da equipe."*
- **Evidência que comprova a afirmação:**
  - Registros em `docs/evidencias-execucao.json` e documento `docs/homologacao-01-defeitos.md`.

---

### Bloco 6: Diagnóstico de Causa-Raiz e Correções Realizadas
- **Tempo Estimado:** 07:00 – 08:45 (~1 min e 45 s)
- **O que aparece na tela:** VS Code na branch `homologacao-corrigida`, mostrando os diffs de código em `docs/homologacao-02-correcoes.md` e nos arquivos modificados.
- **O que deve ser demonstrado:**
  - `server/routes/solicitacoes.js`: restauração da validação `descricao.length < 10`.
  - `public/js/detalhes.js`: restauração de `onAtualizado()` e `abrir()`.
  - `public/js/solicitacoes.js`: substituição da concatenação por `err.message` e ativação de `errosCampos`.
  - `server/routes/admin.js`: fórmula `status['Aberta'] + status['Em atendimento']`.
- **Narração Sugerida:**
  > *"Como desenvolvedores, analisamos a causa-raiz de cada apontamento e aplicamos correções mínimas e pontuais, sem refatorações invasivas. No backend de solicitações, restabelecemos a checagem obrigatória de 10 caracteres e adicionamos a validação HTML5 correspondente. No frontend de detalhes, restauramos a sincronização de estado, re-executando a consulta e repintando o DOM com o novo badge e histórico. No tratamento de erros, eliminamos a conversão indevida de objetos para string e ativamos a marcação semântica de acessibilidade. E no painel administrativo, ajustamos a agregação para somar corretamente todos os chamados em aberto e em atendimento."*
- **Evidência que comprova a afirmação:**
  - Diffs do Git na branch `homologacao-corrigida` (`git diff` ou documento `docs/homologacao-02-correcoes.md`).

---

### Bloco 7: Demonstração dos Testes Pós-Correção (Homologação 2)
- **Tempo Estimado:** 08:45 – 10:30 (~1 min e 45 s)
- **O que aparece na tela:** Navegador operando na versão corrigida e terminal executando `node scripts/test-homologacao-02.js`.
- **O que deve ser demonstrado:**
  1. Tentativa de enviar descrição vazia é bloqueada com mensagem clara e HTTP 400.
  2. Título inválido exibe erro específico e foco no campo.
  3. Alteração de status pelo admin atualiza o badge e a tabela de imediato com a timeline completa.
  4. Cartão "Pendentes" exibe o valor correto (4 pendentes).
  5. Terminal exibindo os 10 testes APROVADOS (100%).
- **Narração Sugerida:**
  > *"Com as correções aplicadas, executamos a segunda homologação repetindo integralmente os 10 casos de teste com as mesmas condições e critérios. Vejam agora: ao tentar cadastrar uma solicitação sem descrição, a validação rejeita imediatamente com HTTP 400. Se inserirmos um título inválido, a mensagem de erro é clara e o campo é destacado de forma acessível. No painel administrativo, ao alterar o status, o badge muda instantaneamente de cor, o histórico é renderizado no ato e a tabela ao fundo sincroniza seu estado. Além disso, o cartão de pendentes agora computa a soma exata com 100% de precisão em relação ao banco MySQL."*
- **Evidência que comprova a afirmação:**
  - Terminal executando `test-homologacao-02.js` com saída `Aprovados: 10 (100%)`.
  - Documento `docs/homologacao-02-casos-de-teste.md`.

---

### Bloco 8: Comparação Entre as Duas Rodadas e Rastreabilidade
- **Tempo Estimado:** 10:30 – 11:30 (~1 minuto)
- **O que aparece na tela:** Exibição da tabela consolidada em `docs/matriz-rastreabilidade.md` e do resumo em `docs/homologacao-02-relatorio-final.md`.
- **O que deve ser demonstrado:** A evolução de 50% de aprovação (Rodada 1) para 100% de aprovação (Rodada 2) e a rastreabilidade completa entre defeito, causa, fix e teste.
- **Narração Sugerida:**
  > *"Na comparação entre as duas rodadas, saímos de um cenário de 50% de reprovação na Homologação 1 para 100% de aprovação na Homologação 2. O mais importante é que nossa Matriz de Rastreabilidade garante que todos os defeitos foram mapeados, corrigidos pontualmente e revalidados, comprovando também que nenhuma funcionalidade prévia foi quebrada por efeito colateral, preservando login, permissões de segurança e integridade relacional."*
- **Evidência que comprova a afirmação:**
  - Tabela comparativa e matriz de rastreabilidade em `docs/matriz-rastreabilidade.md`.

---

### Bloco 9: Planejamento de Hypercare (Operação Assistida)
- **Tempo Estimado:** 11:30 – 12:45 (~1 min e 15 s)
- **O que aparece na tela:** Diagrama ou tópicos do plano de Hypercare exibidos em tela (ou rota `/api/health` e logs do servidor no terminal).
- **O que deve ser demonstrado:** Estratégia de sustentação assistida após a entrega da versão: monitoramento ativo de logs, acompanhamento de SLA e plantão de suporte.
- **Narração Sugerida:**
  > *"Com a aprovação na segunda homologação, o sistema entra na fase de Hypercare, que é o período de acompanhamento assistido pós-implantação. Durante o Hypercare, a equipe técnica monitora ativamente as métricas de tempo de resposta da API através do endpoint de healthcheck, acompanha a taxa de incidentes na criação de chamados e atua em regime de plantão prioritário para quaisquer dúvidas dos usuários ou triagem imediata de possíveis incidentes que surjam no uso real."*
- **Evidência que comprova a afirmação:**
  - Terminal exibindo os logs da API em tempo real: `app.use('/api', ...)` registrando tempo de resposta e status HTTP.

---

### Bloco 10: Handover e Encerramento da Entrega
- **Tempo Estimado:** 12:45 – 14:00 (~1 min e 15 s)
- **O que aparece na tela:** Pasta `docs/` do projeto listando os relatórios gerados (`plano`, `casos-de-teste`, `defeitos`, `correcoes`, `matriz`, `relatorio-final`, `roteiro-video`).
- **O que deve ser demonstrado:** A entrega formal de todos os artefatos de engenharia de software e garantia da qualidade para os stakeholders e equipe de sustentação.
- **Narração Sugerida:**
  > *"O Handover representa a transferência formal de conhecimento e a entrega de toda a documentação aos responsáveis e stakeholders. Entregamos um repositório versionado com histórico completo no Git, documentação de testes, matriz de rastreabilidade, roteiro de implantação e scripts automatizados de validação. Isso garante que qualquer outro desenvolvedor ou analista consiga dar manutenção, auditar ou evoluir o ISRP com total autonomia e previsibilidade técnica."*
- **Evidência que comprova a afirmação:**
  - Estrutura completa de arquivos na pasta `docs/`.

---

### Bloco 11: Conclusão e Considerações Finais
- **Tempo Estimado:** 14:00 – 14:45 (~45 segundos)
- **O que aparece na tela:** Tela do sistema no navegador ou slide final com os créditos e informações do projeto acadêmico.
- **O que deve ser demonstrado:** Fechamento profissional da apresentação, agradecimentos e reforço de que a decisão final cabe ao avaliador responsável.
- **Narração Sugerida:**
  > *"Em conclusão, este ciclo completo de homologação e sustentação demonstrou a robustez do sistema ISRP e a eficácia de um processo de qualidade rigoroso, capaz de identificar defeitos em estágio inicial, diagnosticar suas causas e validar as correções com evidências auditáveis. Agradeço a atenção de todos e permaneço à disposição para esclarecimentos e avaliação da banca. Muito obrigado!"*
- **Evidência que comprova a afirmação:**
  - Encerramento visual da aplicação com mensagem institucional de projeto acadêmico.

---

## Dica para Ajuste de Tempo (Caso seu Edital Exija Tempo Menor)

- **Se o vídeo exigir até 10 minutos:** Encurte as demonstrações dos Blocos 5 e 7, focando nos defeitos DEF-01 (descrição vazia), DEF-02 (atualização visual) e DEF-05 (indicador de pendentes), e resuma os blocos de Hypercare e Handover em 1 minuto conjunto.
- **Se o vídeo exigir 15 minutos:** Mantenha exatamente o roteiro acima, demonstrando detalhadamente cada um dos 5 defeitos e re-testes no navegador e no terminal.
