import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다.');
  console.warn('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '설정됨' : '❌ 없음');
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '❌ 없음');
}

if (!supabaseServiceRoleKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. 서버 사이드 작업이 실패할 수 있습니다.');
}

// 클라이언트 사이드용 Supabase 클라이언트
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// API Routes에서 사용할 함수
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

// 서버 사이드에서 사용할 클라이언트 (서비스 롤 키 사용)
// service_role_key가 없으면 anon_key로 폴백 (RLS 비활성화 필요)
const adminKey = supabaseServiceRoleKey || supabaseAnonKey;

if (!supabaseServiceRoleKey && supabaseAnonKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY가 없어 anon key를 사용합니다. RLS를 비활성화하거나 service_role_key를 설정하세요.');
}

export const supabaseAdmin = createSupabaseClient(
  supabaseUrl,
  adminKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
