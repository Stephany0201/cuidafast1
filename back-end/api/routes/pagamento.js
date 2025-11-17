const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { criarCobranca, consultarCobranca } = require('../services/abacatepay.service');

// criar cobrança (valor em centavos)
router.post('/create', async (req, res) => {
  try {
    const { valor_cents, descricao, usuarioId, cuidadorId } = req.body;

    if (!valor_cents || !descricao) {
      return res.status(400).json({ error: 'valor_cents e descricao são obrigatórios' });
    }

    // calcula taxa e líquido (em centavos)
    const taxa_cents = Math.round(valor_cents * 0.10);
    const valor_liquido_cents = valor_cents - taxa_cents;

    // cria cobrança na AbacatePay
    const resultado = await criarCobranca(valor_cents, descricao, usuarioId);

    if (resultado.error) {
      return res.status(400).json({ error: resultado.error });
    }

    const pagamentoApi = resultado.data; // conforme doc: { id, url, status, ... }

    // salva no banco
    await db.query(
      `INSERT INTO pagamentos 
        (id_pagamento_api, status, valor_cents, usuario_id, cuidador_id, taxa_cents, valor_liquido_cents)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [pagamentoApi.id, pagamentoApi.status || 'PENDING', valor_cents, usuarioId || null, cuidadorId || null, taxa_cents, valor_liquido_cents]
    );

    res.json({
      id: pagamentoApi.id,
      status: pagamentoApi.status,
      url: pagamentoApi.url,
      methods: pagamentoApi.methods,
      valor_cents,
      taxa_cents,
      valor_liquido_cents
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar cobrança' });
  }
});

// consultar status e atualizar no DB
router.get('/status/:id', async (req, res) => {
  try {
    const idPagamento = req.params.id;
    const resultado = await consultarCobranca(idPagamento);

    if (resultado.error) return res.status(400).json({ error: resultado.error });

    const pagamentoApi = resultado.data;

    await db.query(
      `UPDATE pagamentos SET status = $1, data_atualizacao = NOW() WHERE id_pagamento_api = $2`,
      [pagamentoApi.status, idPagamento]
    );

    res.json(pagamentoApi);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao consultar pagamento' });
  }
});

// listar pagamentos confirmados e não repassados
router.get('/pendentes', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id_pagamento_api, status, valor_cents, taxa_cents, valor_liquido_cents, usuario_id, cuidador_id, repassado, data_criacao 
       FROM pagamentos WHERE status = 'CONFIRMED' AND repassado = FALSE`
    );
    const rows = result.rows;
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar pagamentos pendentes' });
  }
});

// marcar repasse manual concluído
router.post('/repassar/:id', async (req, res) => {
  try {
    const idPagamento = req.params.id;
    const result = await db.query('SELECT * FROM pagamentos WHERE id_pagamento_api = $1', [idPagamento]);
    const rows = result.rows;

    if (rows.length === 0) return res.status(404).json({ error: 'Pagamento não encontrado' });

    const pagamento = rows[0];
    if (pagamento.status !== 'CONFIRMED') return res.status(400).json({ error: 'Pagamento ainda não confirmado' });
    if (pagamento.repassado) return res.status(400).json({ error: 'Pagamento já foi repassado' });

    await db.query('UPDATE pagamentos SET repassado = TRUE, data_repasse = NOW() WHERE id_pagamento_api = $1', [idPagamento]);

    res.json({
      mensagem: 'Repasse marcado como concluído.',
      cuidador_id: pagamento.cuidador_id,
      valor_repassado_cents: pagamento.valor_liquido_cents
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao marcar repasse' });
  }
});

module.exports = router;

