import { createClient } from '@supabase/supabase-js';

// Handler: cria/associa usuário após signUp se user for null
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SERVER_SECRET = process.env.CREATE_USER_SECRET; // proteger endpoint

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server not configured (missing supabase env vars)' });
  }

  // Proteção simples: exigir header 'x-create-secret' igual a CREATE_USER_SECRET
  const sentSecret = req.headers['x-create-secret'] || req.body?.secret;
  if (SERVER_SECRET && sentSecret !== SERVER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid secret' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const body = Array.isArray(req.body) ? req.body[0] : req.body;
  const { email, name, phone, cpf, birth_date, role, address, avatar_path } = body || {};

  if (!email) return res.status(400).json({ error: 'email is required' });

  try {
    // 1) procurar user do auth por email
    const { data: users, error: listErr } = await supabase.auth.admin.listUsers({ filter: `email.eq.${email}` });
    if (listErr) throw listErr;

    const foundUser = users?.[0] ?? null;

    // se encontrou e está confirmado -> associar / criar usuario+cliente|cuidador
    if (foundUser && foundUser.confirmed_at) {
      const authUid = foundUser.id;

      // procurar usuario existente por email
      const { data: existingUser, error: exErr } = await supabase.from('usuario').select('id').eq('email', email).limit(1).single().catch(() => ({ data: null }));
      if (exErr && !existingUser) {
        // se erro diferente de "no rows", lançar
        // alguns adaptadores retornam erro quando não existe; ignore esse caso
      }

      if (existingUser && existingUser.id) {
        // atualizar auth_uid se necessário
        await supabase.from('usuario').update({ auth_uid: authUid }).eq('id', existingUser.id);
        // garantir que exista cliente/cuidador conforme role
        if (role === 'cliente') {
          await supabase.from('cliente').insert([{ usuario_id: existingUser.id }]).catch(()=>{});
        } else if (role === 'cuidador') {
          await supabase.from('cuidador').insert([{ usuario_id: existingUser.id }]).catch(()=>{});
        }
        return res.status(200).json({ ok: true, note: 'associated_existing_usuario', usuario_id: existingUser.id });
      } else {
        // criar novo usuario vinculado ao auth uid
        const insertPayload = {
          nome: name || email.split('@')[0],
          email,
          telefone: phone || null,
          data_nascimento: birth_date || null,
          cpf_numero: cpf || null,
          auth_uid: authUid
        };
        const { data: newU, error: newUErr } = await supabase.from('usuario').insert([insertPayload]).select('id').single();
        if (newUErr) throw newUErr;
        const usuarioId = newU.id;
        if (role === 'cliente') {
          await supabase.from('cliente').insert([{ usuario_id: usuarioId }]).catch(()=>{});
        } else if (role === 'cuidador') {
          await supabase.from('cuidador').insert([{ usuario_id: usuarioId }]).catch(()=>{});
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
      const { data: pendingData, error: pendingErr } = await supabase.from('pending_signups').insert([pending]).select('id').single();
      if (pendingErr) throw pendingErr;
      return res.status(200).json({ ok: true, note: 'saved_pending', pending_id: pendingData.id });
    }
  } catch (err) {
    console.error('create-or-associate-user error', err);
    return res.status(500).json({ error: err.message || err });
  }
}
