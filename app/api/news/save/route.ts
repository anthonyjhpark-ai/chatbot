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
    const { keyword, news } = await request.json();

    if (!keyword || !news || !Array.isArray(news) || news.length === 0) {
      return NextResponse.json(
        { error: '키워드와 뉴스 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

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
      console.error('검색 기록 저장 오류:', searchError);
      return NextResponse.json(
        { error: '검색 기록 저장에 실패했습니다.', details: searchError.message },
        { status: 500 }
      );
    }

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
      console.error('뉴스 데이터 저장 오류:', newsError);
      return NextResponse.json(
        { error: '뉴스 데이터 저장에 실패했습니다.', details: newsError.message },
        { status: 500 }
      );
    }

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
