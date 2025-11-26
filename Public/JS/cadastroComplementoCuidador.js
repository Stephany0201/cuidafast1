// Public/JS/cadastroComplementoCuidador.js
document.addEventListener('DOMContentLoaded', function() {
  console.log('[cadastroComplementoCuidador] Página carregada');

  const userData = JSON.parse(localStorage.getItem('cuidafast_user') || '{}');
  const photoUploadGroup = document.getElementById('photoUploadGroup');
  const photoUpload = document.getElementById('photoUpload');
  const photoPreview = document.getElementById('photoPreview');
  const selectPhotoBtn = document.getElementById('selectPhotoBtn');
<<<<<<< HEAD
  
  let uploadedPhotoURL = null;

  // Mostrar campo de foto apenas se NÃO cadastrou com Google
  if (!userData.photoURL && photoUploadGroup) {
    photoUploadGroup.style.display = 'block';
    console.log('[cadastroComplementoCuidador] Campo de foto exibido (sem Google)');
  } else if (userData.photoURL) {
    console.log('[cadastroComplementoCuidador] Usando foto do Google:', userData.photoURL);
  }

  // Botão para selecionar foto
=======

  let uploadedPhotoURL = null;

  // Mostrar campo de foto apenas se NÃO cadastrou com Google
  if (!userData.photo_url && photoUploadGroup) {
    photoUploadGroup.style.display = 'block';
    console.log('[cadastroComplementoCuidador] Campo de foto exibido (sem Google)');
  } else if (userData.photo_url) {
    console.log('[cadastroComplementoCuidador] Usando foto do Google:', userData.photo_url);
  }

>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  if (selectPhotoBtn && photoUpload) {
    selectPhotoBtn.addEventListener('click', function() {
      photoUpload.click();
    });
  }

<<<<<<< HEAD
  // Preview da foto selecionada
=======
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  if (photoUpload && photoPreview) {
    photoUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
<<<<<<< HEAD
        // Validar tamanho (5MB)
=======
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
        if (file.size > 5 * 1024 * 1024) {
          alert('Arquivo muito grande. Tamanho máximo: 5MB');
          return;
        }
<<<<<<< HEAD

        // Validar tipo
=======
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
        if (!file.type.startsWith('image/')) {
          alert('Por favor, selecione uma imagem válida.');
          return;
        }

<<<<<<< HEAD
        // Ler e mostrar preview
=======
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
        const reader = new FileReader();
        reader.onload = function(event) {
          uploadedPhotoURL = event.target.result;
          photoPreview.innerHTML = `<img src="${uploadedPhotoURL}" alt="Preview da foto">`;
          console.log('[cadastroComplementoCuidador] Foto carregada');
        };
        reader.readAsDataURL(file);
      }
    });
  }

<<<<<<< HEAD
  // Máscaras para os campos
=======
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  const cpfInput = document.getElementById('cpf');
  const telefoneInput = document.getElementById('telefone');

  if (cpfInput) {
    cpfInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      }
      e.target.value = value;
    });
  }

<<<<<<< HEAD
  // Formulário
  const form = document.getElementById('complementForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('[cadastroComplementoCuidador] Formulário submetido');

      // Pegar dados existentes do localStorage
      const existingData = JSON.parse(localStorage.getItem('cuidafast_user') || '{}');
      console.log('[cadastroComplementoCuidador] Dados existentes:', existingData);

      // Validar se tem dados existentes
=======
  const form = document.getElementById('complementForm');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('[cadastroComplementoCuidador] Formulário submetido');

      const existingData = JSON.parse(localStorage.getItem('cuidafast_user') || '{}');
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
      if (!existingData.email) {
        alert('❌ Erro: Dados do cadastro inicial não encontrados. Por favor, faça o cadastro novamente.');
        window.location.href = 'cadastro.html';
        return;
      }

<<<<<<< HEAD
      // Coletar novos dados
      const cpf = document.getElementById('cpf').value;
      const dataNascimento = document.getElementById('dataNascimento').value;

      // Validações
=======
      const cpf = document.getElementById('cpf').value;
      const dataNascimento = document.getElementById('dataNascimento').value;

>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
      if (!cpf || !dataNascimento) {
        alert('Por favor, preencha todos os campos.');
        return;
      }

<<<<<<< HEAD
      // Validar CPF (11 dígitos)
      const cpfLimpo = cpf.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        alert('CPF inválido. Digite 11 dígitos.');
        return;
      }

      // Mesclar dados: mantém tudo que já existia + adiciona novos campos
      const updatedData = {
        ...existingData, // Mantém nome, email, tipo, photoURL do Google, etc
        cpf: cpf,
        dataNascimento: dataNascimento,
=======
      const updatedData = {
        ...existingData,
        cpf_numero: cpf,
        data_nascimento: dataNascimento,
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
        cadastroComplementoCompleto: true,
        updatedAt: new Date().toISOString(),
      };

<<<<<<< HEAD
      // Se usuário fez upload de foto (não veio do Google), adicionar
      if (uploadedPhotoURL && !existingData.photoURL) {
        updatedData.photoURL = uploadedPhotoURL;
        console.log('[cadastroComplementoCuidador] Foto do upload adicionada');
      }

      // Salvar dados atualizados
      localStorage.setItem('cuidafast_user', JSON.stringify(updatedData));
      
      // Atualizar também na lista de usuários
      atualizarUsuarioNaLista(updatedData);
      
      console.log('[cadastroComplementoCuidador] Dados mesclados e salvos:', updatedData);
      
      // Redirecionar para seleção de tipo de cuidador
      window.location.href = 'cadastrocuidadortipo.html';
    });
  }
});

/**
 * Atualiza o usuário na lista de cadastrados
 */
function atualizarUsuarioNaLista(userData) {
  let usuarios = [];
  
  const usuariosExistentes = localStorage.getItem('cuidafast_usuarios');
  if (usuariosExistentes) {
    try {
      usuarios = JSON.parse(usuariosExistentes);
    } catch (error) {
      console.error('[cadastroComplementoCuidador] Erro ao carregar lista:', error);
      usuarios = [];
    }
  }

  // Procurar usuário por email
  const index = usuarios.findIndex(u => u.email === userData.email);
  if (index !== -1) {
    // Atualizar usuário existente
    usuarios[index] = userData;
    localStorage.setItem('cuidafast_usuarios', JSON.stringify(usuarios));
    console.log('[cadastroComplementoCuidador] Usuário atualizado na lista');
  }
}
=======
      if (uploadedPhotoURL && !existingData.photo_url) {
        updatedData.photo_url = uploadedPhotoURL;
        console.log('[cadastroComplementoCuidador] Foto do upload adicionada');
      }

      try {
        const API_URL = window.API_CONFIG?.AUTH || "/api/auth";
        const resp = await fetch(`${API_URL}/google-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: updatedData.email,
            nome: updatedData.nome,
            foto_url: updatedData.photo_url || null,
            tipo_usuario: updatedData.tipo || 'cuidador',
            cpf_numero: updatedData.cpf_numero,
            data_nascimento: updatedData.data_nascimento
          })
        });

        const resData = await resp.json();
        if (!resp.ok) {
          alert(resData.message || "Erro ao salvar cadastro complementar.");
          return;
        }

        localStorage.setItem('cuidafast_user', JSON.stringify(updatedData));
        window.location.href = 'cadastrocuidadortipo.html';
      } catch (error) {
        console.error('[cadastroComplementoCuidador] erro ao enviar ao backend', error);
        alert('Erro ao salvar no servidor.');
      }
    });
  }
});
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
