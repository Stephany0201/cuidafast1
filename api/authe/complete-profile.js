import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// ENV vars
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing SUPABASE env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE.');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    let auth_uid = null;
    let nomeFromAuth = null;
    let emailFromAuth = null;

    // Se houver token, pega ID do Google, nome e email
    if (token) {
      const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
      if (userErr || !userData?.user) {
        console.warn('getUser error:', userErr, userData);
        return res.status(401).json({ error: 'Token inválido' });
      }
      const saUser = userData.user;
      auth_uid = saUser.id;

      nomeFromAuth =
        saUser.user_metadata?.full_name ||
        saUser.user_metadata?.name ||
        saUser.user_metadata?.given_name ||
        (saUser.email ? saUser.email.split('@')[0] : null);

      emailFromAuth = saUser.email || null;
    }

    let { usuario_id, nome: nomeDoPayload, email: emailDoPayload, photo_url, ...restBody } = req.body || {};

    const allowedColumns = new Set([
      'nome','email','telefone','data_cadastro','ultimo_login',
      'data_nascimento','rg_numero','rg_orgao_emissor','rg_data_emissao',
      'cpf_numero','rg_status_validacao','cpf_status_validacao',
      'tipo','photo_url',
      'cep','numero','rua','bairro','cidade','estado','complemento'
    ]);

    const upsertPayload = {};
    for (const [k, v] of Object.entries(restBody)) {
      if (v === undefined || v === null) continue;
      if (!allowedColumns.has(k)) continue;
      upsertPayload[k] = v;
    }

    // Nome
    const nomeToUse = nomeDoPayload ?? nomeFromAuth ?? 'Usuário';
    upsertPayload.nome = nomeToUse;

    // Photo
    if (photo_url) upsertPayload.photo_url = photo_url;

    // Email: primeiro do Google, se não tiver, do payload
    if (emailFromAuth) {
      upsertPayload.email = emailFromAuth;
    } else if (emailDoPayload && emailDoPayload.trim() !== '') {
      upsertPayload.email = emailDoPayload.trim();
    } else {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // auth_uid separado do usuario_id (INTEGER)
    if (auth_uid) {
      upsertPayload.auth_uid = auth_uid;
    }

    // usuario_id INTEGER (PK interna)
    let numericUsuarioId = null;
    if (usuario_id !== undefined && usuario_id !== null && usuario_id !== '') {
      numericUsuarioId = Number(usuario_id);
      if (!Number.isInteger(numericUsuarioId)) {
        return res.status(400).json({ error: 'usuario_id inválido' });
      }
      upsertPayload.usuario_id = numericUsuarioId;
    }

    // Upsert: prioridade de conflito -> auth_uid (quando existir) ou email (único)
    const upsertKey = auth_uid ? 'auth_uid' : 'email';

    const { data, error } = await supabaseAdmin
      .from('usuario')
      .upsert(upsertPayload, { onConflict: upsertKey })
      .select();

    if (error) {
      console.error('Supabase upsert error:', error);
      return res.status(500).json({ error: 'Erro ao gravar usuário', details: error });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado para upsert' });
    }

    return res.status(200).json({ user: data[0] });

  } catch (err) {
    console.error('complete-profile unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
