// perfilCliente.js - Gerenciamento do perfil do cliente

document.addEventListener('DOMContentLoaded', function() {
    initProfile();
});

function initProfile() {
    loadUserProfile();
    initEditButtons();
    console.log('Perfil do cliente inicializado');
}

/**
 * Carrega os dados do usuário no perfil
 */
function loadUserProfile() {
    const userData = getUserDataFromStorage();
    
    if (!userData) {
        console.warn('Nenhum dado de usuário encontrado');
        return;
    }

    // Atualizar nome principal
    const profileName = document.querySelector('.profile-info h1');
    if (profileName) {
        profileName.textContent = userData.nome;
    }

    // Atualizar data de cadastro
    const memberSince = document.querySelector('.member-since');
    if (memberSince && userData.dataCadastro) {
        const date = new Date(userData.dataCadastro);
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const monthName = monthNames[date.getMonth()];
        const year = date.getFullYear();
        
        if (userData.tipo === 'cuidador') {
            memberSince.textContent = `Cuidador desde ${monthName} de ${year}`;
        } else {
            memberSince.textContent = `Membro desde ${monthName} de ${year}`;
        }
    }

    // Atualizar informações pessoais
    updateInfoField('Nome Completo', userData.nome);
    updateInfoField('E-mail', userData.email);
    
    if (userData.telefone) {
        updateInfoField('Telefone', formatPhone(userData.telefone));
    }

    // Atualizar CPF se existir
    if (userData.cpf) {
        updateInfoField('CPF', userData.cpf);
    }

    // Atualizar data de nascimento se existir
    if (userData.dataNascimento) {
        const dataNasc = new Date(userData.dataNascimento + 'T00:00:00');
        const dataFormatada = dataNasc.toLocaleDateString('pt-BR');
        updateInfoField('Data de Nascimento', dataFormatada);
    }

    // Atualizar endereço se existir
    if (userData.endereco) {
        const end = userData.endereco;
        let enderecoCompleto = '';
        
        if (end.rua) enderecoCompleto += end.rua;
        if (end.numero) enderecoCompleto += `, ${end.numero}`;
        if (end.complemento) enderecoCompleto += ` - ${end.complemento}`;
        if (end.bairro) enderecoCompleto += `\n${end.bairro}`;
        if (end.cidade && end.estado) enderecoCompleto += ` - ${end.cidade}/${end.estado}`;
        if (end.cep) enderecoCompleto += `\nCEP: ${end.cep}`;
        
        if (enderecoCompleto) {
            updateInfoField('Endereço', enderecoCompleto);
        }
    }

    // Atualizar descrição se for cuidador
    if (userData.tipo === 'cuidador') {
        if (userData.descricao) {
            updateInfoField('Descrição', userData.descricao);
        } else {
            updateInfoField('Descrição', '-');
        }
    }

    // Atualizar foto do perfil APENAS se tiver photoURL (Google ou upload)
    if (userData.photoURL) {
        const avatarImages = document.querySelectorAll('.avatar-img, .user-avatar-img, .dropdown-avatar');
        avatarImages.forEach(img => {
            img.src = userData.photoURL;
            img.alt = `Foto de ${userData.nome}`;
        });
    } else {
        // Remover foto padrão - mostrar apenas ícone ou iniciais
        const avatarImages = document.querySelectorAll('.avatar-img, .user-avatar-img, .dropdown-avatar');
        avatarImages.forEach(img => {
            img.style.display = 'none'; // Esconde a imagem
        });
        
        // Mostrar iniciais no lugar
        const avatarContainers = document.querySelectorAll('.avatar, .user-avatar, .dropdown-user');
        avatarContainers.forEach(container => {
            const iniciais = userData.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const iniciaisDiv = container.querySelector('.avatar-iniciais') || document.createElement('div');
            iniciaisDiv.className = 'avatar-iniciais';
            iniciaisDiv.textContent = iniciais;
            iniciaisDiv.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #1B475D, #2A5F7A);
                color: white;
                font-size: 1.5rem;
                font-weight: 600;
                border-radius: 50%;
            `;
            if (!container.querySelector('.avatar-iniciais')) {
                container.appendChild(iniciaisDiv);
            }
        });
    }

    console.log('Perfil carregado para:', userData.nome);
}

/**
 * Atualiza um campo de informação específico
 */
function updateInfoField(labelText, value) {
    const infoItems = document.querySelectorAll('.info-item');
    
    infoItems.forEach(item => {
        const label = item.querySelector('.info-label');
        const valueElement = item.querySelector('.info-value');
        
        if (label && valueElement && label.textContent.trim() === labelText) {
            valueElement.textContent = value;
        }
    });
}

/**
 * Formata número de telefone
 */
function formatPhone(phone) {
    // Remove caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Formata conforme o padrão brasileiro
    if (cleaned.length === 11) {
        return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    } else if (cleaned.length === 10) {
        return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    }
    
    return phone;
}

/**
 * Obtém dados do usuário do localStorage
 */
function getUserDataFromStorage() {
    try {
        const userData = localStorage.getItem('cuidafast_user');
        if (userData) {
            return JSON.parse(userData);
        }
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
    }
    return null;
}

/**
 * Inicializa botões de edição
 */
function initEditButtons() {
    const editButtons = document.querySelectorAll('.edit-link');
    
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // O link já tem o href correto, apenas adiciona feedback visual
            console.log('Navegando para edição...');
        });
    });
}

/**
 * Inicializa botão de editar avatar
 */
const editAvatarBtn = document.querySelector('.edit-avatar-btn');
if (editAvatarBtn) {
    editAvatarBtn.addEventListener('click', function() {
        alert('Funcionalidade de upload de foto em desenvolvimento');
        // Aqui você pode implementar upload de imagem
    });
}
