# Supabase 데이터베이스 설정

## 빠른 시작

1. Supabase 프로젝트 생성
   - [Supabase](https://supabase.com)에 가입/로그인
   - 새 프로젝트 생성

2. SQL 파일 실행
   - Supabase 대시보드 → SQL Editor
   - `schema.sql` 파일의 내용을 복사하여 실행

3. 환경 변수 설정
   - `.env.local` 파일에 Supabase 정보 추가
   - Vercel 배포 시 환경 변수도 설정

## 파일 설명

- `schema.sql`: 데이터베이스 테이블 및 인덱스 생성
- `seed.sql`: 테스트용 샘플 데이터 (선택사항)

## 테이블 구조

### search_history
- `id`: UUID (Primary Key)
- `keyword`: TEXT (검색 키워드)
- `created_at`: TIMESTAMP (생성 시간)

### news_items
- `id`: UUID (Primary Key)
- `search_id`: UUID (Foreign Key → search_history.id)
- `title`: TEXT (뉴스 제목)
- `link`: TEXT (뉴스 링크)
- `snippet`: TEXT (뉴스 요약)
- `source`: TEXT (뉴스 출처)
- `created_at`: TIMESTAMP (생성 시간)

## 주의사항

- RLS(Row Level Security)가 활성화되어 있습니다
- 서비스 롤 키를 사용하여 서버 사이드에서 데이터를 저장합니다
- 프로덕션 환경에서는 보안 정책을 더 엄격하게 설정하세요
