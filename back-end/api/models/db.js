const { Pool } = require('pg');
const path = require('path');

// Tenta carregar .env do config, mas no Vercel usa variáveis de ambiente direto
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../../config/.env') });
}

// Configuração para Supabase PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Teste de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao Supabase PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool de conexão:', err);
});

module.exports = pool;
