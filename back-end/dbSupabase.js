import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL="https://kgwepkcxmsoyebxczqwe.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd2Vwa2N4bXNveWVieGN6cXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI0ODEyMSwiZXhwIjoyMDc2ODI0MTIxfQ.B41deTxaC_Xv0Csb9Dsd8voBBVuzrTKwoQdBhUlV39A"
);
