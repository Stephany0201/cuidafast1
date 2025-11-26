// Public/JS/cadastroComplemento.js
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://kgwepkcxmsoyebxczqwe.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tdndpY2V0b2pocXVyZGV1ZXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTI5MTEsImV4cCI6MjA3ODk4ODkxMX0.3XyOux7wjBIC2kIlmdSCTYzznzZOk5tJcHJJMA3Jggc";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[cadastroComplemento] iniciando');

  // primeiro: verifica se veio por OAuth (supabase)
  const urlHash = window.location.hash || '';
  // Supabase automatically manages session on redirect; we can read user
  const { data: { session, user } } = await supabase.auth.getSession();

  // tipo previamente guardado no localStorage
  const tipo = localStorage.getItem('cuidafast_tipoRegistro') || new URLSearchParams(window.location.search).get('tipo') || 'cliente';

  // Se usuário autenticado via Supabase, envie para backend para criar/atualizar perfil
  if (user && user.email) {
    try {
      const payload = {
        email: user.email,
        nome: user.user_metadata?.full_name || user.email.split('@')[0],
        foto_url: user.user_metadata?.avatar_url || null,
        tipo: tipo
      };

      const API_URL = window.API_CONFIG?.AUTH || "/api/auth";

      const resp = await fetch(`${API_URL}/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await resp.json();

      if (!resp.ok) {
        console.warn('Aviso: não foi possível criar/atualizar usuário no backend', result);
        // Ainda assim, permite o usuário preencher dados complementares
      } else {
        // guarda user retornado no localStorage (se houver)
        if (result.user) {
          localStorage.setItem('cuidafast_user', JSON.stringify(result.user));
          localStorage.setItem('cuidafast_isLoggedIn', 'true');
        }
      }
    } catch (err) {
      console.error('Erro ao notificar backend:', err);
    }
  } else {
    console.log('[cadastroComplemento] Usuário não autenticado via Supabase — o usuário pode estar vindo de cadastro tradicional.');
  }

  // Inicializa o formulário normalmente (o restante do seu código já existente manipula o submit)
});
