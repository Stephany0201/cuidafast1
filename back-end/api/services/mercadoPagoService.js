import mercadopago from "mercadopago";

export async function criarPreferenciaPagamento({ valor, descricao, idUsuario }) {
  try {
    const preference = await mercadopago.preferences.create({
      items: [
        {
          title: descricao,
          quantity: 1,
          unit_price: Number(valor),
          currency_id: "BRL"
        }
      ],

      payer: {
        id: idUsuario || undefined
      },

      back_urls: {
        success: process.env.MP_SUCCESS_URL,
        failure: process.env.MP_FAIL_URL,
        pending: process.env.MP_PENDING_URL
      },

      auto_return: "approved"
    });

    return {
      success: true,
      preference_id: preference.body.id,
      init_point: preference.body.init_point
    };

  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    return { error: true, message: "Erro ao criar preferência" };
  }
}
