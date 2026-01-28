# NBA 선수 통계 수집 스크립트 설치 및 실행 가이드

## 📦 필요한 패키지 설치

터미널(PowerShell 또는 CMD)에서 다음 명령어를 순서대로 실행하세요:

### 1. nba_api 설치
```bash
pip install nba_api
```

### 2. pandas 설치 (데이터 처리용)
```bash
pip install pandas
```

### 3. 모든 패키지 한 번에 설치 (권장)
```bash
pip install nba_api pandas
```

---

## 🚀 스크립트 실행 방법

### 1. 스크립트 실행
```bash
python fetch_nba_stats.py
```

### 2. 프로그램 사용 방법
1. 프로그램이 시작되면 현재 시즌이 자동으로 설정됩니다
2. 다른 시즌을 조회하려면 시즌을 입력하세요 (예: `2023-24`)
3. 엔터를 누르면 현재 시즌 데이터를 가져옵니다
4. 상위 몇 명을 출력할지 선택하세요 (기본: 50명)
5. CSV 파일로 저장할지 선택하세요

---

## 📊 출력 데이터 설명

스크립트는 다음 통계를 표시합니다:

| 항목 | 설명 | 영문 약자 |
|------|------|-----------|
| 선수명 | 선수 이름 | PLAYER_NAME |
| 팀 | 소속 팀 | TEAM_ABBREVIATION |
| 경기수 | 출전 경기 수 | GP |
| 출전시간 | 경기당 평균 출전 시간 | MIN |
| 득점 | 경기당 평균 득점 | PTS |
| 야투 | 경기당 평균 야투 성공 | FGM |
| 야투율 | 야투 성공률 (%) | FG_PCT |
| 3점 | 경기당 평균 3점슛 성공 | FG3M |
| 3점율 | 3점슛 성공률 (%) | FG3_PCT |
| 자유투 | 경기당 평균 자유투 성공 | FTM |
| 자유투율 | 자유투 성공률 (%) | FT_PCT |
| 공격REB | 경기당 평균 공격 리바운드 | OREB |
| 리바운드 | 경기당 평균 리바운드 | REB |
| 어시스트 | 경기당 평균 어시스트 | AST |
| 턴오버 | 경기당 평균 턴오버 | TOV |
| 스틸 | 경기당 평균 스틸 | STL |
| 블록 | 경기당 평균 블록 | BLK |
| DD | 시즌 더블더블 횟수 | DD2 |
| TD | 시즌 트리플더블 횟수 | TD3 |

---

## 🔍 예시 출력

```
🏀 NBA 2025-26 시즌 선수 통계를 가져오는 중...
================================================================================
✅ 총 450명의 선수 데이터를 가져왔습니다.
================================================================================

📊 상위 50명 선수 통계
====================================================================================
    선수명              팀   경기수  득점  야투  야투율  3점  3점율  자유투  자유투율  ...
0   Giannis Antetokounmpo  MIL   45    31.2  11.2  55.8   1.5  28.0   7.3    70.5  ...
1   Luka Doncic            DAL   44    33.5  10.8  47.2   4.2  37.5   7.7    75.8  ...
2   Joel Embiid            PHI   29    35.3  11.5  54.8   1.5  35.0  10.8    88.5  ...
...
====================================================================================

📈 주요 통계:
   - 최고 득점자: Joel Embiid (35.3점)
   - 최다 어시스트: Tyrese Haliburton (10.8개)
   - 최다 리바운드: Domantas Sabonis (13.5개)
   - 최다 블록: Brook Lopez (2.5개)
   - 최다 스틸: OG Anunoby (2.0개)
   - 최다 트리플더블: Nikola Jokic (15회)
```

---

## 💾 데이터 저장

### CSV 파일 저장
프로그램 실행 시 CSV 저장을 선택하면:
- 파일명: `nba_stats_2025_26.csv`
- 위치: 스크립트와 같은 폴더
- 인코딩: UTF-8 (엑셀에서도 한글 정상 표시)

### Supabase 저장 ⭐ (새 기능)
프로그램 실행 시 Supabase 저장을 선택하면:
- `nba_players` 테이블: 선수 기본 정보 저장
- `player_season_stats` 테이블: 시즌 평균 스탯 저장
- 기존 데이터가 있으면 자동 업데이트
- 새 선수는 자동 추가

#### Supabase에서 데이터 확인
Supabase 대시보드에서 SQL Editor를 열고:
```sql
-- 모든 선수 조회
SELECT * FROM nba_players ORDER BY name LIMIT 20;

-- 시즌 평균 스탯 조회 (득점순)
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
```

---

## ⚠️ 문제 해결

### 1. ModuleNotFoundError: No module named 'nba_api'
```bash
pip install nba_api pandas supabase python-dotenv
```

### 2. API 연결 오류
- 인터넷 연결 확인
- 잠시 후 다시 시도 (NBA API 서버 문제일 수 있음)

### 3. Supabase 연결 실패
- `.env` 파일이 있는지 확인
- `SUPABASE_URL`과 `SUPABASE_KEY`가 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인

### 4. 테이블이 없다는 오류
- Supabase SQL Editor에서 `supabase/nba-schema.sql` 파일을 실행했는지 확인
- 특히 `player_season_stats` 테이블이 생성되었는지 확인

### 5. 데이터가 너무 많이 출력됨
- 프로그램 실행 시 출력할 선수 수를 줄이세요 (예: 20명)

### 6. 한글이 깨져서 출력됨
- PowerShell에서 실행:
  ```bash
  chcp 65001
  python fetch_nba_stats.py
  ```

---

## 🎯 추가 기능 아이디어

스크립트를 수정하여 다음 기능을 추가할 수 있습니다:

1. **특정 팀 선수만 필터링**
2. **특정 통계 기준으로 정렬** (예: 어시스트, 리바운드)
3. **플레이오프 통계 가져오기**
4. **선수 비교 기능**
5. **시각화 그래프 생성** (matplotlib 사용)

---

## 📝 참고 사항

- **데이터 출처**: NBA 공식 통계 API
- **업데이트**: 매 경기 후 자동 업데이트
- **최소 경기 수**: 5경기 이상 출전한 선수만 표시
- **정렬 기준**: 경기당 평균 득점 순

---

**Happy Coding! 🏀**
