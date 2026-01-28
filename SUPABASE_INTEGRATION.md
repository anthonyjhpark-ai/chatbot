# ✅ Supabase 연동 완료!

NBA 선수 통계 수집 스크립트에 **Supabase 데이터베이스 저장 기능**이 추가되었습니다.

---

## 🎉 새로 추가된 기능

### 1. Supabase 자동 저장
- ✅ 선수 정보를 `nba_players` 테이블에 자동 저장
- ✅ 시즌 평균 스탯을 `player_season_stats` 테이블에 저장
- ✅ 기존 데이터 자동 업데이트 (Upsert)
- ✅ 진행 상황 실시간 표시

### 2. 새 데이터베이스 테이블
`player_season_stats` 테이블이 스키마에 추가되었습니다:
- 시즌별 선수 평균 통계 저장
- 모든 스탯 항목 포함 (득점, 리바운드, 어시스트, 더블더블 등)
- 시즌별로 구분하여 관리

---

## 📦 설치 명령어 (업데이트됨)

```bash
pip install nba_api pandas supabase python-dotenv
```

---

## ⚙️ 빠른 설정 (3단계)

### 1️⃣ 환경 변수 설정
`.env` 파일 생성:
```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2️⃣ 데이터베이스 테이블 생성
Supabase SQL Editor에서 `supabase/nba-schema.sql` 실행

### 3️⃣ 스크립트 실행
```bash
python fetch_nba_stats.py
```

---

## 🚀 사용 방법

스크립트 실행 후:
1. 시즌 선택 (기본: 2025-26)
2. 데이터 수집 대기 (5-10초)
3. 화면에서 통계 확인
4. **"Supabase에 저장하시겠습니까?"** → `y` 입력 ⭐
5. 업로드 진행 상황 확인
6. 완료!

---

## 📊 저장되는 데이터

### `nba_players` 테이블
- 선수 ID
- 이름
- 팀
- 포지션

### `player_season_stats` 테이블 (새로 추가)
- 시즌 (예: 2025-26)
- 경기 수
- 경기당 평균 득점
- 경기당 평균 야투/야투율
- 경기당 평균 3점슛/3점율
- 경기당 평균 자유투/자유투율
- 경기당 평균 리바운드 (공격/수비)
- 경기당 평균 어시스트
- 경기당 평균 턴오버
- 경기당 평균 스틸
- 경기당 평균 블록
- 시즌 더블더블 횟수
- 시즌 트리플더블 횟수

---

## 💡 활용 방법

### 1. Supabase 대시보드에서 조회
```sql
-- 득점 상위 20명
SELECT 
  p.name,
  p.team,
  s.points,
  s.rebounds,
  s.assists
FROM player_season_stats s
JOIN nba_players p ON s.player_id = p.id
WHERE s.season = '2025-26'
ORDER BY s.points DESC
LIMIT 20;
```

### 2. Next.js 대시보드에서 사용
- 이미 생성된 웹 대시보드에서 바로 데이터 조회 가능
- API Routes에서 Supabase 쿼리 실행
- 실시간 랭킹 표시

### 3. 정기적 업데이트
- 매일 또는 매주 스크립트 실행
- 기존 선수는 자동 업데이트
- 새 선수는 자동 추가

---

## 📁 수정/추가된 파일

### 수정됨
- ✅ `fetch_nba_stats.py` - Supabase 저장 기능 추가
- ✅ `supabase/nba-schema.sql` - `player_season_stats` 테이블 추가

### 새로 생성됨
- ✅ `.env` - Supabase 환경 변수
- ✅ `NBA_STATS_COMPLETE_GUIDE.md` - 완전한 사용 가이드

---

## 🎯 다음 단계

1. **환경 변수 설정**: `.env` 파일에 Supabase URL과 KEY 입력
2. **테이블 생성**: Supabase SQL Editor에서 스키마 실행
3. **패키지 설치**: `pip install supabase python-dotenv`
4. **스크립트 실행**: `python fetch_nba_stats.py`
5. **데이터 확인**: Supabase 대시보드에서 데이터 조회

---

## 📚 문서

- **`NBA_STATS_COMPLETE_GUIDE.md`**: 전체 사용 가이드 (Supabase 포함)
- **`NBA_STATS_GUIDE.md`**: 기본 사용 가이드
- **`QUICKSTART.md`**: 웹 대시보드 빠른 시작
- **`SETUP_GUIDE.md`**: 웹 대시보드 상세 설정

---

**모든 준비가 완료되었습니다! 🎉**

이제 NBA 선수 통계를 수집하고 Supabase에 저장한 후, 
웹 대시보드에서 멋진 랭킹을 확인할 수 있습니다! 🏀
