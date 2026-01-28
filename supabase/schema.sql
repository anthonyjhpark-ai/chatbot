-- Supabase 데이터베이스 스키마
-- 이 파일을 Supabase 대시보드의 SQL Editor에서 실행하세요.

-- ============================================
-- 1. 검색 기록 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 검색 기록 테이블 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_search_history_keyword ON search_history(keyword);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

-- ============================================
-- 2. 뉴스 아이템 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS news_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  search_id UUID NOT NULL REFERENCES search_history(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  snippet TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 뉴스 아이템 테이블 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_news_items_search_id ON news_items(search_id);
CREATE INDEX IF NOT EXISTS idx_news_items_created_at ON news_items(created_at DESC);

-- ============================================
-- 3. Row Level Security (RLS) 설정
-- ============================================

-- RLS 활성화
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- 서비스 롤 키로 모든 작업 허용 (서버 사이드에서만 사용)
-- 주의: 프로덕션 환경에서는 더 엄격한 정책을 설정하는 것을 권장합니다.
CREATE POLICY "Service role can do everything on search_history" ON search_history
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on news_items" ON news_items
  FOR ALL USING (auth.role() = 'service_role');

-- 개발 환경용: 익명 사용자도 읽기 가능 (선택사항)
-- 프로덕션에서는 이 정책을 제거하거나 더 엄격하게 설정하세요.
CREATE POLICY "Allow anonymous read access to search_history" ON search_history
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to news_items" ON news_items
  FOR SELECT USING (true);

-- ============================================
-- 4. 테이블 확인 쿼리 (선택사항)
-- ============================================

-- 검색 기록 조회
-- SELECT * FROM search_history ORDER BY created_at DESC LIMIT 10;

-- 뉴스 아이템 조회 (검색 기록과 함께)
-- SELECT 
--   sh.keyword,
--   sh.created_at as search_date,
--   ni.title,
--   ni.link,
--   ni.source
-- FROM search_history sh
-- LEFT JOIN news_items ni ON sh.id = ni.search_id
-- ORDER BY sh.created_at DESC, ni.created_at DESC;
