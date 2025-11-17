/**
 * mensagensAPI.js
 * API para gerenciar mensagens entre usuários
 */

const API_BASE_URL = 'http://localhost:3000/api/mensagens';

/**
 * Enviar nova mensagem
 */
async function enviarMensagem(remetente_id, destinatario_id, conteudo) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        remetente_id,
        destinatario_id,
        conteudo
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar mensagem');
    }

    return await response.json();
  } catch (error) {
    console.error('[MensagensAPI] Erro ao enviar mensagem:', error);
    throw error;
  }
}

/**
 * Buscar conversas do usuário
 */
async function buscarConversas(usuario_id) {
  try {
    const response = await fetch(`${API_BASE_URL}/conversas/${usuario_id}`);

    if (!response.ok) {
      throw new Error('Erro ao buscar conversas');
    }

    return await response.json();
  } catch (error) {
    console.error('[MensagensAPI] Erro ao buscar conversas:', error);
    throw error;
  }
}

/**
 * Buscar mensagens entre dois usuários
 */
async function buscarMensagens(usuario1_id, usuario2_id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${usuario1_id}/${usuario2_id}`);

    if (!response.ok) {
      throw new Error('Erro ao buscar mensagens');
    }

    return await response.json();
  } catch (error) {
    console.error('[MensagensAPI] Erro ao buscar mensagens:', error);
    throw error;
  }
}

/**
 * Contar mensagens não lidas
 */
async function contarMensagensNaoLidas(usuario_id) {
  try {
    const response = await fetch(`${API_BASE_URL}/nao-lidas/${usuario_id}`);

    if (!response.ok) {
      throw new Error('Erro ao contar mensagens');
    }

    const data = await response.json();
    return data.total;
  } catch (error) {
    console.error('[MensagensAPI] Erro ao contar mensagens:', error);
    return 0;
  }
}

/**
 * Buscar usuários para iniciar conversa
 */
async function buscarUsuarios(termo, tipo = null) {
  try {
    let url = `${API_BASE_URL}/buscar?termo=${encodeURIComponent(termo)}`;
    if (tipo) {
      url += `&tipo=${tipo}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Erro ao buscar usuários');
    }

    return await response.json();
  } catch (error) {
    console.error('[MensagensAPI] Erro ao buscar usuários:', error);
    throw error;
  }
}

/**
 * Deletar mensagem
 */
async function deletarMensagem(mensagem_id, usuario_id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${mensagem_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario_id })
    });

    if (!response.ok) {
      throw new Error('Erro ao deletar mensagem');
    }

    return await response.json();
  } catch (error) {
    console.error('[MensagensAPI] Erro ao deletar mensagem:', error);
    throw error;
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.MensagensAPI = {
    enviarMensagem,
    buscarConversas,
    buscarMensagens,
    contarMensagensNaoLidas,
    buscarUsuarios,
    deletarMensagem
  };
}
