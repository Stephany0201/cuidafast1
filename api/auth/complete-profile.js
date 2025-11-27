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

    let idFromGoogle = null;
    let nomeFromAuth = null;

    // Se houver token, pega ID do Google e nome
    if (token) {
      const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
      if (userErr || !userData?.user) {
        console.warn('getUser error:', userErr, userData);
        return res.status(401).json({ error: 'Token inválido' });
      }
      const saUser = userData.user;
      idFromGoogle = saUser.id;

      nomeFromAuth =
        saUser.user_metadata?.full_name ||
        saUser.user_metadata?.name ||
        saUser.user_metadata?.given_name ||
        (saUser.email ? saUser.email.split('@')[0] : null);
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

    if (emailDoPayload) upsertPayload.email = emailDoPayload;
    if (photo_url) upsertPayload.photo_url = photo_url;

    let nomeToUse = nomeDoPayload ?? nomeFromAuth ?? (emailDoPayload ? emailDoPayload.split('@')[0] : 'Usuário');
    upsertPayload.nome = nomeToUse;

    // ---------------------
    // Aqui vai o ID do usuário: Google ou fallback
    if (idFromGoogle) {
      upsertPayload.id = idFromGoogle;
    } else if (!usuario_id || usuario_id === '') {
      // fallback de teste, não nulo
      const randomTestId = Math.floor(Math.random() * 10000) + 1;
      upsertPayload.id = randomTestId;
      console.log('[TEST] usando ID aleatório:', randomTestId);
    } else {
      upsertPayload.id = usuario_id;
    }

    // ---------------------
    // Upsert direto pelo ID
    const { data, error } = await supabaseAdmin
      .from('usuario')
      .upsert(upsertPayload, { onConflict: 'id' })
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
