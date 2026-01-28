import { NextRequest, NextResponse } from 'next/server';

interface NewsItem {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword');

  if (!keyword) {
    return NextResponse.json(
      { error: '키워드가 필요합니다.' },
      { status: 400 }
    );
  }

  try {
    // Google News RSS를 사용하여 뉴스 검색
    const searchQuery = encodeURIComponent(keyword);
    const rssUrl = `https://news.google.com/rss/search?q=${searchQuery}&hl=ko&gl=KR&ceid=KR:ko`;
    
    console.log('뉴스 검색 시작:', keyword);
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      console.error('RSS 요청 실패:', response.status, response.statusText);
      throw new Error(`뉴스 검색 요청 실패: ${response.status}`);
    }
    
    const xmlText = await response.text();
    console.log('RSS 응답 받음, 길이:', xmlText.length);
    
    // XML 파싱
    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
    const linkRegex = /<link>(.*?)<\/link>/;
    const descriptionRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/;
    
    let match;
    let count = 0;
    
    while ((match = itemRegex.exec(xmlText)) !== null && count < 10) {
      const itemContent = match[1];
      const titleMatch = itemContent.match(titleRegex);
      const linkMatch = itemContent.match(linkRegex);
      const descMatch = itemContent.match(descriptionRegex);
      
      if (titleMatch && linkMatch) {
        const title = (titleMatch[1] || titleMatch[2] || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
        const link = linkMatch[1].trim();
        const descText = descMatch ? (descMatch[1] || descMatch[2] || '') : '';
        const snippet = descText.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').substring(0, 200).trim();
        const source = link.match(/https?:\/\/(?:www\.)?([^\/]+)/)?.[1] || 'Unknown';
        
        if (title && link) {
          items.push({
            title,
            link,
            snippet,
            source,
          });
          count++;
        }
      }
    }
    
    console.log('파싱된 뉴스 개수:', items.length);
    
    if (items.length === 0) {
      return NextResponse.json(
        { error: '검색된 뉴스가 없습니다. 다른 키워드로 시도해주세요.', news: [] },
        { status: 200 }
      );
    }
    
    // 뉴스 검색 성공 후 DB에 저장 (비동기, 에러가 나도 검색 결과는 반환)
    const origin = request.headers.get('origin') || request.nextUrl.origin;
    fetch(`${origin}/api/news/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyword, news: items }),
    }).catch((err) => {
      console.error('뉴스 데이터 저장 실패 (비동기):', err);
      // 저장 실패해도 검색 결과는 반환
    });
    
    return NextResponse.json({ news: items });
  } catch (error: any) {
    console.error('뉴스 검색 오류 상세:', error);
    const errorMessage = error?.message || error?.toString() || '알 수 없는 오류';
    return NextResponse.json(
      { error: `뉴스 검색 중 오류가 발생했습니다: ${errorMessage}`, news: [] },
      { status: 500 }
    );
  }
}
