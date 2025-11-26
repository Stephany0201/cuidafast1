// Public/JS/cadastro.js
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://kgwepkcxmsoyebxczqwe.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tdndpY2V0b2pocXVyZGV1ZXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTI5MTEsImV4cCI6MjA3ODk4ODkxMX0.3XyOux7wjBIC2kIlmdSCTYzznzZOk5tJcHJJMA3Jggc"; // substitua pela sua anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// VARIÁVEIS GLOBAIS
let btnCuidador, btnCliente, form, btnSubmit;

document.addEventListener("DOMContentLoaded", () => {
  console.log("[Cadastro] Inicializando página...");

  btnCuidador = document.getElementById("btn-cuidador");
  btnCliente = document.getElementById("btn-cliente");
  form = document.getElementById("form-cadastro");
  btnSubmit = document.querySelector("button[type='submit']");
  const btnGoogle = document.getElementById("btnGoogle") || document.getElementById("btn-google");

  if (!btnCuidador || !btnCliente || !form) {
    console.error("[Cadastro] Elementos principais não encontrados");
    return;
  }

  btnCuidador.classList.add("active");
  btnCliente.classList.add("inactive");
  if (btnSubmit) btnSubmit.textContent = "Continuar";

  btnCuidador.addEventListener("click", ativarCuidador);
  btnCliente.addEventListener("click", ativarCliente);
  form.addEventListener("submit", handleFormSubmit);

  if (btnGoogle) {
    btnGoogle.addEventListener("click", loginGoogleSupabase);
  } else {
    console.error("[Cadastro] Botão do Google não encontrado");
  }
});

function ativarCuidador() {
  btnCuidador.classList.add("active");
  btnCuidador.classList.remove("inactive");
  btnCliente.classList.remove("active");
  btnCliente.classList.add("inactive");
  btnSubmit.textContent = "Continuar";
  localStorage.setItem('cuidafast_tipoSelecionado','cuidador');
}

function ativarCliente() {
  btnCliente.classList.add("active");
  btnCliente.classList.remove("inactive");
  btnCuidador.classList.remove("active");
  btnCuidador.classList.add("inactive");
  btnSubmit.textContent = "Continuar";
  localStorage.setItem('cuidafast_tipoSelecionado','cliente');
}

// CADASTRO TRADICIONAL (envia para seu backend /api/auth/register)
async function handleFormSubmit(event) {
  event.preventDefault();
  console.log("[Cadastro] Formulário enviado");

  const nome = document.getElementById("input-nome").value.trim();
  const email = document.getElementById("input-email").value.trim();
  const telefone = document.getElementById("input-telefone").value.trim();
  const senha = document.getElementById("input-senha").value.trim();

  if (!nome || !email || !senha) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  const tipoUsuario = btnCuidador.classList.contains("active") ? "cuidador" : "cliente";

  btnSubmit.disabled = true;
  btnSubmit.textContent = "Cadastrando...";

  try {
    const API_URL = window.API_CONFIG?.AUTH || "/api/auth";

    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        email,
        senha,
        telefone: telefone || null,
        data_nascimento: null,
        tipo: tipoUsuario,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Erro ao cadastrar.");
      return;
    }

    const userData = {
      id: data.user.id,
      nome: data.user.nome,
      email: data.user.email,
      telefone: data.user.telefone,
      tipo: tipoUsuario,
      dataCadastro: data.user.data_cadastro,
      primeiroNome: nome.split(" ")[0],
    };

    localStorage.setItem("cuidafast_user", JSON.stringify(userData));
    localStorage.setItem("cuidafast_isLoggedIn", "true");

    if (tipoUsuario === "cuidador") {
      window.location.href = "../HTML/cadastroComplementoCuidador.html";
    } else {
      window.location.href = "../HTML/cadastroComplemento.html";
    }
  } catch (err) {
    console.error(err);
    alert("Erro no servidor.");
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Continuar";
  }
}

// LOGIN GOOGLE via Supabase (redirect)
async function loginGoogleSupabase() {
  console.log("[Cadastro] Login Google via Supabase iniciado…");

  const tipoUsuario = localStorage.getItem('cuidafast_tipoSelecionado') || (btnCuidador.classList.contains("active") ? "cuidador" : "cliente");

  // Guarda escolha para o callback ler e decidir
  localStorage.setItem("cuidafast_tipoRegistro", tipoUsuario);

  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/HTML/cadastroComplemento.html"
    }
  });
}
