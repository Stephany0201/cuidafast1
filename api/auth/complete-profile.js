// server.js
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// (Opcional) CORS se front estiver em domínio diferente
import cors from 'cors';
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*' // ajuste para domínios permitidos em produção
}));

// ENV vars (configure no host)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing SUPABASE env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE.');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

/**
 * POST /api/auth/complete-profile
 * Body: { cpf, data_nascimento, cep, numero, rua, bairro, cidade, estado, complemento }
 * Header: Authorization: Bearer <access_token>  (opcional; fallback: usuario_id in body)
 */
app.post('/api/auth/complete-profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    let auth_uid = null;
    if (token) {
      const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
      if (userErr || !userData?.user) {
        console.warn('getUser error:', userErr, userData);
        return res.status(401).json({ error: 'Token inválido' });
      }
      auth_uid = userData.user.id;
    }

    const {
      usuario_id,
      cpf,
      data_nascimento,
      cep,
      numero,
      rua,
      bairro,
      cidade,
      estado,
      complemento
    } = req.body || {};

    // monta payload sem valores undefined
    const upsertPayload = {};
    if (cpf !== undefined) upsertPayload.cpf = cpf;
    if (data_nascimento !== undefined) upsertPayload.data_nascimento = data_nascimento;
    if (cep !== undefined) upsertPayload.cep = cep;
    if (numero !== undefined) upsertPayload.numero = numero;
    if (rua !== undefined) upsertPayload.rua = rua;
    if (bairro !== undefined) upsertPayload.bairro = bairro;
    if (cidade !== undefined) upsertPayload.cidade = cidade;
    if (estado !== undefined) upsertPayload.estado = estado;
    if (complemento !== undefined) upsertPayload.complemento = complemento;

    if (auth_uid) {
      upsertPayload.auth_uid = auth_uid;
      const { data, error } = await supabaseAdmin
        .from('usuario')
        .upsert(upsertPayload, { onConflict: 'auth_uid' })
        .select()
        .single();

      if (error) {
        console.error('Supabase upsert error:', error);
        return res.status(500).json({ error: 'Erro ao gravar usuário', details: error });
      }
      return res.status(200).json({ user: data });
    }

    if (usuario_id) {
      const { data, error } = await supabaseAdmin
        .from('usuario')
        .update(upsertPayload)
        .eq('id', usuario_id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        return res.status(500).json({ error: 'Erro ao atualizar usuário', details: error });
      }
      return res.status(200).json({ user: data });
    }

    return res.status(400).json({ error: 'Sem token nem usuario_id' });
  } catch (err) {
    console.error('complete-profile unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// rota simples para health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
