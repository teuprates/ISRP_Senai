/** ISRP - cadastro de usuário com validação no cliente (a validação definitiva é feita no servidor). */
(function () {
  'use strict';
  const { api, mensagem, limparMensagem, errosCampos, limparErrosCampos } = window.ISRP;

  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const REGEX_USUARIO = /^[a-zA-Z0-9._-]{3,40}$/;

  function validar(d) {
    const erros = {};
    if (d.nome.length < 3) erros.nome = 'Informe o nome completo (mínimo 3 caracteres).';
    if (!REGEX_EMAIL.test(d.email)) erros.email = 'Informe um e-mail válido.';
    if (!REGEX_USUARIO.test(d.usuario)) erros.usuario = 'Use de 3 a 40 caracteres: letras, números, ponto, hífen ou sublinhado.';
    if (d.senha.length < 8 || !/[A-Za-z]/.test(d.senha) || !/\d/.test(d.senha)) {
      erros.senha = 'A senha deve ter ao menos 8 caracteres, com letras e números.';
    }
    if (!d.confirmacao) erros.confirmacao = 'Confirme a senha.';
    else if (d.senha !== d.confirmacao) erros.confirmacao = 'A confirmação não confere com a senha.';
    return erros;
  }

  function atualizarForca(senha) {
    let pontos = 0;
    if (senha.length >= 8) pontos++;
    if (senha.length >= 12) pontos++;
    if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) pontos++;
    if (/\d/.test(senha)) pontos++;
    if (/[^A-Za-z0-9]/.test(senha)) pontos++;
    const niveis = [
      ['—', '0%', 'var(--erro)'], ['Fraca', '20%', 'var(--erro)'], ['Fraca', '40%', 'var(--erro)'],
      ['Média', '60%', '#c98a00'], ['Forte', '80%', 'var(--sucesso)'], ['Muito forte', '100%', 'var(--sucesso)'],
    ];
    const [rotulo, largura, cor] = senha ? niveis[pontos] : niveis[0];
    const barra = document.getElementById('forca-barra');
    barra.style.setProperty('--forca', largura);
    barra.style.setProperty('--cor-forca', cor);
    document.getElementById('forca-texto').textContent = 'Força da senha: ' + rotulo;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-cadastro');
    const caixa = document.getElementById('mensagem-cadastro');
    const botao = document.getElementById('btn-cadastrar');

    form.senha.addEventListener('input', () => atualizarForca(form.senha.value));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      limparMensagem(caixa);
      limparErrosCampos(form);

      const dados = {
        nome: form.nome.value.trim(),
        email: form.email.value.trim(),
        usuario: form.usuario.value.trim(),
        senha: form.senha.value,
        confirmacao: form.confirmacao.value,
      };
      const erros = validar(dados);
      if (Object.keys(erros).length) {
        mensagem(caixa, 'erro', 'Verifique os campos destacados.');
        errosCampos(form, erros);
        return;
      }

      botao.disabled = true;
      botao.textContent = 'Cadastrando...';
      try {
        await api.post('/api/usuarios', dados);
        window.location.href = '/login.html?cadastro=ok';
      } catch (err) {
        mensagem(caixa, 'erro', err.message);
        errosCampos(form, err.detalhes);
        botao.disabled = false;
        botao.textContent = 'Cadastrar';
      }
    });
  });
})();
