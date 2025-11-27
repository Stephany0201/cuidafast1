import { criarPreferenciaPagamento } from "../services/mercadoPagoService.js";

export async function criarPagamento(dados) {
  try {
    const { valor, descricao, idUsuario } = dados;

    if (!valor || !descricao) {
      return { error: true, message: "Dados incompletos" };
    }

    const result = await criarPreferenciaPagamento({
      valor,
      descricao,
      idUsuario
    });

    return result;

  } catch (err) {
    console.error("Erro no criarPagamento:", err);
    return { error: true, message: "Erro interno ao criar pagamento" };
  }
}
