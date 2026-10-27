# Diário de Decisões, Comunicações, Riscos e Pendências

**Responsável pelo registro:** Marcelo Prates (PM) · 13/10/2026

> Os registros foram redigidos a partir das evidências do repositório. O PM deve conferir e, se quiser, acrescentar os horários reais de cada decisão e comunicação.

## 1. Diário de decisões e comunicações

| Dia | Decisão / comunicação | Responsável | Justificativa e impacto | Evidência |
| --- | --- | --- | --- | --- |
| 1 | Abrir investigação prioritária e não atribuir causa raiz ainda | PM com QA | 5 de 10 casos reprovados, entre eles dados inválidos persistidos e KPI errado | `homologacao-v1/evidencias-execucao.json` |
| 1 | Comunicação ao cliente: "Homologação 1 reprovou a versão (5/10). Impacto: chamados inválidos e indicador subestimado. Próximo passo: triagem e correção. Próxima atualização: ao fim do Dia 2" | PM | Registro de impacto, risco e plano | este diário |
| 2 | Classificar DEF-01 e DEF-05 como S2 e DEF-02, 03 e 04 como S3; ordem de ataque 1 a 5 | PM | Risco para os dados e decisão gerencial acima de usabilidade | `01-backlog-priorizado-sla.md` |
| 2 | Tratar DEF-02 e DEF-04 juntos | PM com Dev 2 | Mesma causa raiz em `detalhes.js`; uma só mudança reduz risco | `03`, seção 2 |
| 3 | Corrigir com intervenção mínima, sem refatoração e sem mudar o banco | Dev 1 e Dev 2 | Menor risco de regressão e rollback simples | `homologacao-02-correcoes.md` |
| 3 | Comunicação ao cliente na abertura da janela: "Hotfix de 5 arquivos, sem alteração de banco, rollback pronto para a build anterior" | PM | Transparência de risco | este diário |
| 3 | **Aprovar** o hotfix | PM, com parecer favorável de QA | 10 de 10 casos, 0 regressões, rollback documentado | `03`, seção 5 |
| 4 | Declarar estabilização funcional; não declarar estabilização de desempenho | QA e PM | Não há medição de p95 e 5xx | `04`, seção 3 |
| 5 | Propor Handover "aceitar com ressalvas" | PM | Três pendências de baixo/médio risco com responsável e prazo | `05-termo-handover.md` |

## 2. Matriz de riscos e pendências

| ID | Risco / pendência | Prob. | Impacto | Responsável | Prazo | Status |
| --- | --- | :-: | :-: | --- | --- | --- |
| R1 | Desempenho (p95, 5xx) sem medição | Média | Médio | Mateus Prates e Leonardo Nonato | Antes do vídeo | Aberto |
| R2 | Rollback não ensaiado | Baixa | Médio | Raphael Monteiro | Antes do vídeo | Aberto |
| R3 | A validação no navegador não protege a API; o backend precisa manter `descricao.length < 10` | Baixa | Alto | Raphael Monteiro | Contínuo | Mitigado (HOM-001) |
| R4 | Indicador depende de status literais (`Aberta`, `Em atendimento`); novo status exigiria rever a fórmula | Baixa | Médio | Equipe de sustentação | Em mudanças futuras | Aceito |
| R5 | Credenciais de demonstração (`admin`, `ana.demo`) e `SESSION_SECRET` do `.env.example` são de uso acadêmico | Alta se usados fora da simulação | Alto | Equipe de sustentação | Antes de qualquer uso real | Aceito para a simulação |

## 3. Relatório executivo de status (Dia 4)

**Situação:** versão `59dca8c` com 10 de 10 casos aprovados e nenhum defeito aberto. **Mudança aplicada:** hotfix de 5 arquivos, sem alteração de banco, aprovado no Dia 3. **Riscos aceitos:** R4 e R5. **Em aberto:** R1 (desempenho sem medição) e R2 (rollback sem ensaio), com responsável e prazo. **Recomendação:** encerrar o Hypercare após fechar R1 e R2 e transferir a operação com Handover "aceitar com ressalvas" (`05-termo-handover.md`).
