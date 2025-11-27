import { criarPreferenciaPagamento } from "../services/mercadoPagoService.js";

mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
  });
  
export async function criarPagamento(req, res) {
  const { valor, descricao, idUsuario } = req.body;

  if (!valor || !descricao) {
    return res.status(400).json({ message: "Dados incompletos" });
  }

  const result = await criarPreferenciaPagamento({
    valor,
    descricao,
    idUsuario
  });

  if (result.error) {
    return res.status(500).json(result);
  }

  return res.status(200).json(result);
}