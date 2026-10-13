# Relatório de Diagnóstico e Correções — Homologação 2 (ISRP)

**Documento:** `docs/homologacao-02-correcoes.md`  
**Projeto:** ISRP — Sistema Integrado de Solicitações e Processos  
**Ciclo:** Homologação 2 (Correção dos Defeitos da Rodada 1)  
**Data:** 13 de Outubro de 2026  
**Responsável:** Desenvolvedor de Software / Engenharia de Sustentação  
**Branch de Trabalho:** `homologacao-corrigida` (Commit `1fc7ec5`)

---

## 1. Introdução

Este relatório documenta a análise técnica aprofundada, as causas-raízes e as soluções de código aplicadas para sanar os **5 defeitos controlados** identificados e reprovados na primeira homologação do sistema ISRP (`DEF-01` a `DEF-05`).

Todas as correções seguiram a premissa de **intervenção mínima necessária**, evitando refatorações desnecessárias e preservando integralmente os módulos que já estavam operando com conformidade (autenticação com bcrypt, autorização RBAC, conectividade MySQL e integridade referencial).

Cada defeito é detalhado rigorosamente em **três níveis de abstração**:
1. **O que o usuário percebia:** A perspectiva operacional e a manifestação visual do problema.
2. **Qual era a causa técnica:** A análise de código, dados e fluxo assíncrono.
3. **Como a correção resolveu o problema:** A alteração realizada, acompanhada de diff antes/depois.

---

## 2. Detalhamento Técnico das Correções

### 2.1. Defeito DEF-01 — Validação Incompleta de Campos Obrigatórios (Descrição Vazia)

- **ID do Defeito:** `DEF-01`
- **Requisito Afetado:** `RF-01` / `RF-02`
- **Caso de Teste Associado:** `HOM-001`
- **Arquivos Alterados:**
  - [server/routes/solicitacoes.js](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/server/routes/solicitacoes.js#L77-L79)
  - [public/solicitacoes.html](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/solicitacoes.html#L90-L95)

#### Nível 1: O que o usuário percebia
Um colaborador acessava a página de abertura de chamados, deixava o campo de descrição em branco e conseguia salvar a solicitação sem qualquer impedimento. O sistema exibia mensagem de sucesso e gerava um protocolo válido. Porém, quando os técnicos da CST ou da Manutenção abriam o chamado na fila de atendimento, deparavam-se com um chamado "fantasma" sem detalhes do que havia quebrado ou onde estava o problema, paralisando o atendimento.

#### Nível 2: Qual era a causa técnica
- **No Backend:** Na rota `POST /api/solicitacoes`, o bloco de validação verificava somente o teto máximo de caracteres:
  ```javascript
  if (descricao.length > 5000) erros.descricao = 'A descrição não pode exceder 5000 caracteres.';
  ```
  A cláusula que garantia o tamanho mínimo (`descricao.length < 10`) havia sido suprimida, permitindo que strings de tamanho 0 passassem sem cair no erro 400.
- **No Frontend:** No arquivo `public/solicitacoes.html`, o elemento `<textarea id="descricao">` estava desprovido dos atributos nativos `required` e `minlength="10"`, permitindo que o navegador despachasse o formulário com o campo vazio.

#### Nível 3: Como a correção resolveu o problema
Foi reintroduzida a validação de fronteira inferior no backend (`descricao.length < 10`) e recolocados os atributos nativos de formulário no frontend HTML5. Agora, tanto a validação do navegador quanto a validação server-side rejeitam qualquer solicitação com descrição menor que 10 caracteres com `HTTP 400 Bad Request`.

**Trecho de Código no Backend (`server/routes/solicitacoes.js`):**
```diff
--- server/routes/solicitacoes.js (Antes - Com Defeito)
+++ server/routes/solicitacoes.js (Depois - Corrigido)
@@ -77,3 +77,3 @@
-  // DEFEITO CONTROLADO DEF-01 (Opção 1): Validação incompleta de campos obrigatórios
-  if (descricao.length > 5000) erros.descricao = 'A descrição não pode exceder 5000 caracteres.';
+  if (titulo.length < 5 || titulo.length > 150) erros.titulo = 'O título deve ter entre 5 e 150 caracteres.';
+  if (descricao.length < 10 || descricao.length > 5000) erros.descricao = 'Descreva a solicitação com ao menos 10 caracteres.';
```

**Trecho de Código no Frontend (`public/solicitacoes.html`):**
```diff
--- public/solicitacoes.html (Antes - Com Defeito)
+++ public/solicitacoes.html (Depois - Corrigido)
@@ -93,2 +93,2 @@
-  <!-- DEFEITO CONTROLADO DEF-01: Atributos required e minlength ausentes -->
-  <textarea id="descricao" name="descricao" maxlength="5000" placeholder="Descreva o que aconteceu, onde e desde quando."></textarea>
+  <textarea id="descricao" name="descricao" required minlength="10" maxlength="5000" placeholder="Descreva o que aconteceu, onde e desde quando."></textarea>
```

---

### 2.2. Defeito DEF-02 — Falha na Atualização Visual do Status Após Resposta da API

- **ID do Defeito:** `DEF-02`
- **Requisito Afetado:** `RF-05` / `RF-06`
- **Caso de Teste Associado:** `HOM-003`
- **Arquivo Alterado:**
  - [public/js/detalhes.js](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/js/detalhes.js#L125-L132)

#### Nível 1: O que o usuário percebia
O operador de suporte abria o modal de um chamado com status "Aberta", selecionava "Em atendimento", inseria um comentário e clicava em "Salvar alteração". O sistema mostrava um aviso textual de sucesso dentro do formulário, mas o distintivo (badge) de status no topo do modal continuava exibindo "Aberta", e a tabela geral ao fundo também não mudava de status. O operador clicava de novo no botão salvar, gerando erro de conflito, e só via o status correto se desse refresh completo (F5) na página.

#### Nível 2: Qual era a causa técnica
No arquivo `public/js/detalhes.js`, o evento `submit` do formulário executava com êxito a requisição `PATCH /api/solicitacoes/:id/status`, recebendo `HTTP 200`. Porém, após a resposta positiva, o código executava apenas:
```javascript
mensagem(caixa, 'sucesso', r.mensagem);
botao.disabled = false;
```
Haviam sido removidas duas invocações vitais:
1. `opcoes.onAtualizado(r)`: Callback responsável por recarregar a tabela e os cartões de KPI na página que originou o modal (ex: `/admin.html` ou `/solicitacoes.html`).
2. `await abrir(id, ...)`: Função que busca os dados atualizados da solicitação e repinta todo o cabeçalho, os badges de status e a linha do tempo do modal no DOM.

#### Nível 3: Como a correção resolveu o problema
A correção reativou o callback `onAtualizado` e a re-execução assíncrona da função `abrir(id, { ...opcoes, origem: gatilho })`. Além disso, injetou a mensagem de confirmação de status no cabeçalho do diálogo recém-renderizado. Desta forma, o badge muda instantaneamente de cor e texto (ex.: de amarelo "Aberta" para azul "Em atendimento") e a tabela ao fundo sincroniza seu estado.

**Trecho de Código no Frontend (`public/js/detalhes.js`):**
```diff
--- public/js/detalhes.js (Antes - Com Defeito)
+++ public/js/detalhes.js (Depois - Corrigido)
@@ -128,4 +128,4 @@
-  // DEFEITO CONTROLADO DEF-02 e DEF-04: apenas exibe mensagem sem repintar DOM
-  mensagem(caixa, 'sucesso', r.mensagem);
-  botao.disabled = false;
+  if (typeof opcoes.onAtualizado === 'function') opcoes.onAtualizado(r);
+  await abrir(id, { ...opcoes, origem: gatilho });
+  const nova = dialog.querySelector('#dlg-corpo');
+  nova.insertAdjacentHTML('afterbegin', `<p class="mensagem sucesso" role="status">${escapeHtml(r.mensagem)}</p>`);
```

---

### 2.3. Defeito DEF-03 — Mensagem de Erro Inadequada ao Falhar Validação (`[object Object]`)

- **ID do Defeito:** `DEF-03`
- **Requisito Afetado:** `RF-02` / Usabilidade e Acessibilidade (WCAG 3.3.1)
- **Caso de Teste Associado:** `HOM-004`
- **Arquivo Alterado:**
  - [public/js/solicitacoes.js](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/js/solicitacoes.js#L164-L170)

#### Nível 1: O que o usuário percebia
Ao tentar cadastrar uma solicitação com um título curto demais (ex: "Oi"), em vez de receber uma mensagem clara informando que o título necessitava de 5 a 150 caracteres, o usuário via uma caixa de erro em vermelho contendo a mensagem:
`"Falha no cadastro: [object Object]"`
O usuário não tinha ideia de qual campo estava incorreto e não conseguia concluir seu chamado.

#### Nível 2: Qual era a causa técnica
Quando o backend rejeita uma submissão inválida, ele retorna um objeto JSON estruturado:
```json
{
  "erro": "Verifique os campos destacados.",
  "detalhes": { "titulo": "O título deve ter entre 5 e 150 caracteres." }
}
```
A classe `ApiError` do cliente `api.js` popula `err.detalhes` com esse objeto JavaScript. No bloco `catch` de `solicitacoes.js`, o desenvolvedor havia escrito:
```javascript
const msgExibida = err.detalhes ? ('Falha no cadastro: ' + err.detalhes) : ...;
```
Ao concatenar uma string primitiva com um objeto usando o operador `+`, o interpretador JavaScript invoca `Object.prototype.toString()`, que converte o dicionário na string literal `"[object Object]"`. Além disso, a chamada à função utilitária `errosCampos(formNova, err.detalhes)` havia sido deletada.

#### Nível 3: Como a correção resolveu o problema
A concatenação inadequada foi removida. O alerta principal passou a utilizar `err.message` (que contém `"Verifique os campos destacados."`), e foi restaurada a invocação de `errosCampos(formNova, err.detalhes)`. Essa função acessível itera sobre cada chave do objeto, adiciona o atributo `aria-invalid="true"` no input correspondente, insere um parágrafo descritivo `<p class="erro-campo">` com a mensagem exata do campo e move o foco do teclado para o primeiro campo inválido.

**Trecho de Código no Frontend (`public/js/solicitacoes.js`):**
```diff
--- public/js/solicitacoes.js (Antes - Com Defeito)
+++ public/js/solicitacoes.js (Depois - Corrigido)
@@ -166,4 +166,2 @@
-  // DEFEITO CONTROLADO DEF-03: Concatenação de objeto com string gera [object Object]
-  const msgExibida = err.detalhes ? ('Falha no cadastro: ' + err.detalhes) : (err.message || 'Erro');
-  mensagem(msgNova, 'erro', msgExibida);
+  mensagem(msgNova, 'erro', err.message);
+  errosCampos(formNova, err.detalhes);
```

---

### 2.4. Defeito DEF-04 — Histórico Não Aparece Imediatamente Após Alteração de Status

- **ID do Defeito:** `DEF-04`
- **Requisito Afetado:** `RF-06` (Auditoria e Linha do Tempo)
- **Caso de Teste Associado:** `HOM-005`
- **Arquivo Alterado:**
  - [public/js/detalhes.js](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/public/js/detalhes.js#L125-L132)

#### Nível 1: O que o usuário percebia
Após salvar uma mudança de status com justificativa técnica (por exemplo, "Substituição de peça concluída"), o operador rolava até o final do diálogo para conferir o registro na linha do tempo de histórico. No entanto, o novo registro não aparecia na lista. O operador não conseguia confirmar se seu comentário havia sido salvo sem fechar e reabrir o diálogo.

#### Nível 2: Qual era a causa técnica
O evento de alteração persistia com sucesso o registro na tabela `historico_solicitacoes` do MySQL. Todavia, a árvore DOM `<ol class="linha-tempo">` no modal do navegador continuava com o HTML estático gerado na abertura inicial do diálogo, pois não havia requisição à rota `GET /api/solicitacoes/:id/historico` pós-mutação.

#### Nível 3: Como a correção resolveu o problema
A resolução deste defeito está acoplada à solução de sincronização de interface do `DEF-02`: ao re-invocar `await abrir(id, { ...opcoes, origem: gatilho })`, a função `abrir` dispara `Promise.all([ api.get('/api/solicitacoes/' + id), api.get('/api/solicitacoes/' + id + '/historico') ])`. O novo evento gravado no MySQL é retornado, a função `htmlHistorico` renderiza o novo item com a data/hora atual, autor e comentário, e substitui o container no DOM de forma instantânea e fluida.

**Trecho de Código no Frontend (`public/js/detalhes.js`):**
```diff
--- public/js/detalhes.js (Antes - Com Defeito)
+++ public/js/detalhes.js (Depois - Corrigido)
@@ -128,4 +128,4 @@
-  mensagem(caixa, 'sucesso', r.mensagem);
-  botao.disabled = false;
+  if (typeof opcoes.onAtualizado === 'function') opcoes.onAtualizado(r);
+  await abrir(id, { ...opcoes, origem: gatilho });
+  const nova = dialog.querySelector('#dlg-corpo');
+  nova.insertAdjacentHTML('afterbegin', `<p class="mensagem sucesso" role="status">${escapeHtml(r.mensagem)}</p>`);
```

---

### 2.5. Defeito DEF-05 — Indicador do Painel Administrativo com Total Incorreto (Pendentes)

- **ID do Defeito:** `DEF-05`
- **Requisito Afetado:** `RF-07` (Métricas de Atendimento e Painel Admin)
- **Caso de Teste Associado:** `HOM-006`
- **Arquivo Alterado:**
  - [server/routes/admin.js](file:///c:/Users/casab/Downloads/Mateus/GestaoFacil/ISRP/server/routes/admin.js#L60-L62)

#### Nível 1: O que o usuário percebia
O gestor da Central de Atendimento acessava o Painel Administrativo (`/admin.html`) para verificar a carga de trabalho do time de suporte e planejar a escala. O cartão de KPI intitulado "Pendentes" apresentava o número **2**, mas ao olhar a tabela geral logo abaixo e somar os chamados, havia 4 chamados pendentes (2 em status "Aberta" e 2 em status "Em atendimento"). O número do painel entrava em contradição direta com a realidade da fila.

#### Nível 2: Qual era a causa técnica
Na rota `GET /api/admin/indicadores`, o backend busca as agregações de status agrupadas por `GROUP BY status`. No momento de montar a resposta JSON, o cálculo de pendentes estava codificado como:
```javascript
pendentes: status['Aberta'],
```
Essa expressão descartava totalmente os chamados com status `'Em atendimento'`, que por definição de negócio são chamados pendentes (ainda não resolvidos e não encerrados).

#### Nível 3: Como a correção resolveu o problema
A fórmula de cálculo foi corrigida para somar os totais de chamados em ambos os status que caracterizam pendência operacional:
```javascript
pendentes: status['Aberta'] + status['Em atendimento'],
```
Com isso, o valor entregue pela API e exibido no cartão do painel reflete exatamente a soma dos chamados abertos e em atendimento (`2 + 2 = 4`), coincidindo perfeitamente com a consulta SQL do banco.

**Trecho de Código no Backend (`server/routes/admin.js`):**
```diff
--- server/routes/admin.js (Antes - Com Defeito)
+++ server/routes/admin.js (Depois - Corrigido)
@@ -61,2 +61,1 @@
-  // DEFEITO CONTROLADO DEF-05: calcula apenas chamados abertos
-  pendentes: status['Aberta'],
+  pendentes: status['Aberta'] + status['Em atendimento'],
```

---

## 3. Resumo dos Arquivos Modificados

| Arquivo Modificado | Defeito Corrigido | Justificativa da Alteração |
| :--- | :---: | :--- |
| `server/routes/solicitacoes.js` | `DEF-01` | Restauração da checagem de tamanho mínimo de 10 caracteres no campo `descricao`. |
| `public/solicitacoes.html` | `DEF-01` | Reinclusão dos atributos `required` e `minlength="10"` no elemento `<textarea>`. |
| `public/js/detalhes.js` | `DEF-02`, `DEF-04` | Restauração das chamadas `onAtualizado()` e `abrir()`, sincronizando o badge e o histórico. |
| `public/js/solicitacoes.js` | `DEF-03` | Eliminação da concatenação com objeto e restauração do helper acessível `errosCampos`. |
| `server/routes/admin.js` | `DEF-05` | Correção da expressão matemática do KPI `pendentes` somando `Aberta` e `Em atendimento`. |

Nenhum arquivo de segurança, hash de senha ou configuração de rotas foi modificado além do estritamente necessário.
