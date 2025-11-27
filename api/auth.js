// server.js (UNIFICADO: complete-profile + create-or-associate-user + router /api/auth/*)
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
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
const CREATE_USER_SECRET = process.env.CREATE_USER_SECRET || process.env.SERVERLESS_CREATE_SECRET;

// basic check
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('❌ Missing SUPABASE env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE.');
}

// admin client (service role) — usado por todos os handlers
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

/* -------------------------------------------------------------------------- */
/*  POST /api/auth/complete-profile                                           */
/*  (mantive a lógica que você já usava — upsert por auth_uid ou update por id) */
/* -------------------------------------------------------------------------- */
app.post('/api/auth/complete-profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    let auth_uid = null;
    let nomeFromAuth = null;
    let saUser = null;

    if (token) {
      const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
      if (userErr || !userData?.user) {
        console.warn('getUser error:', userErr, userData);
        return res.status(401).json({ error: 'Token inválido' });
      }
      saUser = userData.user;
      auth_uid = saUser.id;
      nomeFromAuth =
        saUser.user_metadata?.full_name ||
        saUser.user_metadata?.name ||
        saUser.user_metadata?.given_name ||
        (saUser.email ? saUser.email.split('@')[0] : null);
    }

    const {
      usuario_id,
      nome: nomeDoPayload,
      email: emailDoPayload,
      photo_url,
      ...restBody
    } = req.body || {};

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

    let nomeToUse = nomeDoPayload ?? nomeFromAuth ?? (emailDoPayload ? emailDoPayload.split('@')[0] : null);
    if (!nomeToUse) nomeToUse = 'Usuário';
    upsertPayload.nome = nomeToUse;

    if (auth_uid) upsertPayload.auth_uid = auth_uid;

    // Flow: if OAuth token present -> upsert by auth_uid; else update by usuario_id (uuid or integer)
    if (auth_uid) {
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

    if (usuario_id !== undefined && usuario_id !== null && usuario_id !== '') {
      const isUuid = typeof usuario_id === 'string' &&
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(usuario_id);
      try {
        let query;
        if (isUuid) {
          // update by auth_uid (UUID) OR by id_uuid depending on schema — we try auth_uid as you used before
          query = supabaseAdmin.from('usuario').update(upsertPayload).eq('auth_uid', usuario_id);
        } else {
          const idNum = Number(usuario_id);
          if (!Number.isFinite(idNum) || !Number.isInteger(idNum)) {
            return res.status(400).json({ error: 'usuario_id inválido' });
          }
          query = supabaseAdmin.from('usuario').update(upsertPayload).eq('id', idNum);
        }

        const { data, error } = await query.select().single();
        if (error) {
          console.error('Supabase update error:', error);
          return res.status(500).json({ error: 'Erro ao atualizar usuário', details: error });
        }
        return res.status(200).json({ user: data });
      } catch (err) {
        console.error('update branch unexpected error:', err);
        return res.status(500).json({ error: 'Erro interno ao atualizar usuário', message: err.message });
      }
    }

    return res.status(400).json({ error: 'Sem token nem usuario_id' });
  } catch (err) {
    console.error('complete-profile unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/*  POST /api/create-or-associate-user                                         */
/*  (junta a lógica do arquivo create-or-associate-user.js que você tinha)     */
/* -------------------------------------------------------------------------- */
app.post('/api/create-or-associate-user', async (req, res) => {
  // proteger por método
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Proteção simples: exigir header 'x-create-secret' igual a CREATE_USER_SECRET, se configurado
  const sentSecret = req.headers['x-create-secret'] || req.body?.secret;
  if (CREATE_USER_SECRET && sentSecret !== CREATE_USER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid secret' });
  }

  try {
    const body = Array.isArray(req.body) ? req.body[0] : req.body;
    const { email, name, phone, cpf, birth_date, role, address, avatar_path } = body || {};
    if (!email) return res.status(400).json({ error: 'email is required' });

    // 1) procurar user do auth por email (admin API)
    const { data: users, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ filter: `email.eq.${email}` });
    if (listErr) throw listErr;

    const foundUser = users?.[0] ?? null;

    if (foundUser && foundUser.confirmed_at) {
      const authUid = foundUser.id;

      // procurar usuario existente por email
      let existingUser = null;
      try {
        const { data, error } = await supabaseAdmin.from('usuario').select('id').eq('email', email).limit(1).single();
        if (!error) existingUser = data;
      } catch (e) { /* ignore row-not-found style errors */ }

      if (existingUser && existingUser.id) {
        // atualizar auth_uid se necessário
        await supabaseAdmin.from('usuario').update({ auth_uid: authUid }).eq('id', existingUser.id);

        // garantir que exista cliente/cuidador conforme role
        if (role === 'cliente') {
          await supabaseAdmin.from('cliente').insert([{ usuario_id: existingUser.id }]).catch(()=>{});
        } else if (role === 'cuidador') {
          await supabaseAdmin.from('cuidador').insert([{ usuario_id: existingUser.id }]).catch(()=>{});
        }
        return res.status(200).json({ ok: true, note: 'associated_existing_usuario', usuario_id: existingUser.id });
      } else {
        // criar novo usuario vinculado ao auth uid
        const insertPayload = {
          nome: name || (email.split('@')[0]),
          email,
          telefone: phone || null,
          data_nascimento: birth_date || null,
          cpf_numero: cpf || null,
          auth_uid: authUid
        };
        const { data: newU, error: newUErr } = await supabaseAdmin.from('usuario').insert([insertPayload]).select('id').single();
        if (newUErr) throw newUErr;
        const usuarioId = newU.id;
        if (role === 'cliente') {
          await supabaseAdmin.from('cliente').insert([{ usuario_id: usuarioId }]).catch(()=>{});
        } else if (role === 'cuidador') {
          await supabaseAdmin.from('cuidador').insert([{ usuario_id: usuarioId }]).catch(()=>{});
        }
        return res.status(200).json({ ok: true, usuario_id: usuarioId });
      }
    } else {
      // Usuário não encontrado ou não confirmado → salvar em pending_signups
      const pending = {
        email,
        name: name || null,
        phone: phone || null,
        cpf: cpf || null,
        birth_date: birth_date || null,
        role: role || null,
        address: address ? JSON.stringify(address) : null,
        avatar_path: avatar_path || null,
        created_at: new Date()
      };
      const { data: pendingData, error: pendingErr } = await supabaseAdmin.from('pending_signups').insert([pending]).select('id').single();
      if (pendingErr) throw pendingErr;
      return res.status(200).json({ ok: true, note: 'saved_pending', pending_id: pendingData.id });
    }
  } catch (err) {
    console.error('create-or-associate-user error', err);
    return res.status(500).json({ error: err.message || err });
  }
});

/* -------------------------------------------------------------------------- */
/*  Router /api/auth/*  (encaminha para authController se existir)             */
/*  mantém: /auth/login, /auth/logout, /auth/register, /auth/refresh,         */
/*  /auth/google-login etc.                                                    */
/* -------------------------------------------------------------------------- */
let authController;
try {
  // ajuste o caminho se necessário (preserve sua estrutura de pastas)
  authController = (await import('./back-end/api/controllers/authController.js')).default;
} catch (e) {
  console.warn('authController not found or failed to import. /api/auth/* routes will return 501 for controller actions.', e?.message || e);
}

// single entrypoint for /api/auth*
app.all('/api/auth*', async (req, res) => {
  const { method, url } = req;

  // health-check like test
  if (url.endsWith('/auth') && method === 'GET') {
    return res.status(200).json({ ok: true, rota: 'auth funcionando! kkk' });
  }

  if (!authController) {
    // If controller missing, keep minimal behavior (useful for local dev)
    // implement only a few helpful responses; otherwise 501
    if (url.endsWith('/auth') && method === 'GET') {
      return res.status(200).json({ ok: true });
    }
    return res.status(501).json({ error: 'Auth controller not available on server' });
  }

  // delegate to controller (keep your original routes)
  try {
    if (url.endsWith('/auth/login') && method === 'POST') return authController.login(req, res);
    if (url.endsWith('/auth/logout') && method === 'POST') return authController.logout(req, res);
    if (url.endsWith('/auth/register') && method === 'POST') return authController.register(req, res);
    if (url.endsWith('/auth/refresh') && method === 'POST') return authController.refresh(req, res);
    if (url.endsWith('/auth/google-login') && method === 'POST') return authController.googleLogin(req, res);

    // default
    return res.status(404).json({ error: 'Rota auth não encontrada' });
  } catch (err) {
    console.error('Error in authController delegation:', err);
    return res.status(500).json({ error: 'Internal server error in authController', message: err?.message });
  }
});

/* -------------------------------------------------------------------------- */
/*  Health                                                                    */
/* -------------------------------------------------------------------------- */
app.get('/api/health', (req, res) => res.json({ ok: true }));

/* -------------------------------------------------------------------------- */
/*  Start server                                                               */
/* -------------------------------------------------------------------------- */
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

export default app;
