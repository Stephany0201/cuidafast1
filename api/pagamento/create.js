import { criarPagamento } from "../../back-end/api/controllers/pagamentoController.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  
  try {
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

    const resultado = await criarPagamento(body);
    return res.status(200).json(resultado);

  } catch (err) {
    console.error("Erro em /pagamento/create:", err);
    return res.status(500).json({ message: "Erro no servidor" });
  }
}
