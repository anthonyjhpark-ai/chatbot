import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface NewsItem {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

export async function POST(request: NextRequest) {
  try {
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('❌ Supabase 환경 변수 누락:');
      console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
      console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✅' : '❌');
      return NextResponse.json(
        { 
          error: 'Supabase 환경 변수가 설정되지 않았습니다.',
          details: 'NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인하세요.'
        },
        { status: 500 }
      );
    }

    const { keyword, news } = await request.json();

    if (!keyword || !news || !Array.isArray(news) || news.length === 0) {
      return NextResponse.json(
        { error: '키워드와 뉴스 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('📝 DB 저장 시작:', { keyword, newsCount: news.length });

    // 1. 검색 기록 저장
    const { data: searchRecord, error: searchError } = await supabaseAdmin
      .from('search_history')
      .insert({
        keyword: keyword.trim(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (searchError) {
      console.error('❌ 검색 기록 저장 오류:', searchError);
      console.error('에러 상세:', JSON.stringify(searchError, null, 2));
      return NextResponse.json(
        { 
          error: '검색 기록 저장에 실패했습니다.', 
          details: searchError.message,
          code: searchError.code,
          hint: searchError.hint
        },
        { status: 500 }
      );
    }

    console.log('✅ 검색 기록 저장 성공:', searchRecord.id);

    // 2. 뉴스 데이터 저장
    const newsData = news.map((item: NewsItem) => ({
      search_id: searchRecord.id,
      title: item.title,
      link: item.link,
      snippet: item.snippet || '',
      source: item.source || 'Unknown',
      created_at: new Date().toISOString()
    }));

    const { error: newsError } = await supabaseAdmin
      .from('news_items')
      .insert(newsData);

    if (newsError) {
      console.error('❌ 뉴스 데이터 저장 오류:', newsError);
      console.error('에러 상세:', JSON.stringify(newsError, null, 2));
      return NextResponse.json(
        { 
          error: '뉴스 데이터 저장에 실패했습니다.', 
          details: newsError.message,
          code: newsError.code,
          hint: newsError.hint
        },
        { status: 500 }
      );
    }

    console.log('✅ 뉴스 데이터 저장 성공:', newsData.length, '개');

    return NextResponse.json({
      success: true,
      searchId: searchRecord.id,
      newsCount: newsData.length
    });
  } catch (error: any) {
    console.error('DB 저장 오류:', error);
    return NextResponse.json(
      { error: '데이터 저장 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}
