# NBA 선수 통계 수집 스크립트 - 완전 가이드 (Supabase 연동 포함)

## 📦 패키지 설치

터미널에서 다음 명령어를 실행하세요:

```bash
pip install nba_api pandas supabase python-dotenv
```

개별 설치:
```bash
pip install nba_api        # NBA API
pip install pandas          # 데이터 처리
pip install supabase        # Supabase 연동
pip install python-dotenv   # 환경 변수 관리
```

---

## ⚙️ Supabase 설정

### 1. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 로그인
2. 새 프로젝트 생성
3. Settings > API로 이동
4. `Project URL`과 `anon public` 키를 복사

### 2. 환경 변수 설정
`.env` 파일을 프로젝트 루트에 생성하고 다음 내용을 추가:

```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. 데이터베이스 테이블 생성
1. Supabase 대시보드에서 SQL Editor로 이동
2. `supabase/nba-schema.sql` 파일 내용을 복사
3. SQL Editor에 붙여넣고 실행 (Run)

생성되는 주요 테이블:
- **`nba_players`**: 선수 기본 정보
- **`player_season_stats`**: 시즌 평균 스탯 ⭐ (이번에 추가됨)
- `player_daily_stats`: 일일 경기 스탯
- `scoring_weights`: 가중치 설정
- `player_scores`: 계산된 종합 점수

---

## 🚀 스크립트 실행

```bash
python fetch_nba_stats.py
```

### 실행 흐름

1. **시즌 선택**: 현재 시즌(2025-26) 또는 다른 시즌 입력
2. **데이터 수집**: NBA API에서 시즌 평균 스탯 가져오기 (5-10초 소요)
3. **화면 출력**: 상위 N명의 선수 통계 테이블 표시
4. **Supabase 저장**: 데이터베이스에 저장 여부 선택 ⭐
5. **CSV 저장**: CSV 파일로 저장 여부 선택

---

## 💡 사용 예시

```
================================================================================
🏀 NBA 선수 통계 수집 프로그램
================================================================================

📅 시즌: 2025-26
다른 시즌을 조회하시겠습니까? (엔터: 2025-26 사용): 

⏳ 데이터를 가져오는 중... (약 5-10초 소요)
🏀 NBA 2025-26 시즌 선수 통계를 가져오는 중...
================================================================================
✅ 총 450명의 선수 데이터를 가져왔습니다.

상위 몇 명을 출력하시겠습니까? (기본: 50): 20

📊 상위 20명 선수 통계
====================================================================================
    선수명                  팀   득점  야투  야투율  3점  리바운드  어시스트  ...
0   Joel Embiid            PHI  35.3  11.5  54.8   1.5   11.3      5.7    ...
1   Luka Doncic            DAL  33.5  10.8  47.2   4.2    8.5      9.5    ...
...

Supabase에 저장하시겠습니까? (y/n): y

📤 Supabase에 데이터를 업로드하는 중...
================================================================================
   진행 중... 50/450 선수 처리 완료
   진행 중... 100/450 선수 처리 완료
   ...
================================================================================
✅ Supabase 업로드 완료!
   - 새로 추가된 선수: 123명
   - 업데이트된 선수: 327명

CSV 파일로 저장하시겠습니까? (y/n): n

✅ 프로그램을 종료합니다.
```

---

## 📊 수집되는 데이터

| 항목 | 설명 | 컬럼명 |
|------|------|--------|
| 선수명 | 선수 이름 | name |
| 팀 | 소속 팀 | team |
| 경기수 | 출전 경기 수 | games_played |
| 득점 | 경기당 평균 득점 | points |
| 야투 | 경기당 평균 야투 성공 | field_goals_made |
| 야투율 | 야투 성공률 (%) | field_goal_percentage |
| 3점 | 경기당 평균 3점슛 성공 | three_pointers_made |
| 3점율 | 3점슛 성공률 (%) | three_point_percentage |
| 자유투 | 경기당 평균 자유투 성공 | free_throws_made |
| 자유투율 | 자유투 성공률 (%) | free_throw_percentage |
| 공격REB | 경기당 평균 공격 리바운드 | offensive_rebounds |
| 리바운드 | 경기당 평균 리바운드 | rebounds |
| 어시스트 | 경기당 평균 어시스트 | assists |
| 턴오버 | 경기당 평균 턴오버 | turnovers |
| 스틸 | 경기당 평균 스틸 | steals |
| 블록 | 경기당 평균 블록 | blocks |
| DD | 시즌 더블더블 횟수 | double_doubles |
| TD | 시즌 트리플더블 횟수 | triple_doubles |

---

## 💾 데이터 저장

### 1. Supabase 저장 (추천) ⭐

**저장되는 테이블:**
- `nba_players`: 선수 기본 정보 (이름, 팀, 포지션 등)
- `player_season_stats`: 시즌 평균 스탯 (모든 통계 수치)

**장점:**
- 웹 대시보드에서 바로 사용 가능
- 자동 업데이트 (기존 선수는 업데이트, 새 선수는 추가)
- SQL 쿼리로 다양한 분석 가능

**Supabase에서 데이터 확인:**
```sql
-- 득점 상위 20명 조회
SELECT 
  p.name,
  p.team,
  s.points,
  s.rebounds,
  s.assists,
  s.games_played
FROM player_season_stats s
JOIN nba_players p ON s.player_id = p.id
WHERE s.season = '2025-26'
ORDER BY s.points DESC
LIMIT 20;

-- 트리플더블 순위
SELECT 
  p.name,
  s.triple_doubles,
  s.points,
  s.rebounds,
  s.assists
FROM player_season_stats s
JOIN nba_players p ON s.player_id = p.id
WHERE s.season = '2025-26' AND s.triple_doubles > 0
ORDER BY s.triple_doubles DESC;
```

### 2. CSV 파일 저장

- 파일명: `nba_stats_2025_26.csv`
- 위치: 스크립트와 같은 폴더
- 인코딩: UTF-8 (엑셀에서도 한글 정상 표시)

---

## ⚠️ 문제 해결

### 1. 패키지 설치 오류
```bash
pip install --upgrade pip
pip install nba_api pandas supabase python-dotenv
```

### 2. NBA API 연결 실패
- 인터넷 연결 확인
- 잠시 후 다시 시도 (NBA API 서버가 일시적으로 응답하지 않을 수 있음)

### 3. Supabase 연결 실패
**오류 메시지**: "Supabase 설정이 필요합니다"

**해결 방법:**
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. 파일 내용 확인:
   ```env
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. URL과 KEY가 올바른지 Supabase 대시보드에서 확인

### 4. 테이블 없음 오류
**오류 메시지**: "relation player_season_stats does not exist"

**해결 방법:**
1. Supabase SQL Editor 열기
2. `supabase/nba-schema.sql` 파일 내용을 복사하여 실행
3. 특히 `player_season_stats` 테이블이 생성되었는지 확인

### 5. 한글 깨짐
PowerShell에서 실행 전:
```bash
chcp 65001
python fetch_nba_stats.py
```

---

## 🎯 다음 단계

### Supabase 데이터를 웹 대시보드에서 사용

이미 생성된 Next.js 대시보드에서 Supabase 데이터를 바로 사용할 수 있습니다:

1. **대시보드 실행**:
   ```bash
   npm run dev
   ```

2. **API 연동**: 
   - `app/api/rankings/route.ts`에서 `player_season_stats` 조회
   - 시즌 평균 데이터로 랭킹 표시

3. **데이터 업데이트**:
   - 매일 또는 매주 `fetch_nba_stats.py` 실행
   - Supabase에 최신 데이터 자동 업데이트

---

## 📝 참고사항

- **데이터 출처**: NBA 공식 통계 API
- **업데이트**: 시즌 중 매일 업데이트됨
- **최소 경기 수**: 5경기 이상 출전한 선수만 표시
- **정렬 기준**: 경기당 평균 득점 순

---

**Happy Coding! 🏀**
