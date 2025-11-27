import authController from '../back-end/api/controllers/authController.js';
import cadastroController from '../back-end/api/controllers/cadastroController.js';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CREATE_USER_SECRET = process.env.CREATE_USER_SECRET;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE);

export default async function handler(req, res) {
  const { method, url } = req;

<<<<<<< HEAD
  // Teste da rota
=======
  // -----------------------
  // HEALTH CHECK
  // -----------------------
>>>>>>> 247f167439afad6341135e5638ae15851c75e252
  if (url.endsWith('/auth') && method === 'GET') {
    return res.status(200).json({ ok: true, rota: 'auth funcionando! kkk' });
  }

<<<<<<< HEAD
  // LOGIN
  if (url.endsWith('/auth/login') && method === 'POST') {
    return authController.login(req, res);
  }

  // LOGOUT
  if (url.endsWith('/auth/logout') && method === 'POST') {
    return authController.logout(req, res);
  }

  // REGISTER
  if (url.endsWith('/auth/register') && method === 'POST') {
    return authController.register(req, res);
  }

  // REFRESH TOKEN
  if (url.endsWith('/auth/refresh') && method === 'POST') {
    return authController.refresh(req, res);
  }
//google
  if (url.endsWith('/auth/google-login') && method === 'POST')
    return authController.googleLogin(req, res);

=======
  // -----------------------
  // LOGIN / LOGOUT / REFRESH / GOOGLE LOGIN
  // -----------------------
  if (url.endsWith('/auth/login') && method === 'POST') {
    return authController.login(req, res);
  }
  if (url.endsWith('/auth/logout') && method === 'POST') {
    return authController.logout(req, res);
  }
  if (url.endsWith('/auth/refresh') && method === 'POST') {
    return authController.refresh(req, res);
  }
  if (url.endsWith('/auth/google-login') && method === 'POST') {
    return authController.googleLogin(req, res);
  }

  // -----------------------
  // REGISTER
  // -----------------------
  if (url.endsWith('/auth/register') && method === 'POST') {
    return cadastroController.register(req, res);
  }

  // -----------------------
  // COMPLETE PROFILE (from complete-profile.js)
  // -----------------------
  if (url.endsWith('/auth/complete-profile') && method === 'POST') {
    return completeProfile(req, res);
  }

  // -----------------------
  // CREATE OR ASSOCIATE USER (from create-or-associate-user.js)
  // -----------------------
  if (url.endsWith('/auth/create-or-associate-user') && method === 'POST') {
    return createOrAssociateUser(req, res);
  }

>>>>>>> 247f167439afad6341135e5638ae15851c75e252
  // DEFAULT
  return res.status(404).json({ error: 'Rota não encontrada' });
}

// -----------------------
// COMPLETE PROFILE (integrado)
// -----------------------
async function completeProfile(req, res) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    let auth_uid = null;
    let nomeFromAuth = null;
    let saUser = null;

    if (token) {
      const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
      if (userErr || !userData?.user) {
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

    const { usuario_id, nome: nomeDoPayload, email: emailDoPayload, photo_url, ...restBody } = req.body || {};

    const allowedColumns = new Set([
      'nome','email','telefone','data_cadastro','ultimo_login',
      'data_nascimento','rg_numero','rg_orgao_emissor','rg_data_emissao',
      'cpf_numero','rg_status_validacao','cpf_status_validacao',
      'tipo','auth_uid','photo_url',
      'cep','numero','rua','bairro','cidade','estado','complemento'
    ]);

    const upsertPayload = {};
    for (const [k,v] of Object.entries(restBody)) {
      if (v == null) continue;
      if (!allowedColumns.has(k)) continue;
      upsertPayload[k] = v;
    }
    if (emailDoPayload) upsertPayload.email = emailDoPayload;
    if (photo_url) upsertPayload.photo_url = photo_url;

    let nomeToUse = nomeDoPayload ?? nomeFromAuth ?? (emailDoPayload ? emailDoPayload.split('@')[0] : 'Usuário');
    upsertPayload.nome = nomeToUse;

    if (auth_uid) upsertPayload.auth_uid = auth_uid;

    if (auth_uid) {
      const { data, error } = await supabaseAdmin
        .from('usuario')
        .upsert(upsertPayload, { onConflict: 'auth_uid' })
        .select()
        .single();
      if (error) return res.status(500).json({ error: 'Erro ao gravar usuário', details: error });
      return res.status(200).json({ user: data });
    }

    if (usuario_id != null && usuario_id !== '') {
      const isUuid = typeof usuario_id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(usuario_id);
      let query;
      if (isUuid) query = supabaseAdmin.from('usuario').update(upsertPayload).eq('auth_uid', usuario_id);
      else {
        const idNum = Number(usuario_id);
        if (!Number.isInteger(idNum)) return res.status(400).json({ error: 'usuario_id inválido' });
        query = supabaseAdmin.from('usuario').update(upsertPayload).eq('id', idNum);
      }
      const { data, error } = await query.select().single();
      if (error) return res.status(500).json({ error: 'Erro ao atualizar usuário', details: error });
      return res.status(200).json({ user: data });
    }

    return res.status(400).json({ error: 'Sem token nem usuario_id' });
  } catch (err) {
    console.error('complete-profile error', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

// -----------------------
// CREATE OR ASSOCIATE USER (integrado)
// -----------------------
async function createOrAssociateUser(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const sentSecret = req.headers['x-create-secret'] || req.body?.secret;
  if (CREATE_USER_SECRET && sentSecret !== CREATE_USER_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  const body = Array.isArray(req.body) ? req.body[0] : req.body;
  const { email, name, phone, cpf, birth_date, role, address, avatar_path } = body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });

  try {
    const { data: users, error: listErr } = await supabase.auth.admin.listUsers({ filter: `email.eq.${email}` });
    if (listErr) throw listErr;
    const foundUser = users?.[0] ?? null;

    if (foundUser && foundUser.confirmed_at) {
      const authUid = foundUser.id;
      const { data: existingUser } = await supabase.from('usuario').select('id').eq('email', email).limit(1).single().catch(()=>({ data:null }));
      if (existingUser && existingUser.id) {
        await supabase.from('usuario').update({ auth_uid: authUid }).eq('id', existingUser.id);
        if (role==='cliente') await supabase.from('cliente').insert([{ usuario_id: existingUser.id }]).catch(()=>{});
        else if (role==='cuidador') await supabase.from('cuidador').insert([{ usuario_id: existingUser.id }]).catch(()=>{});
        return res.status(200).json({ ok:true, note:'associated_existing_usuario', usuario_id: existingUser.id });
      } else {
        const insertPayload = { nome:name||email.split('@')[0], email, telefone: phone||null, data_nascimento:birth_date||null, cpf_numero:cpf||null, auth_uid:authUid };
        const { data: newU, error: newUErr } = await supabase.from('usuario').insert([insertPayload]).select('id').single();
        if (newUErr) throw newUErr;
        const usuarioId = newU.id;
        if (role==='cliente') await supabase.from('cliente').insert([{ usuario_id: usuarioId }]).catch(()=>{});
        else if (role==='cuidador') await supabase.from('cuidador').insert([{ usuario_id: usuarioId }]).catch(()=>{});
        return res.status(200).json({ ok:true, usuario_id: usuarioId });
      }
    } else {
      const pending = { email, name:name||null, phone:phone||null, cpf:cpf||null, birth_date:birth_date||null, role:role||null, address:address?JSON.stringify(address):null, avatar_path:avatar_path||null, created_at:new Date() };
      const { data: pendingData, error: pendingErr } = await supabase.from('pending_signups').insert([pending]).select('id').single();
      if (pendingErr) throw pendingErr;
      return res.status(200).json({ ok:true, note:'saved_pending', pending_id: pendingData.id });
    }
  } catch (err) {
    console.error('create-or-associate-user error', err);
    return res.status(500).json({ error: err.message || err });
  }
}
