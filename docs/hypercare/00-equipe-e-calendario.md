# Hypercare e Handover — ISRP: Equipe, Papéis e Calendário

**Projeto:** ISRP — Sistema Integrado de Solicitações e Processos (SENAI Serviços Digitais, projeto acadêmico fictício)
**Atividade:** Pitch de Hypercare e Handover (simulação de 5 dias pós-Go-Live em um único encontro de 180 min)
**Data:** 13/10/2026

> Esta pasta (`docs/hypercare/`) reúne os artefatos de apoio exigidos pelo guia de trabalho. Os documentos de homologação continuam em `docs/homologacao-v1/` e `docs/homologacao-v2/`, e a rastreabilidade em `docs/matriz-rastreabilidade.md`.

## 1. Equipe (exatamente 5 integrantes, 1 por papel)

| Papel | Integrante | Entregável individual |
| --- | --- | --- |
| Gestor do Projeto (PM) | Marcelo Prates | Backlog priorizado + SLA (`01`), relatório executivo de status (`08`, seção 3), validação do Handover (`05`) |
| Analista de Qualidade (QA) | Mateus Prates | Relatório de métricas e gargalos (`02`), critérios de aceite, comparativo (`04`), checklist de qualidade (`05`) |
| Tester | Leonardo Nonato | Evidências de reprodução, carga, regressão e reteste (`homologacao-v1/`, `homologacao-v2/`, `evidencias/`) |
| Desenvolvedor 1 (Backend/Banco) | Raphael Monteiro | Causa raiz + hotfix de backend (DEF-01, DEF-05) e plano de rollback (`03`) |
| Desenvolvedor 2 (Frontend/Integração) | Tiago Macedo | Hotfix de frontend (DEF-02, DEF-03, DEF-04), build validada e deploy emergencial (`03`) |

> **Atribuição provisória:** os papéis foram distribuídos na ordem em que os nomes foram informados. Se a equipe já definiu outra distribuição, basta trocar os nomes nesta tabela, em `05-termo-handover.md` e em `../roteiro-video.md`.

## 2. Calendário simulado (Dia 1 a Dia 5)

Os "dias" são fases dentro do mesmo encontro, não cinco encontros.

| Fase | Foco | Tempo | O que foi feito no ISRP | Evidência |
| --- | --- | --- | --- | --- |
| Dia 1 | Monitoramento e gargalos | 30 min | Execução da suíte da Homologação 1 sobre o build com defeitos; leitura dos indicadores do painel; mapa de sintomas | `homologacao-v1/evidencias-execucao.json`, `02-relatorio-metricas-gargalos.md` |
| Dia 2 | Triagem e suporte | 35 min | Classificação S1–S4, SLA, priorização e reprodução dos 5 defeitos | `01-backlog-priorizado-sla.md`, `homologacao-v1/homologacao-01-defeitos.md` |
| Dia 3 | Bug fixing e hotfix | 45 min | Correção dos 5 defeitos, reteste e decisão de liberar | `homologacao-v2/homologacao-02-correcoes.md`, `03-hotfix-aprovacao-e-rollback.md` |
| Dia 4 | Estabilização e SLA | 30 min | Homologação 2 (10 casos, regressão) e comparativo antes × depois | `homologacao-v2/`, `04-comparativo-antes-depois.md` |
| Dia 5 | Handover | 20 min | Termo de Handover assinado e ata de encerramento | `05-termo-handover.md`, `06-ata-encerramento.md` |

## 3. Mapeamento do cenário da atividade para o ISRP

O cenário original da atividade é o e-commerce VarejoMax. A equipe aplicou o mesmo ciclo (monitorar, triar, corrigir, comprovar, transferir) ao sistema ISRP. A tabela mostra a correspondência entre os tipos de incidente pedidos e o que foi tratado.

| Tipo de incidente do roteiro | Incidente tratado no ISRP |
| --- | --- |
| A. Degradação / erro no fluxo principal | DEF-01: cadastro aceitava solicitação com descrição vazia (HTTP 201 em vez de 400) |
| B. Falha em função essencial / integração | DEF-05: KPI "Pendentes" subestimava a fila (exibia 4, valor real 6) |
| C. Status de registro desatualizado | DEF-02 e DEF-04: badge de status e histórico não atualizavam após alterar o status |
| D. Falha visual / interação no formulário | DEF-03: mensagem `[object Object]` no formulário de solicitação |

## 4. Regra de registro

Toda decisão relevante está em `08-diario-decisoes-e-riscos.md`, com dia simulado, responsável, justificativa, impacto e evidência.
