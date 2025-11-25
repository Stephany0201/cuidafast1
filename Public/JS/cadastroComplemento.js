// ---------- cadastroComplemento.js ----------
// Versão com integração ao backend

document.addEventListener('DOMContentLoaded', () => {
  console.log('[cadastroComplemento] Iniciado');

  // Verificar se usuário veio do Google (tem photoURL)
  const userData = JSON.parse(localStorage.getItem('cuidafast_user') || '{}');
  const photoUploadGroup = document.getElementById('photoUploadGroup');
  const photoUpload = document.getElementById('photoUpload');
  const photoPreview = document.getElementById('photoPreview');
  const selectPhotoBtn = document.getElementById('selectPhotoBtn');
  
  let uploadedPhotoURL = null;

  // Mostrar campo de foto apenas se NÃO cadastrou com Google
  if (!userData.photoURL && photoUploadGroup) {
    photoUploadGroup.style.display = 'block';
    console.log('[cadastroComplemento] Campo de foto exibido (sem Google)');
  } else if (userData.photoURL) {
    console.log('[cadastroComplemento] Usando foto do Google:', userData.photoURL);
  }

  // Botão para selecionar foto
  if (selectPhotoBtn && photoUpload) {
    selectPhotoBtn.addEventListener('click', function() {
      photoUpload.click();
    });
  }

  // Função para processar arquivo de imagem
  function processImageFile(file) {
    if (!file) return;

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    // Ler e mostrar preview
    const reader = new FileReader();
    reader.onload = function(event) {
      uploadedPhotoURL = event.target.result;
      photoPreview.innerHTML = `<img src="${uploadedPhotoURL}" alt="Preview da foto">`;
      console.log('[cadastroComplemento] Foto carregada');
    };
    reader.readAsDataURL(file);
  }

  // Preview da foto selecionada
  if (photoUpload && photoPreview) {
    photoUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      processImageFile(file);
    });
  }

  // Drag and drop functionality
  const photoUploadContainer = document.querySelector('.photo-upload-container');
  if (photoUploadContainer) {
    // Prevenir comportamento padrão
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      photoUploadContainer.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Highlight ao arrastar
    ['dragenter', 'dragover'].forEach(eventName => {
      photoUploadContainer.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      photoUploadContainer.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
      photoUploadContainer.classList.add('drag-over');
    }

    function unhighlight(e) {
      photoUploadContainer.classList.remove('drag-over');
    }

    // Handle drop
    photoUploadContainer.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;
      
      if (files.length > 0) {
        processImageFile(files[0]);
      }
    }
  }

  // ----------- FUNÇÃO: buscar CEP -----------
  function buscarCEP(cepDigitado) {
    const cepInput = document.getElementById('cep');
    const btnBuscar = document.getElementById('btnBuscarCep');

    const id = cepDigitado || cepInput.value;
    const cepLimpo = id.replace(/\D/g, '');

    if (!id || cepLimpo.length !== 8) {
      alert('CEP inválido. Digite um CEP com 8 dígitos.');
      return;
    }

    const originalHTML = btnBuscar.innerHTML;
    btnBuscar.disabled = true;
    btnBuscar.innerHTML = '<i class="ph ph-spinner ph-spin"></i>';
    btnBuscar.style.opacity = '0.6';

    fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      .then(response => {
        if (!response.ok) throw new Error('Erro ao buscar CEP na API');
        return response.json();
      })
      .then(data => {
        if (data.erro) throw new Error('CEP não encontrado');

        document.getElementById('rua').value = data.logradouro || '';
        document.getElementById('bairro').value = data.bairro || '';
        document.getElementById('cidade').value = data.localidade || '';
        document.getElementById('estado').value = data.uf || '';

        btnBuscar.innerHTML = '<i class="ph ph-check"></i>';
        setTimeout(() => {
          btnBuscar.innerHTML = originalHTML;
          btnBuscar.disabled = false;
          btnBuscar.style.opacity = '1';
        }, 1500);

        document.getElementById('numero').focus();
      })
      .catch(error => {
        console.error('❌ Erro ao buscar CEP:', error);
        alert(error.message || 'Erro ao buscar CEP. Verifique sua conexão.');
        btnBuscar.innerHTML = originalHTML;
        btnBuscar.disabled = false;
        btnBuscar.style.opacity = '1';
      });
  }

  // ----------- FORMATAR CAMPOS -----------
  const cepInput = document.getElementById('cep');
  if (cepInput) {
    cepInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 5) value = value.slice(0, 5) + '-' + value.slice(5, 8);
      e.target.value = value;
    });

    cepInput.addEventListener('blur', (e) => {
      const cep = e.target.value.replace(/\D/g, '');
      if (cep.length === 8) buscarCEP(cep);
    });
  }

  const btnBuscarCep = document.getElementById('btnBuscarCep');
  if (btnBuscarCep) {
    btnBuscarCep.addEventListener('click', (e) => {
      e.preventDefault();
      const cep = document.getElementById('cep').value;
      if (cep && cep.trim() !== '') buscarCEP(cep);
      else alert('Por favor, digite um CEP primeiro.');
    });
  }

  // Função para validar CPF
  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validar primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    // Validar segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  }

  const cpfInput = document.getElementById('cpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      }
      e.target.value = value;
    });

    // Validar CPF ao sair do campo
    cpfInput.addEventListener('blur', (e) => {
      const cpf = e.target.value;
      if (cpf && !validarCPF(cpf)) {
        alert('❌ CPF inválido. Por favor, verifique o número digitado.');
        e.target.style.borderColor = '#ff4444';
      } else if (cpf) {
        e.target.style.borderColor = '#4CAF50';
      }
    });

    // Remover cor de erro ao digitar novamente
    cpfInput.addEventListener('focus', (e) => {
      e.target.style.borderColor = '';
    });
  }

  // ----------- CARREGAR DADOS SALVOS -----------
  if (Object.keys(userData).length > 0) {
    console.log('[cadastroComplemento] Dados carregados do localStorage:', userData);
    document.getElementById('dataNascimento').value = userData.dataNascimento || '';
    document.getElementById('cpf').value = userData.cpf || '';
    document.getElementById('cep').value = userData.endereco?.cep || '';
    document.getElementById('rua').value = userData.endereco?.rua || '';
    document.getElementById('numero').value = userData.endereco?.numero || '';
    document.getElementById('complemento').value = userData.endereco?.complemento || '';
    document.getElementById('bairro').value = userData.endereco?.bairro || '';
    document.getElementById('cidade').value = userData.endereco?.cidade || '';
    document.getElementById('estado').value = userData.endereco?.estado || '';
  }

  // ----------- SALVAR DADOS AO ENVIAR -----------
  const form = document.getElementById('form-complemento');
  if (form) {
    form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const existingData = JSON.parse(localStorage.getItem('cuidafast_user') || '{}');

  const endereco = {
    cep: document.getElementById('cep').value,
    rua: document.getElementById('rua').value,
    numero: document.getElementById('numero').value,
    complemento: document.getElementById('complemento').value,
    bairro: document.getElementById('bairro').value,
    cidade: document.getElementById('cidade').value,
    estado: document.getElementById('estado').value,
  };

  const updatedData = {
    ...existingData,
    dataNascimento: document.getElementById('dataNascimento').value,
    cpf: document.getElementById('cpf').value,
    endereco: endereco,
    cadastroCompleto: true,
    updatedAt: new Date().toISOString(),
  };

      // Se usuário fez upload de foto (não veio do Google), adicionar
      if (uploadedPhotoURL && !existingData.photoURL) {
        updatedData.photoURL = uploadedPhotoURL;
        console.log('[cadastroComplemento] Foto do upload adicionada');
      }

      // ✅ SALVAR NO BACKEND
      try {
        const response = await fetch('http://localhost:3000/api/cliente/dados-complementares', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: existingData.id, // ID do usuário no banco
            endereco: endereco,
            dataNascimento: updatedData.dataNascimento,
            cpf: updatedData.cpf
          })
        });

        if (!response.ok) {
          throw new Error('Erro ao salvar dados no servidor');
        }

        console.log('✅ Dados salvos no backend');
      } catch (error) {
        console.error('❌ Erro ao salvar no backend:', error);
        alert('Erro ao salvar dados. Tente novamente.');
        return;
      }

      // Salvar também no localStorage (cache local)
      localStorage.setItem('cuidafast_user', JSON.stringify(updatedData));
      atualizarUsuarioNaLista(updatedData);

      alert('✅ Cadastro completado com sucesso!');
      window.location.href = 'homeCliente.html';
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
      console.error('[cadastroComplemento] Erro ao carregar lista:', error);
      usuarios = [];
    }
  }

  // Procurar usuário por email
  const index = usuarios.findIndex(u => u.email === userData.email);
  if (index !== -1) {
    // Atualizar usuário existente
    usuarios[index] = userData;
    localStorage.setItem('cuidafast_usuarios', JSON.stringify(usuarios));
    console.log('[cadastroComplemento] Usuário atualizado na lista');
  }
}