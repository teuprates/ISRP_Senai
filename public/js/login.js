/** ISRP - login por usuário ou e-mail, com sessão mantida pelo servidor. */
(function () {
  'use strict';
  const { api, sessao, mensagem, limparMensagem, parametro, destinoSeguro } = window.ISRP;

  /** Alterna visibilidade da senha (botão "Mostrar"). */
  function configurarMostrarSenha() {
    document.querySelectorAll('.mostrar-senha').forEach((btn) => {
      btn.addEventListener('click', () => {
        const campo = document.getElementById(btn.getAttribute('aria-controls'));
        const visivel = campo.type === 'text';
        campo.type = visivel ? 'password' : 'text';
        btn.textContent = visivel ? 'Mostrar' : 'Ocultar';
        btn.setAttribute('aria-pressed', String(!visivel));
      });
    });
  }

  function destinoPadrao(usuario) {
    return usuario.perfil === 'admin' ? '/admin.html' : '/solicitacoes.html';
  }

  document.addEventListener('DOMContentLoaded', async () => {
    configurarMostrarSenha();
    const form = document.getElementById('form-login');
    const caixa = document.getElementById('mensagem-login');
    const botao = document.getElementById('btn-entrar');

    if (parametro('cadastro') === 'ok') mensagem(caixa, 'sucesso', 'Cadastro realizado com sucesso. Faça login para continuar.');
    if (parametro('redirect')) mensagem(caixa, 'info', 'Faça login para acessar a página solicitada.');

    // Já autenticado? Vai direto para a área interna
    const atual = await sessao();
    if (atual.usuario) {
      window.location.replace(destinoSeguro(parametro('redirect'), destinoPadrao(atual.usuario)));
      return;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      limparMensagem(caixa);
      const login = form.login.value.trim();
      const senha = form.senha.value;
      if (!login || !senha) {
        mensagem(caixa, 'erro', 'Informe o usuário (ou e-mail) e a senha.');
        (login ? form.senha : form.login).focus();
        return;
      }
      botao.disabled = true;
      botao.textContent = 'Entrando...';
      try {
        const r = await api.post('/api/auth/login', { login, senha });
        mensagem(caixa, 'sucesso', r.mensagem + ' Redirecionando...');
        setTimeout(() => {
          window.location.href = destinoSeguro(parametro('redirect'), destinoPadrao(r.usuario));
        }, 700);
      } catch (err) {
        mensagem(caixa, 'erro', err.message);
        form.senha.value = '';
        form.senha.focus();
        botao.disabled = false;
        botao.textContent = 'Entrar';
      }
    });
  });
})();
