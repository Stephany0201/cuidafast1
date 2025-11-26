// Public/JS/cadastroComplementoCuidador.js
document.addEventListener('DOMContentLoaded', function() {
  console.log('[cadastroComplementoCuidador] Página carregada');

  const userData = JSON.parse(localStorage.getItem('cuidafast_user') || '{}');
  const photoUploadGroup = document.getElementById('photoUploadGroup');
  const photoUpload = document.getElementById('photoUpload');
  const photoPreview = document.getElementById('photoPreview');
  const selectPhotoBtn = document.getElementById('selectPhotoBtn');

  let uploadedPhotoURL = null;

  // Mostrar campo de foto apenas se NÃO cadastrou com Google
  if (!userData.photo_url && photoUploadGroup) {
    photoUploadGroup.style.display = 'block';
    console.log('[cadastroComplementoCuidador] Campo de foto exibido (sem Google)');
  } else if (userData.photo_url) {
    console.log('[cadastroComplementoCuidador] Usando foto do Google:', userData.photo_url);
  }

  if (selectPhotoBtn && photoUpload) {
    selectPhotoBtn.addEventListener('click', function() {
      photoUpload.click();
    });
  }

  if (photoUpload && photoPreview) {
    photoUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('Arquivo muito grande. Tamanho máximo: 5MB');
          return;
        }
        if (!file.type.startsWith('image/')) {
          alert('Por favor, selecione uma imagem válida.');
          return;
        }

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

  const form = document.getElementById('complementForm');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('[cadastroComplementoCuidador] Formulário submetido');

      const existingData = JSON.parse(localStorage.getItem('cuidafast_user') || '{}');
      if (!existingData.email) {
        alert('❌ Erro: Dados do cadastro inicial não encontrados. Por favor, faça o cadastro novamente.');
        window.location.href = 'cadastro.html';
        return;
      }

      const cpf = document.getElementById('cpf').value;
      const dataNascimento = document.getElementById('dataNascimento').value;

      if (!cpf || !dataNascimento) {
        alert('Por favor, preencha todos os campos.');
        return;
      }

      const updatedData = {
        ...existingData,
        cpf_numero: cpf,
        data_nascimento: dataNascimento,
        cadastroComplementoCompleto: true,
        updatedAt: new Date().toISOString(),
      };

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
