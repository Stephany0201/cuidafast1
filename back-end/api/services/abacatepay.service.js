const axios = require('axios');

const ABACATEPAY_BASE_URL = 'https://api.abacatepay.com/v1';
const API_TOKEN = process.env.ABACATEPAY_API_TOKEN;

if (!API_TOKEN) {
  console.warn('⚠️ ABACATEPAY_API_TOKEN não configurado');
}

async function criarCobranca(valorCents, descricao, usuarioId = null) {
  try {
    if (!API_TOKEN) {
      return { error: 'Token da AbacatePay não configurado' };
    }

    const payload = {
      amount: valorCents, // valor em centavos
      description: descricao,
      external_id: usuarioId ? `user_${usuarioId}_${Date.now()}` : `payment_${Date.now()}`,
      methods: ['PIX', 'CREDIT_CARD', 'DEBIT_CARD']
    };

    const response = await axios.post(`${ABACATEPAY_BASE_URL}/billing`, payload, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return { data: response.data };
  } catch (error) {
    console.error('Erro na AbacatePay:', error.response?.data || error.message);
    return { 
      error: error.response?.data?.message || 'Erro ao criar cobrança' 
    };
  }
}

async function consultarCobranca(billingId) {
  try {
    if (!API_TOKEN) {
      return { error: 'Token da AbacatePay não configurado' };
    }

    const response = await axios.get(`${ABACATEPAY_BASE_URL}/billing/${billingId}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return { data: response.data };
  } catch (error) {
    console.error('Erro ao consultar cobrança:', error.response?.data || error.message);
    return { 
      error: error.response?.data?.message || 'Erro ao consultar cobrança' 
    };
  }
}

module.exports = {
  criarCobranca,
  consultarCobranca
};
