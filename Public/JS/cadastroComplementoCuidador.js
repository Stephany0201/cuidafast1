// (mantive o upload/preview que você já tinha). No final do submit, adicionar chamada ao backend:

// dentro do submit, depois de validar e montar updatedData:
try {
  const API_URL = window.API_CONFIG?.AUTH || "/api/auth";
  const resp = await fetch(`${API_URL}/register-oauth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData)
  });
  const resData = await resp.json();
  if (!resp.ok) {
    alert(resData.message || "Erro ao salvar cadastro complementar.");
    return;
  }

  // salva local & redireciona como você já faz
  localStorage.setItem('cuidafast_user', JSON.stringify(updatedData));
  window.location.href = 'cadastrocuidadortipo.html';
} catch (error) {
  console.error('[cadastroComplementoCuidador] erro ao enviar ao backend', error);
  alert('Erro ao salvar no servidor.');
}
