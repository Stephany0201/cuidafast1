const mockContacts = [
    {
        id: 1,
        name: 'Giovanna',
        role: 'Cuidadora de Idosos',
        unreadCount: 1,
        messages: [
            { id: 1, content: 'Opa tudo bom? eu queria contratar seus serviços como ficaria o orçamento para a semana toda?', sender: 'contact', timestamp: '2024-06-14 10:30' },
            { id: 2, content: 'Claro o Serviço de na semana fica XYR$ por hora.', sender: 'user', timestamp: '2024-06-14 10:32' },
            { id: 3, content: 'Só vou precisar do seu endereço e a descrição do que vai receber os cuidados.', sender: 'user', timestamp: '2024-06-14 10:33' },
            { id: 4, content: 'O endereço é rua Asteca numero 3007 apt 123.com e o meu vó ele tem 89 anos e é calminho mas tem problema de coração', sender: 'contact', timestamp: '2024-06-14 10:35' },
            { id: 5, content: 'Perfeito podemos agendar por volta das 10 da manhã', sender: 'user', timestamp: '2024-06-14 10:36' }
        ]
    },
    {
        id: 2,
        name: 'Sueli',
        role: 'Pet Walker',
        unreadCount: 0,
        messages: [
            { id: 1, content: 'Olá! Preciso de alguém para passear com meu cachorro.', sender: 'contact', timestamp: '2024-06-14 09:15' },
            { id: 2, content: 'Oi! Claro, posso ajudar. Qual o horário que você prefere?', sender: 'user', timestamp: '2024-06-14 09:20' }
        ]
    },
    {
        id: 3,
        name: 'Kleber',
        role: 'Cuidador de Idoso',
        unreadCount: 2,
        messages: [
            { id: 1, content: 'Bom dia! Gostaria de saber sobre seus serviços.', sender: 'contact', timestamp: '2024-06-14 08:00' },
            { id: 2, content: 'Preciso de cuidados para minha mãe durante a tarde.', sender: 'contact', timestamp: '2024-06-14 08:05' }
        ]
    },
    {
        id: 4,
        name: 'Jennifer',
        role: 'Babá',
        unreadCount: 0,
        messages: [
            { id: 1, content: 'Oi! Você tem disponibilidade para cuidar de crianças no fim de semana?', sender: 'contact', timestamp: '2024-06-13 16:30' },
            { id: 2, content: 'Oi! Sim, tenho disponibilidade. Quantas crianças e que idade?', sender: 'user', timestamp: '2024-06-13 16:45' }
        ]
    }
];


let currentContactId = 1;
let contacts = [...mockContacts];

const contactList = document.getElementById('contact-list');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const addButton = document.getElementById('add-button');
const attachmentMenu = document.getElementById('attachment-menu');
const fileInput = document.getElementById('file-input');
const searchInput = document.getElementById('search-input');
// Compatibilidade com header antigo ('.menu-icon') e com o header moderno
const menuIcon = document.querySelector('.menu-icon') || document.querySelector('#mobileMenuToggle') || document.querySelector('.mobile-menu-toggle');
const sidebar = document.querySelector('#clientSidebar') || document.querySelector('.sidebar');

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    renderContacts();
    loadMessages(currentContactId);
    setupEventListeners();
    scrollToBottom();
}

function setupEventListeners() {
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    searchInput.addEventListener('input', function(e) {
        filterContacts(e.target.value);
    });

    if (menuIcon) menuIcon.addEventListener('click', toggleSidebar);
    addButton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleAttachmentMenu();
    });

    document.addEventListener('click', function(e) {
        if (!attachmentMenu.contains(e.target) && !addButton.contains(e.target)) {
            hideAttachmentMenu();
        }
    });
    document.querySelectorAll('.attachment-option').forEach(option => {
        option.addEventListener('click', function() {
            const type = this.dataset.type;
            handleAttachmentOption(type);
            hideAttachmentMenu();
        });
    });

    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    contactList.addEventListener('click', function(e) {
        const contactItem = e.target.closest('.contact-item');
        if (contactItem) {
            const contactId = parseInt(contactItem.dataset.contactId);
            selectContact(contactId);
        }
    });
}

function renderContacts(filteredContacts = contacts) {
    contactList.innerHTML = '';
    
    filteredContacts.forEach(contact => {
        const contactElement = createContactElement(contact);
        contactList.appendChild(contactElement);
    });
}

function createContactElement(contact) {
    const li = document.createElement('li');
    li.className = `contact-item ${contact.id === currentContactId ? 'active' : ''}`;
    li.dataset.contactId = contact.id;
    
    const avatarLetter = contact.name.charAt(0).toUpperCase();
    
    li.innerHTML = `
        <div class="contact-avatar">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Ccircle cx='25' cy='25' r='25' fill='%23FAD564'/%3E%3Ctext x='25' y='30' text-anchor='middle' font-family='Arial' font-size='18' fill='%231B475D'%3E${avatarLetter}%3C/text%3E%3C/svg%3E" alt="Avatar ${contact.name}">
        </div>
        <div class="contact-info">
            <span class="contact-name">${contact.name}</span>
            <span class="contact-role">${contact.role}</span>
        </div>
        ${contact.unreadCount > 0 ? `<div class="unread-count">${contact.unreadCount}</div>` : ''}
    `;
    
    return li;
}

function selectContact(contactId) {
    currentContactId = contactId;
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
        contact.unreadCount = 0;
    }
    renderContacts();
    loadMessages(contactId);
  
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
    }
}

function loadMessages(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    messagesContainer.innerHTML = '';
    contact.messages.forEach(message => {
        const messageElement = createMessageElement(message);
        messagesContainer.appendChild(messageElement);
    });
    
    scrollToBottom();
}

function createMessageElement(message) {
    const div = document.createElement('div');
    div.className = `message ${message.sender === 'user' ? 'sent' : 'received'}`;
    
    div.innerHTML = `<p>${message.content}</p>`;
    
    return div;
}

function sendMessage() {
    const messageText = messageInput.value.trim();
    if (!messageText) return;

    const newMessage = {
        id: Date.now(),
        content: messageText,
        sender: 'user',
        timestamp: new Date().toISOString()
    };
    const contact = contacts.find(c => c.id === currentContactId);
    if (contact) {
        contact.messages.push(newMessage);

        setTimeout(() => {
            simulateResponse(contact);
        }, 1000 + Math.random() * 2000);
    }

    const messageElement = createMessageElement(newMessage);
    messagesContainer.appendChild(messageElement);

    messageInput.value = '';
    scrollToBottom();
    sendMessageToBackend(newMessage);
}

function simulateResponse(contact) {
    const responses = [
        'Entendi, vou verificar isso para você.',
        'Perfeito! Vou organizar tudo.',
        'Obrigado pela informação!',
        'Certo, pode deixar comigo.',
        'Vou confirmar e te retorno em breve.'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const responseMessage = {
        id: Date.now(),
        content: randomResponse,
        sender: 'contact',
        timestamp: new Date().toISOString()
    };
    
    contact.messages.push(responseMessage);
    
    if (contact.id === currentContactId) {
        const messageElement = createMessageElement(responseMessage);
        messagesContainer.appendChild(messageElement);
        scrollToBottom();
    } else {
        contact.unreadCount++;
        renderContacts();
    }
}

function filterContacts(searchTerm) {
    if (!searchTerm) {
        renderContacts();
        return;
    }
    
    const filtered = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    renderContacts(filtered);
}

function toggleSidebar() {
    if (!sidebar) return;
    // Suporta classes usadas por diferentes headers: 'open' e 'active'
    sidebar.classList.toggle('open');
    sidebar.classList.toggle('active');
    document.body.classList.toggle('sidebar-open');
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function toggleAttachmentMenu() {
    const isVisible = attachmentMenu.classList.contains('show');
    if (isVisible) {
        hideAttachmentMenu();
    } else {
        showAttachmentMenu();
    }
}

function showAttachmentMenu() {
    attachmentMenu.classList.add('show');
    addButton.classList.add('active');
}

function hideAttachmentMenu() {
    attachmentMenu.classList.remove('show');
    addButton.classList.remove('active');
}

function handleAttachmentOption(type) {
    switch (type) {
        case 'photo':
            fileInput.accept = 'image/*';
            fileInput.click();
            break;
        case 'file':
            fileInput.accept = '*';
            fileInput.click();
            break;
        case 'location':
            sendLocationMessage();
            break;
        case 'contact':
            sendContactMessage();
            break;
        default:
            console.log('Tipo de anexo não reconhecido:', type);
    }
}

function handleFileUpload(file) {
    const fileSize = (file.size / 1024 / 1024).toFixed(2); 
    const maxSize = 10; 
    
    if (fileSize > maxSize) {
        showErrorNotification(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`);
        return;
    }
    
    const fileMessage = {
        id: Date.now(),
        content: `📎 ${file.name} (${fileSize}MB)`,
        sender: 'user',
        timestamp: new Date().toISOString(),
        type: 'file',
        file: file
    };
        const contact = contacts.find(c => c.id === currentContactId);
    if (contact) {
        contact.messages.push(fileMessage);
    }
    
    
    const messageElement = createFileMessageElement(fileMessage);
    messagesContainer.appendChild(messageElement);
    scrollToBottom();
    

    uploadFileToBackend(file, fileMessage);
}

function createFileMessageElement(message) {
    const div = document.createElement('div');
    div.className = `message ${message.sender === 'user' ? 'sent' : 'received'} file-message`;
    
    const fileIcon = getFileIcon(message.file.type);
    
    div.innerHTML = `
        <div class="file-attachment">
            <i class="ph ${fileIcon}"></i>
            <div class="file-info">
                <span class="file-name">${message.file.name}</span>
                <span class="file-size">${(message.file.size / 1024 / 1024).toFixed(2)}MB</span>
            </div>
        </div>
    `;
    
    return div;
}

function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) return 'ph-image';
    if (fileType.startsWith('video/')) return 'ph-video';
    if (fileType.includes('pdf')) return 'ph-file-pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'ph-file-doc';
    if (fileType.includes('text')) return 'ph-file-text';
    return 'ph-file';
}

function sendLocationMessage() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                const locationMessage = {
                    id: Date.now(),
                    content: `📍 Localização compartilhada`,
                    sender: 'user',
                    timestamp: new Date().toISOString(),
                    type: 'location',
                    coordinates: { lat, lng }
                };
                
         
                const contact = contacts.find(c => c.id === currentContactId);
                if (contact) {
                    contact.messages.push(locationMessage);
                }
                

                const messageElement = createLocationMessageElement(locationMessage);
                messagesContainer.appendChild(messageElement);
                scrollToBottom();
            },
            function(error) {
                showErrorNotification('Não foi possível obter sua localização.');
            }
        );
    } else {
        showErrorNotification('Geolocalização não é suportada neste navegador.');
    }
}

function createLocationMessageElement(message) {
    const div = document.createElement('div');
    div.className = `message ${message.sender === 'user' ? 'sent' : 'received'} location-message`;
    
    div.innerHTML = `
        <div class="location-attachment">
            <i class="ph ph-map-pin"></i>
            <div class="location-info">
                <span class="location-text">Localização compartilhada</span>
                <span class="location-coords">Lat: ${message.coordinates.lat.toFixed(6)}, Lng: ${message.coordinates.lng.toFixed(6)}</span>
            </div>
        </div>
    `;
    
    return div;
}

function sendContactMessage() {

    const contactMessage = {
        id: Date.now(),
        content: `👤 Contato compartilhado: João Silva`,
        sender: 'user',
        timestamp: new Date().toISOString(),
        type: 'contact',
        contactInfo: {
            name: 'João Silva',
            phone: '+55 11 99999-9999'
        }
    };
    
    
    const contact = contacts.find(c => c.id === currentContactId);
    if (contact) {
        contact.messages.push(contactMessage);
    }
 
    const messageElement = createContactMessageElement(contactMessage);
    messagesContainer.appendChild(messageElement);
    scrollToBottom();
}

function createContactMessageElement(message) {
    const div = document.createElement('div');
    div.className = `message ${message.sender === 'user' ? 'sent' : 'received'} contact-message`;
    
    div.innerHTML = `
        <div class="contact-attachment">
            <i class="ph ph-user"></i>
            <div class="contact-info">
                <span class="contact-name">${message.contactInfo.name}</span>
                <span class="contact-phone">${message.contactInfo.phone}</span>
            </div>
        </div>
    `;
    
    return div;
}

async function uploadFileToBackend(file, message) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('messageId', message.id);
    formData.append('contactId', currentContactId);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Erro no upload do arquivo');
        }
        
        const result = await response.json();
        console.log('Arquivo enviado com sucesso:', result);
        
    } catch (error) {
        console.error('Erro no upload:', error);
        showErrorNotification('Erro ao enviar arquivo. Tente novamente.');
    }
}


async function sendMessageToBackend(message) {
    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conteudo: message.content,
                data_envio: message.timestamp,
                remetente: 'user',
                destinatario: currentContactId
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao enviar mensagem');
        }

        const responseData = await response.json();
        console.log('Mensagem enviada com sucesso:', responseData);

    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        // Não mostrar erro para o usuário, pois a mensagem já foi adicionada localmente
        // showErrorNotification('Erro ao enviar mensagem. Tente novamente.');
    }
}

async function loadMessagesFromBackend(contactId) {
    try {
        const response = await fetch(`/api/messages/${contactId}`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar mensagens');
        }

        const messages = await response.json();
        return messages;

    } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        return [];
    }
}

async function loadContactsFromBackend() {
    try {
        const response = await fetch('/api/contacts');
        
        if (!response.ok) {
            throw new Error('Erro ao carregar contatos');
        }

        const contactsData = await response.json();
        return contactsData;

    } catch (error) {
        console.error('Erro ao carregar contatos:', error);
        return mockContacts; 
    }
}

function showErrorNotification(message) {    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #ff4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}


function setupRealTimeUpdates() {
    setInterval(async () => {
        try {
            const response = await fetch('/api/messages/new');
            if (response.ok) {
                const newMessages = await response.json();
                if (newMessages.length > 0) {
                    handleNewMessages(newMessages);
                }
            }
        } catch (error) {
            console.error('Erro ao verificar novas mensagens:', error);
        }
    }, 5000);
}

function handleNewMessages(newMessages) {
    newMessages.forEach(message => {
        const contact = contacts.find(c => c.id === message.remetente);
        if (contact) {
            const formattedMessage = {
                id: message.mensagem_id,
                content: message.conteudo,
                sender: 'contact',
                timestamp: message.data_envio
            };
            
            contact.messages.push(formattedMessage);
            
            if (contact.id === currentContactId) {
                const messageElement = createMessageElement(formattedMessage);
                messagesContainer.appendChild(messageElement);
                scrollToBottom();
            } else {
                contact.unreadCount++;
                renderContacts();
            }
        }
    });
}

window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('open');
    }
});

// CSS para animações (adicionar ao CSS)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
