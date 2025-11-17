import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBsiC8RaCd-6bwuThixa1ZxFkK4JhHgfjk",
  authDomain: "cuidafast-hub-af250.firebaseapp.com",
  projectId: "cuidafast-hub-af250",
  storageBucket: "cuidafast-hub-af250.appspot.com",
  messagingSenderId: "263800638065",
  appId: "1:263800638065:web:9b655c9d3e3acea160e9d0",
  measurementId: "G-701M8B5CZC"
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Variáveis globais
let btnCuidador, btnCliente, form, btnSubmit;

// Consolidar toda a inicialização em um único DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Cadastro] Inicializando página de cadastro...');
  
  // Inicializar elementos
  btnCuidador = document.getElementById('btn-cuidador');
  btnCliente = document.getElementById('btn-cliente');
  form = document.getElementById('form-cadastro'); 
  btnSubmit = document.querySelector("button[type='submit']");
  const btnGoogle = document.getElementById("btnGoogle");

  // Verificar se elementos foram encontrados
  if (!btnCuidador || !btnCliente || !form) {
    console.error('[Cadastro] Elementos principais não encontrados no DOM');
    return;
  }

  // Configurar estado inicial dos botões de alternância
  btnCuidador.classList.add('active');
  btnCuidador.classList.remove('inactive');
  btnCliente.classList.remove('active');
  btnCliente.classList.add('inactive');
  if (btnSubmit) btnSubmit.textContent = "Continuar";

  // Adicionar event listeners para alternância
  btnCuidador.addEventListener('click', ativarCuidador);
  btnCliente.addEventListener('click', ativarCliente);
  console.log('[Cadastro] Event listeners de alternância configurados');

  // Event listener do formulário
  form.addEventListener("submit", handleFormSubmit);

  // Configurar botão do Google
  if (btnGoogle) {
    btnGoogle.addEventListener("click", () => {
      console.log('[Cadastro] Login com Google iniciado');
      
      // Verificar qual tipo está selecionado
      let tipoUsuario = '';
      if (btnCuidador.classList.contains("active")) {
        tipoUsuario = 'cuidador';
      } else if (btnCliente.classList.contains("active")) {
        tipoUsuario = 'cliente';
      } else {
        alert("⚠️ Selecione um tipo de usuário (Cuidador ou Cliente) antes de continuar.");
        return;
      }

      console.log('[Cadastro] Tipo selecionado antes do login Google:', tipoUsuario);
      
      signInWithPopup(auth, provider)
        .then(async result => {
          const user = result.user;
          console.log("[Cadastro] Usuário logado com Google:", user);

          // Obter o token do Firebase
          const token = await user.getIdToken();

          // Criar objeto de usuário com dados do Google
          const userData = {
            nome: user.displayName || 'Usuário',
            email: user.email,
            telefone: user.phoneNumber || '',
            tipo: tipoUsuario,
            dataCadastro: new Date().toISOString(),
            primeiroNome: (user.displayName || 'Usuário').split(' ')[0],
            photoURL: user.photoURL || '',
            firebase_uid: user.uid,
            loginGoogle: true
          };

          // Enviar para o backend
          try {
            const response = await fetch('/api/cadastro/login/google', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                token: token,
                tipo_usuario: tipoUsuario
              })
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || 'Erro ao autenticar com o servidor');
            }

            console.log('[Cadastro] Resposta do backend:', data);

            // Atualizar userData com informações do backend
            const finalUserData = {
              ...userData,
              id: data.user.id
            };

            // Salvar no localStorage
            localStorage.setItem('cuidafast_user', JSON.stringify(finalUserData));
            localStorage.setItem('cuidafast_isLoggedIn', 'true');

            // Salvar na lista de usuários para login posterior
            salvarUsuarioNaLista(finalUserData);

            console.log('[Cadastro] Usuário Google salvo:', finalUserData);

            // Redirecionar
            setTimeout(() => {
              if (tipoUsuario === 'cuidador') {
                console.log('[Cadastro] Redirecionando para complemento cuidador...');
                location.assign("../HTML/cadastroComplementoCuidador.html");
              } else {
                console.log('[Cadastro] Redirecionando para complemento cliente...');
                location.assign("../HTML/cadastroComplemento.html");
              }
            }, 100);

          } catch (error) {
            console.error('[Cadastro] Erro ao comunicar com backend:', error);
            alert('❌ Erro ao autenticar com o servidor: ' + error.message);
          }
        })
        .catch(error => {
          console.error("[Cadastro] Erro no login com Google:", error);
          
          // Mensagens de erro mais específicas
          let errorMessage = 'Erro ao fazer login com Google';
          if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Login cancelado. Tente novamente.';
          } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Pop-up bloqueado pelo navegador. Permita pop-ups para este site.';
          } else if (error.code === 'auth/cancelled-popup-request') {
            errorMessage = 'Solicitação de login cancelada.';
          } else {
            errorMessage += ': ' + error.message;
          }
          
          alert('❌ ' + errorMessage);
        });
    });
    console.log('[Cadastro] Botão do Google configurado');
  } else {
    console.error('[Cadastro] Botão do Google não encontrado');
  }
});
function ativarCuidador() {
  console.log('[Cadastro] Botão Cuidador clicado');
  btnCuidador.classList.add('active');
  btnCuidador.classList.remove('inactive');
  btnCliente.classList.remove('active');
  btnCliente.classList.add('inactive');
  if (btnSubmit) btnSubmit.textContent = "Continuar";
  console.log('[Cadastro] Modo Cuidador ativado');
}

function ativarCliente() {
  console.log('[Cadastro] Botão Cliente clicado');
  btnCliente.classList.add('active');
  btnCliente.classList.remove('inactive');
  btnCuidador.classList.remove('active');
  btnCuidador.classList.add('inactive');
  if (btnSubmit) btnSubmit.textContent = "Continuar";
  console.log('[Cadastro] Modo Cliente ativado');
}

async function handleFormSubmit(event) {
  event.preventDefault();

  console.log('[Cadastro] Formulário submetido');

  // Capturar dados do formulário
  const nome = document.querySelector('input[type="text"]').value.trim();
  const email = document.querySelector('input[type="email"]').value.trim();
  const telefone = document.querySelector('input[type="tel"]').value.trim();
  const senha = document.querySelector('input[type="password"]').value.trim();

  console.log('[Cadastro] Dados capturados:', { nome, email, telefone: telefone ? 'preenchido' : 'vazio' });

  // Validar campos obrigatórios
  if (!nome || !email || !senha) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  // Determinar tipo de usuário
  let tipoUsuario = '';
  if (btnCuidador.classList.contains("active")) {
    tipoUsuario = 'cuidador';
  } else if (btnCliente.classList.contains("active")) {
    tipoUsuario = 'cliente';
  } else {
    alert("Selecione um tipo de usuário antes de continuar.");
    return;
  }

  console.log('[Cadastro] Tipo de usuário:', tipoUsuario);

  // Desabilitar botão de submit para evitar múltiplos envios
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Cadastrando...';
  }

  try {
    // Enviar dados para o backend
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome,
        email,
        senha,
        telefone: telefone || null,
        data_nascimento: null,
        tipo: tipoUsuario
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Erro no cadastro
      if (response.status === 409) {
        alert('❌ Este e-mail já está cadastrado. Faça login ou use outro e-mail.');
      } else if (data.errors) {
        alert('❌ Erro de validação: ' + data.errors.map(e => e.msg).join(', '));
      } else {
        alert('❌ Erro ao cadastrar: ' + (data.message || 'Erro desconhecido'));
      }
      return;
    }

    // Cadastro bem-sucedido
    console.log('[Cadastro] Usuário cadastrado com sucesso:', data.user);

    // Criar objeto de usuário para localStorage
    const userData = {
      id: data.user.id,
      nome: data.user.nome,
      email: data.user.email,
      telefone: data.user.telefone,
      tipo: tipoUsuario,
      dataCadastro: data.user.data_cadastro,
      primeiroNome: nome.split(' ')[0]
    };

    // Salvar no localStorage
    localStorage.setItem('cuidafast_user', JSON.stringify(userData));
    localStorage.setItem('cuidafast_isLoggedIn', 'true');

    console.log('[Cadastro] Dados salvos no localStorage');

    // Redirecionar para página de complemento
    if (tipoUsuario === 'cuidador') {
      console.log('[Cadastro] Redirecionando para complemento cuidador...');
      window.location.href = "../HTML/cadastroComplementoCuidador.html";
    } else {
      console.log('[Cadastro] Redirecionando para complemento cliente...');
      window.location.href = "../HTML/cadastroComplemento.html";
    }

  } catch (error) {
    console.error('[Cadastro] Erro na requisição:', error);
    alert('❌ Erro ao conectar com o servidor. Verifique se o backend está rodando.');
  } finally {
    // Reabilitar botão
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Continuar';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.social-icons i').forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      icon.classList.remove('ph-fill');
      icon.classList.add('ph');
    });
    icon.addEventListener('mouseleave', () => {
      icon.classList.add('ph-fill');
      icon.classList.remove('ph');
    });
  });
});

/**
 * Função para salvar usuário na lista de cadastrados
 * Permite que múltiplos usuários possam fazer login
 */
function salvarUsuarioNaLista(userData) {
  let usuarios = [];
  
  const usuariosExistentes = localStorage.getItem('cuidafast_usuarios');
  if (usuariosExistentes) {
    try {
      usuarios = JSON.parse(usuariosExistentes);
    } catch (error) {
      console.error('Erro ao carregar lista de usuários:', error);
      usuarios = [];
    }
  }

  // Verificar se usuário já existe (por email)
  const index = usuarios.findIndex(u => u.email === userData.email);
  if (index !== -1) {
    // Atualizar usuário existente
    usuarios[index] = userData;
    console.log('Usuário atualizado na lista:', userData.email);
  } else {
    // Adicionar novo usuário
    usuarios.push(userData);
    console.log('Novo usuário adicionado à lista:', userData.email);
  }

  localStorage.setItem('cuidafast_usuarios', JSON.stringify(usuarios));
  console.log('Total de usuários cadastrados:', usuarios.length);
}



