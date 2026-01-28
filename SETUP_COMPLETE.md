# ✅ 준비 완료 체크리스트

## 1. 로컬에서 실행 (이미 하신 경우 스킵)

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 2. 환경 변수 (Vercel에 이미 설정했다면 스킵)

Vercel → Settings → Environment Variables:

| 변수명 | 설명 |
|--------|------|
| `GEMINI_API_KEY` | Gemini API 키 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | (선택) Supabase service role key |

---

## 3. ⚠️ Supabase SQL 실행 (필수 – 여기서 한 번만 하면 됨)

**제가 Supabase 대시보드에 접속할 수 없어서, 이 단계만 직접 해주셔야 합니다.**

1. [Supabase](https://supabase.com) 로그인 → 프로젝트 선택
2. 왼쪽 메뉴 **SQL Editor** 클릭
3. **New query** 클릭
4. 아래 SQL **전부 복사**해서 붙여넣기 후 **Run** 실행

```sql
-- 테이블 생성
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

CREATE INDEX IF NOT EXISTS idx_search_history_keyword ON search_history(keyword);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_search_id ON news_items(search_id);
CREATE INDEX IF NOT EXISTS idx_news_items_created_at ON news_items(created_at DESC);

-- RLS 비활성화 (anon key만으로 저장 가능)
ALTER TABLE search_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE news_items DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can do everything on search_history" ON search_history;
DROP POLICY IF EXISTS "Service role can do everything on news_items" ON news_items;
DROP POLICY IF EXISTS "Allow anonymous access to search_history" ON search_history;
DROP POLICY IF EXISTS "Allow anonymous access to news_items" ON news_items;
```

5. **Run** 실행 후 에러 없으면 완료.

---

## 4. 확인

- [ ] `npm install` 후 `npm run dev` 로 로컬 실행
- [ ] Vercel 환경 변수 설정
- [ ] Supabase SQL Editor에서 위 SQL 실행
- [ ] 뉴스 검색 → Supabase Table Editor에서 `search_history`, `news_items`에 데이터 들어오는지 확인

---

## 5. 테스트 API

배포된 사이트가 있다면:

```
https://your-vercel-url.vercel.app/api/supabase/test
```

접속해서 환경 변수·테이블 상태 확인 가능.

---

## 6. Git 푸시 (변경사항 반영 후)

```bash
git add .
git commit -m "Setup complete: .env.example, SETUP_COMPLETE.md 추가"
git push origin main
```

---

## 7. 제가 할 수 없는 것 (직접 해주셔야 함)

- **Supabase SQL 실행**: Supabase 대시보드 → SQL Editor에서만 실행 가능 (제가 접속 불가)
- **Vercel 환경 변수**: 대시보드에서 직접 설정
- **npm install / npm run dev**: 로컬 터미널에서 실행
