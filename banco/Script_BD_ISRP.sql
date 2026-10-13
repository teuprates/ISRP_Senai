-- =====================================================================
-- ISRP - Sistema Integrado de Solicitações e Processos
-- Projeto ACADÊMICO e FICTÍCIO da empresa fictícia "SENAI Serviços Digitais".
-- Não possui vínculo oficial com o SENAI. Todos os dados são fictícios.
--
-- Banco: MySQL 8.x | Charset: utf8mb4
-- Execução: mysql -u root -p < banco/Script_BD_ISRP.sql
--        ou: npm run db:init   (usa as credenciais do arquivo .env)
--
-- ATENÇÃO: o script RECRIA as tabelas (DROP TABLE IF EXISTS). Use apenas
-- em ambiente de desenvolvimento/homologação.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS isrp_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE isrp_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS historico_solicitacoes;
DROP TABLE IF EXISTS solicitacoes;
DROP TABLE IF EXISTS servicos;
DROP TABLE IF EXISTS setores;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- Tabela: usuarios
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL,
  usuario       VARCHAR(40)  NOT NULL,
  senha_hash    VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt - nunca texto puro',
  perfil        ENUM('usuario','admin') NOT NULL DEFAULT 'usuario',
  ativo         TINYINT(1) NOT NULL DEFAULT 1,
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_login  DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_email (email),
  UNIQUE KEY uk_usuarios_usuario (usuario)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: setores
-- ---------------------------------------------------------------------
CREATE TABLE setores (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome               VARCHAR(100) NOT NULL,
  sigla              VARCHAR(12)  NOT NULL,
  descricao          VARCHAR(255) NOT NULL,
  responsabilidades  TEXT NOT NULL,
  email_contato      VARCHAR(160) NOT NULL,
  ramal              VARCHAR(10)  NULL,
  horario            VARCHAR(60)  NOT NULL DEFAULT 'Seg. a sex., 8h às 18h',
  PRIMARY KEY (id),
  UNIQUE KEY uk_setores_nome (nome),
  UNIQUE KEY uk_setores_sigla (sigla)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: servicos
-- ---------------------------------------------------------------------
CREATE TABLE servicos (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome         VARCHAR(100) NOT NULL,
  descricao    VARCHAR(500) NOT NULL,
  categoria    VARCHAR(60)  NOT NULL,
  setor_id     INT UNSIGNED NOT NULL,
  prazo_horas  SMALLINT UNSIGNED NOT NULL DEFAULT 24 COMMENT 'SLA de atendimento em horas',
  icone        VARCHAR(40)  NOT NULL DEFAULT 'suporte',
  ativo        TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_servicos_nome (nome),
  KEY idx_servicos_setor (setor_id),
  CONSTRAINT fk_servicos_setor FOREIGN KEY (setor_id)
    REFERENCES setores (id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: solicitacoes
-- ---------------------------------------------------------------------
CREATE TABLE solicitacoes (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  protocolo      VARCHAR(20)  NULL,
  titulo         VARCHAR(150) NOT NULL,
  descricao      TEXT NOT NULL,
  categoria      VARCHAR(60)  NOT NULL,
  prioridade     ENUM('Baixa','Média','Alta','Crítica') NOT NULL DEFAULT 'Média',
  status         ENUM('Aberta','Em atendimento','Resolvida','Encerrada') NOT NULL DEFAULT 'Aberta',
  usuario_id     INT UNSIGNED NOT NULL,
  servico_id     INT UNSIGNED NULL,
  criado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_solicitacoes_protocolo (protocolo),
  KEY idx_solicitacoes_usuario (usuario_id),
  KEY idx_solicitacoes_servico (servico_id),
  KEY idx_solicitacoes_status (status),
  CONSTRAINT fk_solicitacoes_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_solicitacoes_servico FOREIGN KEY (servico_id)
    REFERENCES servicos (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: historico_solicitacoes
-- ---------------------------------------------------------------------
CREATE TABLE historico_solicitacoes (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  solicitacao_id   INT UNSIGNED NOT NULL,
  usuario_id       INT UNSIGNED NOT NULL COMMENT 'Quem realizou a alteração',
  status_anterior  ENUM('Aberta','Em atendimento','Resolvida','Encerrada') NULL,
  status_novo      ENUM('Aberta','Em atendimento','Resolvida','Encerrada') NOT NULL,
  comentario       VARCHAR(500) NULL,
  criado_em        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_hist_solicitacao (solicitacao_id),
  CONSTRAINT fk_hist_solicitacao FOREIGN KEY (solicitacao_id)
    REFERENCES solicitacoes (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_hist_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================================================
-- DADOS FICTÍCIOS DE DEMONSTRAÇÃO
-- Senhas de demonstração (somente para ambiente acadêmico):
--   admin       / Admin@123    (perfil admin)
--   ana.demo    / Usuario@123  (perfil usuario)
--   bruno.demo  / Usuario@123  (perfil usuario)
-- Os valores abaixo são HASHES bcrypt (custo 10), não as senhas.
-- =====================================================================

INSERT INTO usuarios (id, nome, email, usuario, senha_hash, perfil) VALUES
 (1, 'Administrador Demonstração', 'admin@isrp.example',  'admin',      '$2a$10$xVr25K0wjLEMNITuKrSpvu2k7eIpMIxC8QB8Xt1S/0fFDkgSunPNu',   'admin'),
 (2, 'Ana Exemplo da Silva',       'ana.demo@isrp.example',   'ana.demo',   '$2a$10$Y2kxwxna/hKvIpZcY9bR8uZyalhMEBf8bN/MOgcR.ZiB3lFUSTnIy', 'usuario'),
 (3, 'Bruno Fictício Souza',       'bruno.demo@isrp.example', 'bruno.demo', '$2a$10$Y2kxwxna/hKvIpZcY9bR8uZyalhMEBf8bN/MOgcR.ZiB3lFUSTnIy', 'usuario');

INSERT INTO setores (id, nome, sigla, descricao, responsabilidades, email_contato, ramal, horario) VALUES
 (1, 'Central de Suporte Técnico', 'CST',
  'Primeiro nível de atendimento para dúvidas e incidentes de informática.',
  'Triagem de chamados;Atendimento remoto de primeiro nível;Orientação ao usuário;Encaminhamento para equipes especializadas',
  'suporte@isrp.example', '2100', 'Seg. a sex., 7h às 19h'),
 (2, 'Segurança da Informação e Acessos', 'SEGAC',
  'Gestão de identidades, perfis de acesso e políticas de segurança.',
  'Criação e revogação de acessos;Redefinição de credenciais;Auditoria de permissões;Conscientização em segurança',
  'acessos@isrp.example', '2200', 'Seg. a sex., 8h às 18h'),
 (3, 'Manutenção de Equipamentos', 'MANUT',
  'Diagnóstico e reparo de computadores, impressoras e periféricos.',
  'Manutenção preventiva e corretiva;Substituição de peças;Controle de patrimônio;Empréstimo de equipamentos',
  'manutencao@isrp.example', '2300', 'Seg. a sex., 8h às 17h'),
 (4, 'Infraestrutura e Software', 'INFRA',
  'Servidores, rede corporativa e distribuição de softwares licenciados.',
  'Instalação e atualização de softwares;Gestão de licenças;Administração de rede e Wi-Fi;Backup e servidores',
  'infra@isrp.example', '2400', 'Seg. a sex., 8h às 18h'),
 (5, 'Sistemas Corporativos', 'SISCORP',
  'Sustentação e evolução dos sistemas internos da empresa.',
  'Correção de falhas em sistemas internos;Suporte a usuários-chave;Pequenas melhorias;Integrações entre sistemas',
  'sistemas@isrp.example', '2500', 'Seg. a sex., 8h às 18h');

INSERT INTO servicos (id, nome, descricao, categoria, setor_id, prazo_horas, icone) VALUES
 (1, 'Suporte de Informática',
  'Atendimento para problemas no computador, lentidão, e-mail, rede ou dúvidas gerais de uso.',
  'Suporte', 1, 8, 'suporte'),
 (2, 'Solicitação de Acesso',
  'Pedido de criação, alteração ou remoção de acesso a sistemas, pastas e recursos corporativos.',
  'Acesso', 2, 24, 'acesso'),
 (3, 'Manutenção de Equipamentos',
  'Reparo ou substituição de computadores, monitores, impressoras e periféricos com defeito.',
  'Manutenção', 3, 48, 'manutencao'),
 (4, 'Instalação de Software',
  'Instalação ou atualização de programas homologados e licenciados pela empresa.',
  'Software', 4, 24, 'software'),
 (5, 'Suporte a Sistemas Internos',
  'Relato de erros, dúvidas ou ajustes nos sistemas corporativos internos.',
  'Sistemas', 5, 16, 'sistemas'),
 (6, 'Redefinição de Senha',
  'Desbloqueio de conta ou redefinição de senha de rede e de sistemas corporativos.',
  'Acesso', 2, 4, 'senha');

INSERT INTO solicitacoes (id, protocolo, titulo, descricao, categoria, prioridade, status, usuario_id, servico_id, criado_em, atualizado_em) VALUES
 (1, 'ISRP-2026-00001', 'Computador muito lento ao iniciar',
  'O computador da sala 12 demora cerca de 10 minutos para iniciar o sistema operacional.',
  'Suporte', 'Média', 'Em atendimento', 2, 1, NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 3 DAY),
 (2, 'ISRP-2026-00002', 'Acesso à pasta compartilhada do Financeiro',
  'Preciso de acesso de leitura à pasta \\\\servidor\\financeiro para conferência de relatórios.',
  'Acesso', 'Alta', 'Resolvida', 2, 2, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 2 DAY),
 (3, 'ISRP-2026-00003', 'Impressora do 2º andar não imprime',
  'A impressora fica com a luz de erro acesa e não aceita novos trabalhos.',
  'Manutenção', 'Alta', 'Aberta', 3, 3, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),
 (4, 'ISRP-2026-00004', 'Instalar editor de planilhas',
  'Solicito instalação do editor de planilhas homologado para elaboração de orçamentos.',
  'Software', 'Baixa', 'Encerrada', 3, 4, NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 5 DAY),
 (5, 'ISRP-2026-00005', 'Erro ao gerar relatório no sistema de compras',
  'Ao clicar em "Gerar relatório" o sistema exibe a mensagem "Erro inesperado".',
  'Sistemas', 'Crítica', 'Em atendimento', 2, 5, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 20 HOUR),
 (6, 'ISRP-2026-00006', 'Conta bloqueada após tentativas de login',
  'Minha conta de rede foi bloqueada após errar a senha três vezes.',
  'Acesso', 'Alta', 'Aberta', 3, 6, NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 5 HOUR);

INSERT INTO historico_solicitacoes (solicitacao_id, usuario_id, status_anterior, status_novo, comentario, criado_em) VALUES
 (1, 2, NULL, 'Aberta', 'Solicitação registrada pelo usuário.', NOW() - INTERVAL 4 DAY),
 (1, 1, 'Aberta', 'Em atendimento', 'Chamado assumido pela Central de Suporte Técnico.', NOW() - INTERVAL 3 DAY),
 (2, 2, NULL, 'Aberta', 'Solicitação registrada pelo usuário.', NOW() - INTERVAL 3 DAY),
 (2, 1, 'Aberta', 'Em atendimento', 'Aguardando aprovação do gestor da área.', NOW() - INTERVAL 3 DAY + INTERVAL 2 HOUR),
 (2, 1, 'Em atendimento', 'Resolvida', 'Acesso de leitura concedido após aprovação.', NOW() - INTERVAL 2 DAY),
 (3, 3, NULL, 'Aberta', 'Solicitação registrada pelo usuário.', NOW() - INTERVAL 2 DAY),
 (4, 3, NULL, 'Aberta', 'Solicitação registrada pelo usuário.', NOW() - INTERVAL 6 DAY),
 (4, 1, 'Aberta', 'Em atendimento', 'Instalação agendada.', NOW() - INTERVAL 6 DAY + INTERVAL 3 HOUR),
 (4, 1, 'Em atendimento', 'Resolvida', 'Software instalado e licença ativada.', NOW() - INTERVAL 5 DAY - INTERVAL 4 HOUR),
 (4, 1, 'Resolvida', 'Encerrada', 'Usuário confirmou o funcionamento.', NOW() - INTERVAL 5 DAY),
 (5, 2, NULL, 'Aberta', 'Solicitação registrada pelo usuário.', NOW() - INTERVAL 1 DAY),
 (5, 1, 'Aberta', 'Em atendimento', 'Encaminhado para Sistemas Corporativos. Prioridade crítica.', NOW() - INTERVAL 20 HOUR),
 (6, 3, NULL, 'Aberta', 'Solicitação registrada pelo usuário.', NOW() - INTERVAL 5 HOUR);

ALTER TABLE usuarios AUTO_INCREMENT = 100;
ALTER TABLE solicitacoes AUTO_INCREMENT = 7;
