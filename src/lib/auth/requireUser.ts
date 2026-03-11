import { createClient } from '@/lib/supabase/server';

export async function requireUser() {
  const supabase = await createClient();

  // Use getUser() to authenticate against Supabase Auth server
  // getSession() data comes from cookies and may not be authentic
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      user: null,
      session: null,
    };
  }

  // Get session for access_token (needed for RLS)
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return {
      user: null,
      session: null,
    };
  }

  return {
    user,
    session,
  };
}