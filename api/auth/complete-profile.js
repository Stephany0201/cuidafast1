// exemplo Node/Express (server)
import express from 'express';
import fetch from 'node-fetch'; // ou use supabase admin SDK
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE; // service_role key
// Ou use supabase-js com service role para validar token e manipular DB

// Exemplo usando supabase-js (recomendado)
import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

app.post('/api/auth/complete-profile', async (req, res) => {
  try {
    // 1) Pegar Authorization header
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    // 2) Validar token e obter user via Admin
    // alternativa: supabaseAdmin.auth.getUser(token) (dependendo da lib/version)
    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !user) {
      return res.status(401).json({ error: 'Token inválido ou usuário não autenticado' });
    }

    const auth_uid = user.id;

    // 3) Receber payload
    const {
      cpf, data_nascimento, cep, numero, rua, bairro, cidade, estado, complemento
    } = req.body;

    // 4) Upsert (cria ou atualiza) usuario usando auth_uid
    const upsertPayload = {
      auth_uid,
      cpf,
      data_nascimento,
      cep,
      numero,
      rua,
      bairro,
      cidade,
      estado,
      complemento
      // outros campos que quiser
    };

    // upsert por auth_uid (assumindo constraint unique auth_uid)
    const { data, error } = await supabaseAdmin
      .from('usuario')
      .upsert(upsertPayload, { onConflict: 'auth_uid' })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Erro ao gravar usuário', details: error });
    }

    return res.json({ user: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
  }
});

app.listen(process.env.PORT || 3000);
