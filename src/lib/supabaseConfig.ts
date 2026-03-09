// Supabase configuration — these are safe to expose client-side
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const OPENAI_PROXY_URL = `${SUPABASE_URL}/functions/v1/openai-proxy`;
