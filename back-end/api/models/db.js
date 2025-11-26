const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Tenta carregar .env do config, mas no Vercel usa variáveis de ambiente direto
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../../config/.env') });
}

// Configuração para Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_KEY devem estar configuradas nas variáveis de ambiente');
}

// Cria o client do Supabase
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Teste de conexão (opcional, apenas para debug)
if (process.env.NODE_ENV !== 'production') {
  console.log('✅ Client Supabase inicializado');
}

module.exports = supabase;
