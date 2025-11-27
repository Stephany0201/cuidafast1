import { MercadoPagoConfig, Preference } from "mercadopago";

export async function criarPreferenciaPagamento({ valor, descricao, idUsuario }) {
  try {
    // Verificar se o token de acesso está configurado
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error("MERCADOPAGO_ACCESS_TOKEN não configurado");
      return { error: true, message: "Configuração do Mercado Pago não encontrada" };
    }

    // Configurar o cliente do Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
    });

    // Criar instância de Preference
    const preference = new Preference(client);

    // Criar a preferência de pagamento
    const response = await preference.create({
      body: {
        items: [
          {
            title: descricao,
            quantity: 1,
            unit_price: Number(valor),
            currency_id: "BRL"
          }
        ],
        payer: idUsuario ? {
          id: idUsuario
        } : undefined,
        back_urls: {
          success: process.env.MP_SUCCESS_URL || "",
          failure: process.env.MP_FAIL_URL || "",
          pending: process.env.MP_PENDING_URL || ""
        },
        auto_return: "approved"
      }
    });

    return {
      success: true,
      preference_id: response.id,
      init_point: response.init_point
    };

  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    console.error("Detalhes do erro:", error.message);
    return { error: true, message: error.message || "Erro ao criar preferência" };
  }
}
