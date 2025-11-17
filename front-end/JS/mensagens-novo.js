/**
 * mensagens.js - Sistema completo de mensagens
 */

document.addEventListener('DOMContentLoaded', async function() {
    console.log('[Mensagens] Iniciando sistema de mensagens');

    // Obter dados do usuário logado
    const userData = JSON.parse(localStorage.getItem('cuidafast_user') || '{}');
    
    if (!userData.id || !userData.email) {
        alert('Você precisa estar logado para acessar as mensagens.');
        window.location.href = '../../index.html';
        return;
    }

    console.log('[Mensagens] Usuário logado:', userData.nome, '(ID:', userData.id, ')');

    // Elementos da página
    const contactList = document.getElementById('contact-list');
    const messagesContainer = document.getElementById('messages-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const searchInput = document.getElementById('search-input');

    let contatoAtual = null;
    let conversas = [];

    // Verificar se há um destinatário na URL (vindo do perfil do cuidador)
    const urlParams = new URLSearchParams(window.location.search);
    const destinatarioId = urlParams.get('destinatario');

    /**
     * Carregar conversas do usuário
     */
    async function carregarConversas() {
        try {
            const data = await MensagensAPI.buscarConversas(userData.id);
            conversas = data.conversas || [];

            console.log('[Mensagens] Conversas carregadas:', conversas.length);

            if (conversas.length === 0) {
                mostrarEstadoVazio();
            } else {
                renderizarConversas(conversas);
                
                // Se tem destinatário na URL, abrir conversa
                if (destinatarioId) {
                    const conversa = conversas.find(c => c.contato_id == destinatarioId);
                    if (conversa) {
                        selecionarContato(conversa);
                    } else {
                        // Criar nova conversa
                        iniciarNovaConversa(parseInt(destinatarioId));
                    }
                } else if (conversas.length > 0) {
                    // Selecionar primeira conversa
                    selecionarContato(conversas[0]);
                }
            }
        } catch (error) {
            console.error('[Mensagens] Erro ao carregar conversas:', error);
            mostrarEstadoVazio();
        }
    }

    /**
     * Mostrar estado vazio (sem conversas)
     */
    function mostrarEstadoVazio() {
        contactList.innerHTML = `
            <div class="empty-state">
                <i class="ph ph-chat-circle" style="font-size: 48px; color: #ccc; margin-bottom: 1rem;"></i>
                <p style="color: #666; margin-bottom: 1rem;">Nenhuma conversa ainda</p>
                <button class="btn btn-primary" onclick="abrirBuscaCuidadores()">
                    <i class="ph ph-magnifying-glass"></i>
                    Procurar Cuidadores
                </button>
            </div>
        `;

        messagesContainer.innerHTML = `
            <div class="empty-chat-state">
                <i class="ph ph-chat-circle-dots" style="font-size: 64px; color: #ccc; margin-bottom: 1rem;"></i>
                <h3 style="color: #666; margin-bottom: 0.5rem;">Selecione uma conversa</h3>
                <p style="color: #999;">ou procure por cuidadores para iniciar uma nova</p>
            </div>
        `;
    }

    /**
     * Renderizar lista de conversas
     */
    function renderizarConversas(conversas) {
        if (conversas.length === 0) {
            mostrarEstadoVazio();
            return;
        }

        contactList.innerHTML = conversas.map(conversa => {
            const iniciais = conversa.contato_nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const foto = conversa.contato_foto || gerarAvatarSVG(iniciais);
            const unreadBadge = conversa.mensagens_nao_lidas > 0 
                ? `<div class="unread-count">${conversa.mensagens_nao_lidas}</div>` 
                : '';

            return `
                <li class="contact-item" data-contact-id="${conversa.contato_id}">
                    <div class="contact-avatar">
                        <img src="${foto}" alt="Avatar ${conversa.contato_nome}">
                    </div>
                    <div class="contact-info">
                        <span class="contact-name">${conversa.contato_nome}</span>
                        <span class="contact-role">${conversa.contato_tipo}</span>
                    </div>
                    ${unreadBadge}
                </li>
            `;
        }).join('');

        // Adicionar botão de busca no final
        contactList.innerHTML += `
            <li class="contact-item search-item" style="justify-content: center; cursor: pointer; border-top: 1px solid #eee; margin-top: 1rem; padding-top: 1rem;">
                <button class="btn btn-secondary" onclick="abrirBuscaCuidadores()" style="width: 100%;">
                    <i class="ph ph-magnifying-glass"></i>
                    Procurar Mais Cuidadores
                </button>
            </li>
        `;

        // Adicionar event listeners
        document.querySelectorAll('.contact-item[data-contact-id]').forEach(item => {
            item.addEventListener('click', function() {
                const contactId = parseInt(this.dataset.contactId);
                const conversa = conversas.find(c => c.contato_id === contactId);
                if (conversa) {
                    selecionarContato(conversa);
                }
            });
        });
    }

    /**
     * Selecionar contato e carregar mensagens
     */
    async function selecionarContato(conversa) {
        contatoAtual = conversa;

        // Marcar como ativo
        document.querySelectorAll('.contact-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-contact-id="${conversa.contato_id}"]`)?.classList.add('active');

        // Carregar mensagens
        await carregarMensagens(conversa.contato_id);
    }

    /**
     * Carregar mensagens entre usuários
     */
    async function carregarMensagens(contato_id) {
        try {
            const data = await MensagensAPI.buscarMensagens(userData.id, contato_id);
            const mensagens = data.mensagens || [];

            console.log('[Mensagens] Mensagens carregadas:', mensagens.length);

            if (mensagens.length === 0) {
                messagesContainer.innerHTML = `
                    <div class="empty-chat-state">
                        <i class="ph ph-chat-circle-text" style="font-size: 48px; color: #ccc; margin-bottom: 1rem;"></i>
                        <p style="color: #666;">Nenhuma mensagem ainda</p>
                        <p style="color: #999; font-size: 14px;">Envie a primeira mensagem!</p>
                    </div>
                `;
            } else {
                renderizarMensagens(mensagens);
            }

            // Remover badge de não lidas
            const contactItem = document.querySelector(`[data-contact-id="${contato_id}"]`);
            if (contactItem) {
                const badge = contactItem.querySelector('.unread-count');
                if (badge) badge.remove();
            }

        } catch (error) {
            console.error('[Mensagens] Erro ao carregar mensagens:', error);
            messagesContainer.innerHTML = `
                <div class="empty-chat-state">
                    <p style="color: #dc3545;">Erro ao carregar mensagens</p>
                </div>
            `;
        }
    }

    /**
     * Renderizar mensagens
     */
    function renderizarMensagens(mensagens) {
        messagesContainer.innerHTML = mensagens.map(msg => {
            const isSent = msg.remetente_id === userData.id;
            const className = isSent ? 'sent' : 'received';
            const dataFormatada = formatarData(msg.data_envio);

            return `
                <div class="message ${className}">
                    <p>${msg.conteudo}</p>
                    <span class="message-time">${dataFormatada}</span>
                </div>
            `;
        }).join('');

        // Scroll para o final
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Enviar mensagem
     */
    async function enviarMensagem() {
        const conteudo = messageInput.value.trim();

        if (!conteudo || !contatoAtual) {
            return;
        }

        try {
            await MensagensAPI.enviarMensagem(
                userData.id,
                contatoAtual.contato_id,
                conteudo
            );

            // Adicionar mensagem na tela
            const novaMensagem = `
                <div class="message sent">
                    <p>${conteudo}</p>
                    <span class="message-time">Agora</span>
                </div>
            `;
            messagesContainer.insertAdjacentHTML('beforeend', novaMensagem);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Limpar input
            messageInput.value = '';

            console.log('[Mensagens] Mensagem enviada com sucesso');

        } catch (error) {
            console.error('[Mensagens] Erro ao enviar mensagem:', error);
            alert('Erro ao enviar mensagem. Tente novamente.');
        }
    }

    /**
     * Buscar conversas
     */
    function buscarConversas(termo) {
        const termoLower = termo.toLowerCase();
        const conversasFiltradas = conversas.filter(c => 
            c.contato_nome.toLowerCase().includes(termoLower) ||
            c.contato_tipo.toLowerCase().includes(termoLower)
        );
        renderizarConversas(conversasFiltradas);
    }

    /**
     * Iniciar nova conversa
     */
    async function iniciarNovaConversa(destinatario_id) {
        try {
            // Buscar dados do destinatário
            const response = await fetch(`http://localhost:3000/api/perfil/cuidador/${destinatario_id}`);
            if (!response.ok) throw new Error('Usuário não encontrado');
            
            const destinatario = await response.json();

            contatoAtual = {
                contato_id: destinatario_id,
                contato_nome: destinatario.nome,
                contato_foto: destinatario.foto_perfil,
                contato_tipo: destinatario.tipos_cuidado || 'Cuidador'
            };

            // Adicionar à lista se não existir
            if (!conversas.find(c => c.contato_id === destinatario_id)) {
                conversas.unshift(contatoAtual);
                renderizarConversas(conversas);
            }

            selecionarContato(contatoAtual);

        } catch (error) {
            console.error('[Mensagens] Erro ao iniciar conversa:', error);
            alert('Erro ao iniciar conversa');
        }
    }

    /**
     * Gerar avatar SVG
     */
    function gerarAvatarSVG(iniciais) {
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Ccircle cx='25' cy='25' r='25' fill='%23FAD564'/%3E%3Ctext x='25' y='30' text-anchor='middle' font-family='Arial' font-size='18' fill='%231B475D'%3E${iniciais}%3C/text%3E%3C/svg%3E`;
    }

    /**
     * Formatar data
     */
    function formatarData(dataStr) {
        const data = new Date(dataStr);
        const agora = new Date();
        const diff = agora - data;
        const minutos = Math.floor(diff / 60000);
        const horas = Math.floor(diff / 3600000);
        const dias = Math.floor(diff / 86400000);

        if (minutos < 1) return 'Agora';
        if (minutos < 60) return `${minutos}min`;
        if (horas < 24) return `${horas}h`;
        if (dias < 7) return `${dias}d`;
        return data.toLocaleDateString('pt-BR');
    }

    // Event Listeners
    sendButton.addEventListener('click', enviarMensagem);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensagem();
        }
    });

    searchInput.addEventListener('input', function(e) {
        buscarConversas(e.target.value);
    });

    // Carregar conversas iniciais
    await carregarConversas();

    // Atualizar a cada 5 segundos
    setInterval(async () => {
        if (contatoAtual) {
            await carregarMensagens(contatoAtual.contato_id);
        }
    }, 5000);
});

/**
 * Abrir modal de busca de cuidadores
 */
function abrirBuscaCuidadores() {
    window.location.href = 'homeCliente.html';
}
