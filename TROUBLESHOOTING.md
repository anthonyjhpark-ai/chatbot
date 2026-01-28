# Supabase 데이터 저장 문제 해결 가이드

## 1. 배포 확인

Vercel 대시보드에서 최신 배포가 완료되었는지 확인하세요.

## 2. 환경 변수 확인

Vercel 대시보드 → Settings → Environment Variables에서 다음이 모두 설정되어 있는지 확인:

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` (선택사항, 없어도 작동)

## 3. Supabase 테이블 확인

### SQL 실행 확인
1. Supabase 대시보드 → SQL Editor
2. `supabase/schema.sql` 파일의 내용을 실행했는지 확인
3. Table Editor에서 `search_history`와 `news_items` 테이블이 있는지 확인

### 테이블이 없다면
```sql
-- supabase/schema.sql 파일의 전체 내용을 실행하세요
```

## 4. RLS (Row Level Security) 확인

### 방법 1: RLS 비활성화 (개발용, 간단)
```sql
ALTER TABLE search_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE news_items DISABLE ROW LEVEL SECURITY;
```

### 방법 2: 익명 접근 정책 활성화 (권장)
`supabase/schema.sql` 파일의 마지막 부분에 있는 정책이 실행되었는지 확인:
```sql
CREATE POLICY "Allow anonymous access to search_history" ON search_history
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to news_items" ON news_items
  FOR ALL USING (true);
```

## 5. 테스트 API로 확인

배포 후 다음 URL로 접속:
```
https://your-vercel-url.vercel.app/api/supabase/test
```

응답에서 확인:
- `environment`: 모든 환경 변수가 ✅인지 확인
- `tables`: 두 테이블이 모두 `true`인지 확인

## 6. Vercel 로그 확인

1. Vercel 대시보드 → Functions 탭
2. `/api/news/save` 함수의 로그 확인
3. 다음 메시지 확인:
   - `✅ 뉴스 데이터 저장 성공` → 정상
   - `❌ 검색 기록 저장 오류` → 에러 메시지 확인

## 7. 일반적인 문제

### 문제: "permission denied" 에러
**해결**: RLS를 비활성화하거나 익명 접근 정책을 추가

### 문제: "relation does not exist" 에러
**해결**: 테이블이 생성되지 않음. `supabase/schema.sql` 실행

### 문제: 환경 변수는 있는데 저장 안됨
**해결**: 
1. Vercel에서 재배포
2. 환경 변수가 Production, Preview, Development 모두에 설정되었는지 확인

## 8. 빠른 해결 (RLS 비활성화)

가장 빠른 해결책은 RLS를 비활성화하는 것입니다:

```sql
ALTER TABLE search_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE news_items DISABLE ROW LEVEL SECURITY;
```

이렇게 하면 anon key만으로도 데이터를 저장할 수 있습니다.
