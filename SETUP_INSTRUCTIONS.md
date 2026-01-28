# NBA 스탯 대시보드 - 데이터 수집 가이드

## 🚨 현재 상황
웹사이트는 배포되었지만, Supabase 데이터베이스에 선수 데이터가 없어서 빈 화면이 표시됩니다.

## 📝 해결 방법

### 방법 1: Supabase에서 직접 샘플 데이터 추가 (빠른 테스트)

1. **Supabase 대시보드 접속**
   ```
   https://supabase.com/dashboard/project/obgzapfpdiiovyikvmlx
   ```

2. **SQL Editor로 이동**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭

3. **아래 SQL 실행** (샘플 NBA 선수 데이터)

```sql
-- 샘플 선수 추가
INSERT INTO nba_players (id, name, team, position, api_id) VALUES
  (gen_random_uuid(), 'LeBron James', 'LAL', 'F', 'nba_lebron_james'),
  (gen_random_uuid(), 'Stephen Curry', 'GSW', 'G', 'nba_stephen_curry'),
  (gen_random_uuid(), 'Kevin Durant', 'PHX', 'F', 'nba_kevin_durant'),
  (gen_random_uuid(), 'Giannis Antetokounmpo', 'MIL', 'F', 'nba_giannis_antetokounmpo'),
  (gen_random_uuid(), 'Luka Doncic', 'DAL', 'G', 'nba_luka_doncic')
ON CONFLICT (api_id) DO NOTHING;

-- 시즌 평균 스탯 추가 (2025-26 시즌)
INSERT INTO player_season_stats (
  player_id, season, games_played, minutes_played, 
  points, field_goals_made, field_goal_percentage,
  three_pointers_made, free_throw_percentage,
  offensive_rebounds, rebounds, assists, turnovers,
  steals, blocks, double_doubles, triple_doubles
)
SELECT 
  p.id,
  '2025-26',
  65,
  35.5,
  CASE p.name
    WHEN 'LeBron James' THEN 25.7
    WHEN 'Stephen Curry' THEN 29.8
    WHEN 'Kevin Durant' THEN 27.1
    WHEN 'Giannis Antetokounmpo' THEN 30.4
    WHEN 'Luka Doncic' THEN 28.9
  END,
  CASE p.name
    WHEN 'LeBron James' THEN 9.5
    WHEN 'Stephen Curry' THEN 10.2
    WHEN 'Kevin Durant' THEN 9.8
    WHEN 'Giannis Antetokounmpo' THEN 11.3
    WHEN 'Luka Doncic' THEN 10.1
  END,
  CASE p.name
    WHEN 'LeBron James' THEN 50.3
    WHEN 'Stephen Curry' THEN 45.7
    WHEN 'Kevin Durant' THEN 52.3
    WHEN 'Giannis Antetokounmpo' THEN 54.7
    WHEN 'Luka Doncic' THEN 48.8
  END,
  CASE p.name
    WHEN 'LeBron James' THEN 2.1
    WHEN 'Stephen Curry' THEN 5.2
    WHEN 'Kevin Durant' THEN 1.8
    WHEN 'Giannis Antetokounmpo' THEN 0.8
    WHEN 'Luka Doncic' THEN 3.1
  END,
  CASE p.name
    WHEN 'LeBron James' THEN 75.2
    WHEN 'Stephen Curry' THEN 92.3
    WHEN 'Kevin Durant' THEN 88.9
    WHEN 'Giannis Antetokounmpo' THEN 65.7
    WHEN 'Luka Doncic' THEN 78.6
  END,
  1.2, 7.3, 7.3, 3.5, 1.3, 0.6, 15, 2
FROM nba_players p
WHERE p.api_id IN (
  'nba_lebron_james', 
  'nba_stephen_curry', 
  'nba_kevin_durant', 
  'nba_giannis_antetokounmpo', 
  'nba_luka_doncic'
)
ON CONFLICT (player_id, season) DO UPDATE SET
  points = EXCLUDED.points,
  updated_at = NOW();
```

4. **웹사이트 새로고침**
   ```
   https://chatbot-phi-amber-51.vercel.app
   ```
   - 이제 5명의 선수 데이터가 표시됩니다!

---

### 방법 2: Python 설치 후 실제 NBA 데이터 수집 (권장)

#### 1단계: Python 설치

**Windows:**
1. [Python 공식 웹사이트](https://www.python.org/downloads/) 접속
2. "Download Python 3.12.x" 클릭
3. 설치 시 **"Add Python to PATH" 체크박스 반드시 선택**
4. "Install Now" 클릭

#### 2단계: 필요한 패키지 설치

터미널(PowerShell)에서 실행:
```bash
pip install nba_api pandas supabase python-dotenv
```

#### 3단계: 환경 변수 설정

프로젝트 폴더에 `.env` 파일 생성 (이미 있음):
```
SUPABASE_URL=https://obgzapfpdiiovyikvmlx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZ3phcGZwZGlpb3Z5aWt2bWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MjA3MzAsImV4cCI6MjA4NTA5NjczMH0.3IOlPLXhclK_6vo8_TXhlwDSk4x_4hqAihqqaBEZdys
```

#### 4단계: NBA 데이터 수집

터미널에서 실행:
```bash
python fetch_nba_stats.py
```

스크립트 실행 중 질문에 답변:
- **시즌 선택**: `2025-26` (엔터)
- **표시할 선수 수**: `50` (또는 원하는 숫자)
- **Supabase에 저장**: `y` (엔터)

#### 5단계: 웹사이트 확인

```
https://chatbot-phi-amber-51.vercel.app
```
- 새로고침하면 실제 NBA 선수 데이터가 표시됩니다!

---

## 🎯 다음 단계

### 자동 데이터 수집 설정 (Cron Jobs)

Vercel Cron Jobs가 이미 설정되어 있지만, 외부 NBA API 키가 필요합니다:

1. **NBA Stats API 키 발급** (무료)
   - [RapidAPI NBA Stats](https://rapidapi.com/api-sports/api/api-nba) 또는
   - [SportsData.io](https://sportsdata.io/nba-api)

2. **Vercel 환경 변수에 추가**
   ```bash
   vercel env add NBA_API_KEY production
   ```

3. **매일 자동 수집**
   - 매일 12:00 PM (한국시간): 스탯 수집
   - 매일 12:30 PM (한국시간): 점수 계산

---

## 📞 문제 해결

### Python이 설치되지 않았다고 나올 때
```bash
# Python 경로 확인
where python

# 없다면 Microsoft Store에서 설치하거나
# Python 공식 사이트에서 다운로드
```

### pip 명령어가 작동하지 않을 때
```bash
python -m pip install nba_api pandas supabase python-dotenv
```

### Supabase 연결 오류
- `.env` 파일에 `SUPABASE_URL`과 `SUPABASE_KEY`가 올바른지 확인
- 인터넷 연결 확인

---

## 🎉 완료!

이제 NBA 선수 스탯 대시보드가 완전히 작동합니다!

**배포된 사이트**: https://chatbot-phi-amber-51.vercel.app
**GitHub 저장소**: https://github.com/anthonyjhpark-ai/chatbot
**Supabase 대시보드**: https://supabase.com/dashboard/project/obgzapfpdiiovyikvmlx
