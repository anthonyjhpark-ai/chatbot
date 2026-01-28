import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const keyword = searchParams.get('keyword');

    let query = supabaseAdmin
      .from('search_history')
      .select('*, news_items(*)')
      .order('created_at', { ascending: false })
      .limit(limit);

    // 키워드로 필터링
    if (keyword) {
      query = query.ilike('keyword', `%${keyword}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('검색 기록 조회 오류:', error);
      return NextResponse.json(
        { error: '검색 기록 조회에 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ history: data || [] });
  } catch (error: any) {
    console.error('검색 기록 조회 오류:', error);
    return NextResponse.json(
      { error: '검색 기록 조회 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}
