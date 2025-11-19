import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL="https://omvwicetojhqurdeuequ.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tdndpY2V0b2pocXVyZGV1ZXF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxMjkxMSwiZXhwIjoyMDc4OTg4OTExfQ.eYhsNaqRrQy0xWLEg-rbHPKJFq5JqhfPoOVjQNXPX3U"
);
