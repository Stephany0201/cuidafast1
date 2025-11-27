// Novo SDK Mercado Pago (compatível com Vercel)
import { MercadoPagoConfig, Preference } from "mercadopago";

// Inicialização segura
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});


// Função única: cria a preferência no Mercado Pago
async function criarPreferenciaPagamento({ valor, descricao, idUsuario }) {
  try {
    const preference = new Preference(mpClient);

    const result = await preference.create({
      body: {
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
      }
    });

    return {
      success: true,
      preference_id: result.id,
      init_point: result.init_point
    };

  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    return { error: true, message: "Erro ao criar preferência" };
  }
}


// Função principal da rota
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    // Ler body manualmente porque Vercel às vezes falha no req.body
    const body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", chunk => { data += chunk; });
      req.on("end", () => {
        try {
          resolve(JSON.parse(data || "{}"));
        } catch (err) {
          reject(err);
        }
      });
      req.on("error", reject);
    });

    const { valor, descricao, idUsuario } = body;

    if (!valor || !descricao) {
      return res.status(400).json({ message: "Dados incompletos" });
    }

    const resultado = await criarPreferenciaPagamento({
      valor,
      descricao,
      idUsuario
    });

    return res.status(200).json(resultado);

  } catch (err) {
    console.error("Erro em /pagamento/create:", err);
    return res.status(500).json({ message: "Erro no servidor" });
  }
}