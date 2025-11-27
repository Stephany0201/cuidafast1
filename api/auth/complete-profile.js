import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// ENV vars (configure no host)
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
    let saUser = null;

    // Se houver token, valida e pega metadata do Supabase Auth (Google)
    if (token) {
      const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
      if (userErr || !userData?.user) {
        console.warn('getUser error:', userErr, userData);
        return res.status(401).json({ error: 'Token inválido' });
      }
      saUser = userData.user;
      auth_uid = saUser.id;

      // tenta extrair nome do metadata do provedor
      nomeFromAuth =
        saUser.user_metadata?.full_name ||
        saUser.user_metadata?.name ||
        saUser.user_metadata?.given_name ||
        (saUser.email ? saUser.email.split('@')[0] : null);
    }

    // Destruturação controlada (não pegar senha aqui)
    const {
      usuario_id,
      nome: nomeDoPayload,
      email: emailDoPayload,
      photo_url,
      // resto do payload será lido por restBody
      ...restBody
    } = req.body || {};

    // ---------------------
    // FILTRAGEM SEGURA DO PAYLOAD (antes do upsert)
    // ---------------------
    const allowedColumns = new Set([
      'nome','email','telefone','data_cadastro','ultimo_login',
      'data_nascimento','rg_numero','rg_orgao_emissor','rg_data_emissao',
      'cpf_numero','rg_status_validacao','cpf_status_validacao',
      'tipo','auth_uid','photo_url',
      'cep','numero','rua','bairro','cidade','estado','complemento'
    ]);

    const upsertPayload = {};
    for (const [k, v] of Object.entries(restBody)) {
      if (v === undefined || v === null) continue;
      if (!allowedColumns.has(k)) continue;
      upsertPayload[k] = v;
    }

    if (emailDoPayload !== undefined && emailDoPayload !== null) upsertPayload.email = emailDoPayload;
    if (photo_url !== undefined && photo_url !== null) upsertPayload.photo_url = photo_url;

    // garantir nome
    let nomeToUse = nomeDoPayload ?? nomeFromAuth ?? (emailDoPayload ? emailDoPayload.split('@')[0] : null);
    if (!nomeToUse) nomeToUse = 'Usuário';
    upsertPayload.nome = nomeToUse;

    // incluir auth_uid se disponível (para upsert por auth_uid)
    if (auth_uid) upsertPayload.auth_uid = auth_uid;

    // ---------------------
    // FAZER UPSERT ou UPDATE conforme fluxo
    // ---------------------

    // Caso token esteja disponível → upsert por auth_uid
    if (auth_uid) {
      // garantir que id não será enviado manualmente
      delete upsertPayload.id;

      const { data, error } = await supabaseAdmin
        .from('usuario')
        .upsert(upsertPayload, { onConflict: 'auth_uid' })
        .select();

      if (error) {
        console.error('Supabase upsert error:', error);
        return res.status(500).json({ error: 'Erro ao gravar usuário', details: error });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado para upsert' });
      }

      return res.status(200).json({ user: data[0] });
    }

    // Caso não tenha token → atualizar por usuario_id
    if (usuario_id !== undefined && usuario_id !== null && usuario_id !== '') {
      const isUuid = typeof usuario_id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(usuario_id);
      let query;
      if (isUuid) {
        query = supabaseAdmin.from('usuario').update(upsertPayload).eq('auth_uid', usuario_id);
      } else {
        const idNum = Number(usuario_id);
        if (!Number.isFinite(idNum) || !Number.isInteger(idNum)) {
          return res.status(400).json({ error: 'usuario_id inválido' });
        }
        query = supabaseAdmin.from('usuario').update(upsertPayload).eq('id', idNum);
      }

      const { data, error } = await query.select();

      if (error) {
        console.error('Supabase update error:', error);
        return res.status(500).json({ error: 'Erro ao atualizar usuário', details: error });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado para atualização' });
      }

      return res.status(200).json({ user: data[0] });
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
