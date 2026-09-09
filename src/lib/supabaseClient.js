import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Validates if Supabase URL and Key are provided and non-placeholder
 */
export function isSupabaseConfigured() {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes('your-project-id') || supabaseAnonKey.includes('your-anon-key')) return false;
  try {
    new URL(supabaseUrl);
    return true;
  } catch {
    return false;
  }
}

// Mock fallback client for preview & offline development
function createMockClient() {
  console.info('[GymForge] Running in Mock/Offline Supabase Mode (Env vars not set).');

  const listeners = [];

  return {
    isMock: true,
    auth: {
      async getSession() {
        const mockUserStr = localStorage.getItem('gymforge_mock_user');
        if (mockUserStr) {
          try {
            const user = JSON.parse(mockUserStr);
            return { data: { session: { user, access_token: 'mock-token' } }, error: null };
          } catch {
            return { data: { session: null }, error: null };
          }
        }
        return { data: { session: null }, error: null };
      },
      async getUser() {
        const mockUserStr = localStorage.getItem('gymforge_mock_user');
        if (mockUserStr) {
          try {
            const user = JSON.parse(mockUserStr);
            return { data: { user }, error: null };
          } catch {
            return { data: { user: null }, error: null };
          }
        }
        return { data: { user: null }, error: null };
      },
      async signInWithPassword({ email, _password }) {
        const user = {
          id: 'mock-user-123',
          email: email || 'demo@gymforge.dev',
          user_metadata: { username: email ? email.split('@')[0] : 'Gym Warrior' },
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('gymforge_mock_user', JSON.stringify(user));
        listeners.forEach(cb => cb('SIGNED_IN', { user, access_token: 'mock-token' }));
        return { data: { user, session: { user } }, error: null };
      },
      async signUp({ email, _password, options }) {
        const user = {
          id: 'mock-user-123',
          email: email || 'demo@gymforge.dev',
          user_metadata: { username: options?.data?.username || (email ? email.split('@')[0] : 'Gym Warrior') },
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('gymforge_mock_user', JSON.stringify(user));
        listeners.forEach(cb => cb('SIGNED_IN', { user, access_token: 'mock-token' }));
        return { data: { user, session: { user } }, error: null };
      },
      async signInWithOAuth({ provider }) {
        const user = {
          id: 'mock-google-user',
          email: 'google.warrior@gymforge.dev',
          user_metadata: { username: 'Google Champion', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('gymforge_mock_user', JSON.stringify(user));
        listeners.forEach(cb => cb('SIGNED_IN', { user, access_token: 'mock-token' }));
        return { data: { provider, url: null }, error: null };
      },
      async signOut() {
        localStorage.removeItem('gymforge_mock_user');
        listeners.forEach(cb => cb('SIGNED_OUT', null));
        return { error: null };
      },
      onAuthStateChange(callback) {
        listeners.push(callback);
        this.getSession().then(({ data }) => {
          if (data?.session) callback('INITIAL_SESSION', data.session);
        });
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                const idx = listeners.indexOf(callback);
                if (idx > -1) listeners.splice(idx, 1);
              },
            },
          },
        };
      },
    },
    from(_table) {
      return {
        select() {
          return {
            eq() {
              return {
                async single() { return { data: null, error: null }; },
                async maybeSingle() { return { data: null, error: null }; },
                data: [],
                error: null,
              };
            },
            async order() { return { data: [], error: null }; },
            data: [],
            error: null,
          };
        },
        upsert(data) {
          return {
            async select() { return { data, error: null }; },
            data,
            error: null,
          };
        },
        insert(data) {
          return {
            async select() { return { data, error: null }; },
            data,
            error: null,
          };
        },
        update(data) {
          return {
            eq() { return { data, error: null }; },
          };
        },
        delete() {
          return {
            eq() { return { error: null }; },
          };
        },
      };
    },
  };
}

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createMockClient();
