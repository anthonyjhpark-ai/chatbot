# NBA 선수 스탯 대시보드 - 설정 가이드

## 📋 설정 단계

### 1. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에 로그인
2. 새 프로젝트 생성
3. 프로젝트 대시보드에서 Settings > API로 이동
4. `Project URL`과 `anon public` 키를 복사

### 2. 데이터베이스 스키마 생성

1. Supabase 대시보드에서 SQL Editor로 이동
2. `supabase/nba-schema.sql` 파일 내용을 복사
3. SQL Editor에 붙여넣고 실행 (Run)
4. 성공 메시지 확인

생성되는 테이블:
- `nba_players`: 선수 정보
- `player_daily_stats`: 일일 스탯
- `scoring_weights`: 가중치 설정 (4개 기본값 자동 생성)
- `player_scores`: 계산된 점수

### 3. 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성:

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어 실제 값으로 수정:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. NBA API 선택 및 설정

다음 중 하나를 선택하세요:

#### 옵션 A: SportsData.io (추천 - 프로페셔널)
- 웹사이트: https://sportsdata.io/
- 무료 티어: 월 1,000 요청
- 신뢰성: 높음
- 설정:
  ```env
  NBA_API_KEY=your-sportsdata-key
  NBA_API_BASE_URL=https://api.sportsdata.io/v3/nba
  ```

#### 옵션 B: Ball Don't Lie API (무료)
- 웹사이트: https://www.balldontlie.io/
- 무료: 무제한 (rate limit 있음)
- 신뢰성: 보통
- 설정:
  ```env
  NBA_API_BASE_URL=https://www.balldontlie.io/api/v1
  ```
- API 키 불필요

#### 옵션 C: RapidAPI NBA API
- 웹사이트: https://rapidapi.com/
- 무료 티어: 제한적
- 설정:
  ```env
  NBA_API_KEY=your-rapidapi-key
  NBA_API_BASE_URL=https://api-nba-v1.p.rapidapi.com
  ```

### 5. API 코드 수정

선택한 API에 맞게 `lib/nba-api.ts` 파일을 수정하세요.

#### Ball Don't Lie API 예시:

```typescript
export async function fetchTodayStats(): Promise<any[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const response = await fetch(
    `https://www.balldontlie.io/api/v1/stats?dates[]=${today}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
    }
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data || [];
}

export function transformAPIStatToInternal(apiStat: any) {
  return {
    game_date: apiStat.game.date?.split('T')[0],
    opponent: apiStat.team.abbreviation,
    minutes_played: parseFloat(apiStat.min) || 0,
    points: apiStat.pts || 0,
    rebounds: (apiStat.reb || 0),
    assists: apiStat.ast || 0,
    steals: apiStat.stl || 0,
    blocks: apiStat.blk || 0,
    turnovers: apiStat.turnover || 0,
    fouls: apiStat.pf || 0,
    field_goals_made: apiStat.fgm || 0,
    field_goals_attempted: apiStat.fga || 0,
    field_goal_percentage: apiStat.fg_pct ? apiStat.fg_pct * 100 : 0,
    three_pointers_made: apiStat.fg3m || 0,
    three_pointers_attempted: apiStat.fg3a || 0,
    three_point_percentage: apiStat.fg3_pct ? apiStat.fg3_pct * 100 : 0,
    free_throws_made: apiStat.ftm || 0,
    free_throws_attempted: apiStat.fta || 0,
    free_throw_percentage: apiStat.ft_pct ? apiStat.ft_pct * 100 : 0,
  };
}
```

### 6. 패키지 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 7. 첫 데이터 수집

1. 대시보드 상단의 "스탯 수집" 버튼 클릭
2. API에서 데이터를 가져와 데이터베이스에 저장
3. 자동으로 점수 계산
4. 랭킹 테이블에 표시

## 🔧 문제 해결

### Supabase 연결 실패
- `.env.local` 파일이 올바른 위치에 있는지 확인
- 환경 변수명이 정확한지 확인 (NEXT_PUBLIC_ 접두사 필수)
- 개발 서버 재시작 (`Ctrl+C` 후 `npm run dev`)

### API 호출 실패
- API 키가 올바른지 확인
- API 요청 한도를 초과하지 않았는지 확인
- 네트워크 연결 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 데이터가 표시되지 않음
- Supabase SQL Editor에서 직접 쿼리 실행해 데이터 확인:
  ```sql
  SELECT * FROM nba_players LIMIT 10;
  SELECT * FROM player_daily_stats LIMIT 10;
  ```
- RLS 정책이 올바르게 설정되었는지 확인

## 🎯 다음 단계

### 기능 추가 아이디어
1. 선수 상세 페이지
2. 스탯 비교 기능
3. 시즌 평균 계산
4. 차트 및 그래프 (Chart.js, Recharts)
5. 선수 검색 및 필터
6. 팀별 랭킹
7. 알림 시스템
8. 모바일 앱 (React Native)

### 배포

#### Vercel 배포 (권장)
1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com) 로그인
3. "Import Project" 클릭
4. GitHub 저장소 선택
5. Environment Variables 설정
6. Deploy 클릭

자동 배포 완료!

## 📊 샘플 데이터

실제 API 연동 전 테스트용으로 샘플 데이터를 수동으로 입력할 수 있습니다:

```sql
-- 샘플 선수 추가
INSERT INTO nba_players (player_id, name, team, position, jersey_number)
VALUES 
  ('lebron23', 'LeBron James', 'LAL', 'F', 23),
  ('curry30', 'Stephen Curry', 'GSW', 'G', 30),
  ('durant7', 'Kevin Durant', 'PHX', 'F', 7);

-- 샘플 스탯 추가
INSERT INTO player_daily_stats (
  player_id, game_date, opponent,
  points, rebounds, assists, steals, blocks
)
SELECT 
  id, CURRENT_DATE, 'OPP',
  25, 8, 6, 2, 1
FROM nba_players
WHERE player_id = 'lebron23';
```

---

문제가 발생하면 이슈를 등록해주세요!
