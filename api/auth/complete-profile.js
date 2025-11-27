import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// ENV vars
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing SUPABASE env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE.');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

/**
 * POST /api/auth/complete-profile
 * Body: { cpf, data_nascimento, cep, numero, rua, bairro, cidade, estado, complemento, nome?, email?, photo_url?, usuario_id? }
 * Header: Authorization: Bearer <access_token>  (opcional; fallback: usuario_id in body)
 */
app.post('/api/auth/complete-profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    let auth_uid = null;
    let nomeFromAuth = null;

    // Token Supabase Auth
    if (token) {
      const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
      if (userErr || !userData?.user) {
        console.warn('getUser error:', userErr, userData);
        return res.status(401).json({ error: 'Token inválido' });
      }
      auth_uid = userData.user.id;

      nomeFromAuth =
        userData.user.user_metadata?.full_name ||
        userData.user.user_metadata?.name ||
        userData.user.user_metadata?.given_name ||
        (userData.user.email ? userData.user.email.split('@')[0] : null);
    }

    const {
      usuario_id,
      nome: nomeDoPayload,
      email: emailDoPayload,
      photo_url,
      ...restBody
    } = req.body || {};

    // Campos permitidos
    const allowedColumns = new Set([
      'nome','email','telefone','data_cadastro','ultimo_login',
      'data_nascimento','rg_numero','rg_orgao_emissor','rg_data_emissao',
      'cpf_numero','rg_status_validacao','cpf_status_validacao',
      'tipo','auth_uid','photo_url',
      'cep','numero','rua','bairro','cidade','estado','complemento'
    ]);

    const payload = {};
    for (const [k, v] of Object.entries(restBody)) {
      if (v == null) continue;
      if (!allowedColumns.has(k)) continue;
      payload[k] = v;
    }

    if (emailDoPayload) payload.email = emailDoPayload;
    if (photo_url) payload.photo_url = photo_url;

    // Nome obrigatório
    let nomeToUse = nomeDoPayload ?? nomeFromAuth ?? (emailDoPayload ? emailDoPayload.split('@')[0] : 'Usuário');
    payload.nome = nomeToUse;

    // Inclui auth_uid se houver
    if (auth_uid) payload.auth_uid = auth_uid;

    // -----------------------
    // UPDATES / UPSERTS
    // -----------------------

    // 1️⃣ Atualizar ou criar via token/auth_uid
    if (auth_uid) {
      const { data, error } = await supabaseAdmin
        .from('usuario')
        .upsert(payload, { onConflict: 'auth_uid' })
        .select()
        .single()
        .catch(err => ({ data: null, error: err }));

      if (error) return res.status(500).json({ error: 'Erro ao gravar usuário', details: error });
      return res.status(200).json({ user: data });
    }

    // 2️⃣ Atualizar via usuario_id
    if (usuario_id) {
      const isUuid = typeof usuario_id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(usuario_id);
      let query;
      if (isUuid) {
        query = supabaseAdmin.from('usuario').update(payload).eq('auth_uid', usuario_id);
      } else {
        const idNum = Number(usuario_id);
        if (!Number.isInteger(idNum)) return res.status(400).json({ error: 'usuario_id inválido' });
        query = supabaseAdmin.from('usuario').update(payload).eq('id', idNum);
      }

      const { data, error } = await query.select().single().catch(err => ({ data: null, error: err }));
      if (error) return res.status(500).json({ error: 'Erro ao atualizar usuário', details: error });
      if (!data) return res.status(404).json({ error: 'Usuário não encontrado para atualização' });
      return res.status(200).json({ user: data });
    }

    // 3️⃣ Nenhum token nem usuario_id → criar novo usuário
    const { data, error } = await supabaseAdmin.from('usuario').insert([payload]).select().single().catch(err => ({ data: null, error: err }));
    if (error) return res.status(500).json({ error: 'Erro ao criar usuário', details: error });
    return res.status(200).json({ user: data });

  } catch (err) {
    console.error('complete-profile unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
