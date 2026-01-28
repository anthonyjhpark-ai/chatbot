-- 빠른 해결: RLS 완전 비활성화
-- 이 파일을 Supabase SQL Editor에서 실행하면 anon key만으로도 데이터 저장이 가능합니다.

-- 테이블이 없다면 먼저 생성
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  search_id UUID NOT NULL REFERENCES search_history(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  snippet TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_search_history_keyword ON search_history(keyword);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_search_id ON news_items(search_id);
CREATE INDEX IF NOT EXISTS idx_news_items_created_at ON news_items(created_at DESC);

-- RLS 완전 비활성화 (가장 간단한 해결책)
ALTER TABLE search_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE news_items DISABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Service role can do everything on search_history" ON search_history;
DROP POLICY IF EXISTS "Service role can do everything on news_items" ON news_items;
DROP POLICY IF EXISTS "Allow anonymous access to search_history" ON search_history;
DROP POLICY IF EXISTS "Allow anonymous access to news_items" ON news_items;
