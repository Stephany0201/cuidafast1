import { createClient } from "https://esm.sh/@supabase/supabase-js";
// SUPABASE
const SUPABASE_URL = "https://kgwepkcxmsoyebxczqwe.supabase.co";
const SUPABASE_ANON_KEY = "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


document.getElementById("btn-google").addEventListener("click", () => {
  supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + "/homeCliente.html" }
  });
});

// VARIÁVEIS GLOBAIS
let btnCuidador, btnCliente, form, btnSubmit;

// DOMContentLoaded — único listener
document.addEventListener("DOMContentLoaded", () => {
  console.log("[Cadastro] Inicializando página...");

  // ELEMENTOS
  btnCuidador = document.getElementById("btn-cuidador");
  btnCliente = document.getElementById("btn-cliente");
  form = document.getElementById("form-cadastro");
  btnSubmit = document.querySelector("button[type='submit']");
  const btnGoogle = document.getElementById("btnGoogle");

  if (!btnCuidador || !btnCliente || !form) {
    console.error("[Cadastro] Elementos principais não encontrados");
    return;
  }

  // ESTADO INICIAL
  btnCuidador.classList.add("active");
  btnCliente.classList.add("inactive");
  if (btnSubmit) btnSubmit.textContent = "Continuar";

  // EVENTOS
  btnCuidador.addEventListener("click", ativarCuidador);
  btnCliente.addEventListener("click", ativarCliente);
  form.addEventListener("submit", handleFormSubmit);

  // LOGIN GOOGLE
  if (btnGoogle) {
    btnGoogle.addEventListener("click", handleGoogleLogin);
  } else {
    console.error("[Cadastro] Botão do Google não encontrado");
  }
});

// BOTÕES CLIENTE / CUIDADOR
function ativarCuidador() {
  btnCuidador.classList.add("active");
  btnCuidador.classList.remove("inactive");
  btnCliente.classList.remove("active");
  btnCliente.classList.add("inactive");
  btnSubmit.textContent = "Continuar";
}

function ativarCliente() {
  btnCliente.classList.add("active");
  btnCliente.classList.remove("inactive");
  btnCuidador.classList.remove("active");
  btnCuidador.classList.add("inactive");
  btnSubmit.textContent = "Continuar";
}

// SUBMIT DO FORMULÁRIO TRADICIONAL
async function handleFormSubmit(event) {
  event.preventDefault();

  console.log("[Cadastro] Formulário enviado");

  const nome = document.getElementById("input-nome").value.trim();
  const email = document.getElementById("input-email").value.trim();
  const telefone = document.getElementById("input-telefone").value.trim();
  const senha = document.getElementById("input-senha").value.trim();

  // VALIDAÇÃO
  if (!nome || !email || !senha) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  let tipoUsuario =
    btnCuidador.classList.contains("active") ? "cuidador" : "cliente";

  // DESABILITAR BOTÃO
  btnSubmit.disabled = true;
  btnSubmit.textContent = "Cadastrando...";

  try {
    const API_URL = window.API_CONFIG?.AUTH || "/api/auth";

    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

    // SALVAR
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

    // REDIRECIONAR
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

// LOGIN COM GOOGLE
async function handleGoogleLogin() {
  console.log("[Cadastro] Login Google iniciado");

  let tipoUsuario =
    btnCuidador.classList.contains("active") ? "cuidador" : "cliente";

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const token = await user.getIdToken();

    const API_URL = window.API_CONFIG.AUTH;

    const response = await fetch(`${API_URL}/login/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: token,
        tipo_usuario: tipoUsuario,
      }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    const finalUserData = {
      id: data.user.id,
      nome: user.displayName,
      email: user.email,
      telefone: user.phoneNumber || "",
      tipo: tipoUsuario,
      primeiroNome: user.displayName.split(" ")[0],
      photoURL: user.photoURL,
    };

    localStorage.setItem("cuidafast_user", JSON.stringify(finalUserData));
    localStorage.setItem("cuidafast_isLoggedIn", "true");

    // Redirecionar
    if (tipoUsuario === "cuidador") {
      location.assign("../HTML/cadastroComplementoCuidador.html");
    } else {
      location.assign("../HTML/cadastroComplemento.html");
    }
  } catch (error) {
    console.error("[Cadastro] Erro no login Google:", error);
    alert("Erro ao fazer login com Google.");
  }
}

function salvarUsuarioNaLista(userData) {
  let usuarios = JSON.parse(localStorage.getItem("cuidafast_usuarios") || "[]");

  const idx = usuarios.findIndex((u) => u.email === userData.email);
  idx !== -1 ? (usuarios[idx] = userData) : usuarios.push(userData);

  localStorage.setItem("cuidafast_usuarios", JSON.stringify(usuarios));
}
