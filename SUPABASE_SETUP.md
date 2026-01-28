# Supabase 데이터베이스 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입 및 로그인
2. 새 프로젝트 생성
3. 프로젝트 설정에서 다음 정보 확인:
   - Project URL (예: `https://xxxxx.supabase.co`)
   - API Key (anon/public key)

## 2. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**주의**: `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용되며, 클라이언트에 노출되면 안 됩니다.

## 3. 데이터베이스 테이블 생성

Supabase 대시보드의 SQL Editor에서 다음 SQL을 실행하세요:

### 검색 기록 테이블
```sql
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_search_history_keyword ON search_history(keyword);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);
```

### 뉴스 아이템 테이블
```sql
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
CREATE INDEX IF NOT EXISTS idx_news_items_search_id ON news_items(search_id);
CREATE INDEX IF NOT EXISTS idx_news_items_created_at ON news_items(created_at DESC);
```

### Row Level Security (RLS) 설정

보안을 위해 RLS를 활성화하고 서비스 롤 키로만 접근 가능하도록 설정:

```sql
-- RLS 활성화
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- 서비스 롤 키로 모든 작업 허용 (서버 사이드에서만 사용)
CREATE POLICY "Service role can do everything" ON search_history
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON news_items
  FOR ALL USING (auth.role() = 'service_role');
```

또는 개발 환경에서는 RLS를 비활성화할 수도 있습니다:

```sql
-- 개발 환경용 (프로덕션에서는 권장하지 않음)
ALTER TABLE search_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE news_items DISABLE ROW LEVEL SECURITY;
```

## 4. 패키지 설치

터미널에서 다음 명령어를 실행하세요:

```bash
npm install @supabase/supabase-js
```

## 5. 확인 사항

- [ ] Supabase 프로젝트 생성 완료
- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 테이블 생성 완료
- [ ] 패키지 설치 완료
- [ ] 서버 재시작

## 6. 테스트

뉴스를 검색하면 자동으로 데이터베이스에 저장됩니다. Supabase 대시보드의 Table Editor에서 데이터를 확인할 수 있습니다.
