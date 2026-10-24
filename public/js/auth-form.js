/**
 * Envia os formulários de login (crachá) e cadastro (contrato) via fetch, sem recarregar a página.
 * O servidor responde em JSON: { type, code } em caso de erro ou { type, redirect } em caso de sucesso.
 */

const contractMessages = {
  'campos': 'Preencha todos os campos para continuar.',
  'usuario-em-uso': 'Esse usuário já está em uso.',
  'credenciais': 'Usuário ou senha inválidos.',
  'erro-servidor': 'Não foi possível concluir a operação. Tente novamente.',
};

function showContractMessage(form, type, code) {
  const message = form.querySelector('.form-message');
  message.textContent = contractMessages[code] || contractMessages['erro-servidor'];
  message.dataset.type = type || 'error';
  message.hidden = false;
}

document.querySelectorAll('form[data-fetch]').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new URLSearchParams(new FormData(form)),
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();

      if (result.redirect) {
        window.location.href = result.redirect;
        return;
      }

      showContractMessage(form, result.type, result.code);
    } catch (error) {
      showContractMessage(form, 'error', 'erro-servidor');
    } finally {
      submitButton.disabled = false;
    }
  });
});

// Assinatura do contratado acompanha o nome digitado (página de cadastro)
const signatureInput = document.querySelector('[data-signature-source]');
const signatureName = document.querySelector('[data-signature-target]');

if (signatureInput && signatureName) {
  signatureInput.addEventListener('input', () => {
    signatureName.textContent = signatureInput.value;
  });
}
