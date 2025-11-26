// cadastroComplemento.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("[cadastroComplemento] iniciando");

  const form = document.getElementById("complementForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const existing = JSON.parse(localStorage.getItem("cuidafast_user") || "{}");
    if (!existing.email) {
      alert("Erro: dados iniciais não encontrados. Faça o cadastro novamente.");
      window.location.href = "cadastro.html";
      return;
    }

    const telefone = document.getElementById("telefone").value || existing.telefone || null;
    const dataNascimento = document.getElementById("dataNascimento").value || null;
    const cpf = document.getElementById("cpf").value || null;

    const payload = {
      id: existing.id, // id interno que seu backend criou
      email: existing.email,
      nome: existing.nome,
      telefone,
      data_nascimento: dataNascimento,
      cpf_numero: cpf,
      tipo: existing.tipo
    };

    try {
      const API_URL = window.API_CONFIG?.AUTH || "/api/auth";
      const resp = await fetch(`${API_URL}/register-oauth`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });

      const data = await resp.json();
      if (!resp.ok) {
        alert(data.message || "Erro ao completar cadastro.");
        return;
      }

      // Mesclar e salvar localmente
      const merged = { ...existing, ...payload, cadastroComplementoCompleto: true };
      localStorage.setItem("cuidafast_user", JSON.stringify(merged));
      // redireciona para área do usuário
      window.location.href = "/HTML/homeCliente.html";
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar dados.");
    }
  });
});
