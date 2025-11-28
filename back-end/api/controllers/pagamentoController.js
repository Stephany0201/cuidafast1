import mercadopago from "mercadopago";
import { criarPreferenciaPagamento } from "../services/mercadoPagoService.js";

// Configuração do Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

export async function criarPagamento(dados) {
  try {
    const { valor, descricao, idUsuario } = dados;

    if (!valor || !descricao) {
      return { error: true, message: "Dados incompletos" };
    }

    const result = await criarPreferenciaPagamento({
      valor,
      descricao,
      usuario_id
    });

    return result;

  } catch (err) {
    console.error("Erro no criarPagamento:", err);
    return { error: true, message: "Erro interno ao criar pagamento" };
  }
}
