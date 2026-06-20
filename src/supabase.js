import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
          'As variaveis de ambiente do Supabase nao foram configuradas. Certifique-se de configurar o arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
        );
}

const mockSupabase = {
    auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: async () => ({ data: null, error: new Error('Supabase nao configurado (API)') }),
          signUp: async () => ({ data: null, error: new Error('Supabase nao configurado (API)') }),
          signOut: async () => ({ error: null })
    },
    from: () => {
          const query = {
                  select: () => query,
                  order: () => query,
                  insert: () => query,
                  update: () => query,
                  delete: () => query,
                  eq: () => query,
                  then: (resolve) => resolve({ data: [], error: new Error('Supabase nao configurado') })
          };
          return query;
    }
};

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
    : mockSupabase;
