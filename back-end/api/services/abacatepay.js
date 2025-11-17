import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// Configura a conexão com a API AbacatePay
const api = axios.create({
  baseURL: process.env.ABACATEPAY_URL,
  headers: {
    Authorization: `Bearer ${process.env.ABACATEPAY_KEY}`,
    "Content-Type": "application/json"
  }
});

// Função para criar cobrança PIX
export async function criarCobranca(valor, descricao) {
  try {
    const resposta = await api.post("/billing/create", {
      amount: valor,
      description: descricao
    });
    return resposta.data;
  } catch (erro) {
    console.error("Erro ao criar cobrança:", erro.response?.data || erro.message);
    return { error: "Erro ao criar cobrança" };
  }
}

// Função para consultar cobrança
export async function consultarCobranca(id) {
  try {
    const resposta = await api.get(`/billing/get?id=${id}`);
    return resposta.data;
  } catch (erro) {
    console.error("Erro ao consultar cobrança:", erro.response?.data || erro.message);
    return { error: "Erro ao consultar cobrança" };
  }
}
