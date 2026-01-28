import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Supabase 연결 테스트 API
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? '✅ 설정됨' : '❌ 없음',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? '✅ 설정됨' : '❌ 없음',
      SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey ? '✅ 설정됨' : '❌ 없음',
    };

    // 테이블 존재 확인
    let tableCheck = {
      search_history: false,
      news_items: false,
    };

    const hasKey = supabaseServiceRoleKey || supabaseAnonKey;
    if (supabaseUrl && hasKey) {
      try {
        // search_history 테이블 확인
        const { error: searchError } = await supabaseAdmin
          .from('search_history')
          .select('id')
          .limit(1);
        
        tableCheck.search_history = !searchError;

        // news_items 테이블 확인
        const { error: newsError } = await supabaseAdmin
          .from('news_items')
          .select('id')
          .limit(1);
        
        tableCheck.news_items = !newsError;
      } catch (e) {
        console.error('테이블 확인 오류:', e);
      }
    }

    return NextResponse.json({
      status: 'ok',
      environment: envStatus,
      tables: tableCheck,
      message: hasKey 
        ? '환경 변수 및 테이블 확인 완료.' 
        : '⚠️ NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요.',
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
    }, { status: 500 });
  }
}
