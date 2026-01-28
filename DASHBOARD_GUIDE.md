# 🎉 NBA 스탯 대시보드 사용 가이드

간단한 NBA 선수 통계 대시보드가 완성되었습니다!

---

## 🚀 빠른 시작

### 1️⃣ 데이터 수집
먼저 파이썬 스크립트로 NBA 데이터를 Supabase에 저장하세요:

```bash
python fetch_nba_stats.py
```

프로그램 실행 후:
- 시즌 선택: `2025-26` (엔터)
- 상위 선수 수: `50` (엔터)
- **Supabase 저장**: `y` ⭐
- CSV 저장: `n` (선택사항)

### 2️⃣ 웹 대시보드 실행
```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## ✨ 기능

### 📊 통계 카드
- **전체 선수**: 데이터베이스에 저장된 총 선수 수
- **최고 득점자**: 경기당 평균 득점 1위 선수
- **평균 득점**: 모든 선수의 평균 득점

### 🔍 검색 & 필터
- **선수 검색**: 선수명 또는 팀명으로 실시간 검색
- **정렬 기준**: 득점, 리바운드, 어시스트 기준으로 정렬

### 📋 선수 테이블
표시되는 통계:
- 순위 (상위 3명 메달 표시)
- 선수명
- 팀
- 경기 수
- 득점 (PPG)
- 리바운드 (RPG)
- 어시스트 (APG)
- 스틸 (SPG)
- 블록 (BPG)
- 야투율 (FG%)
- 3점슛 성공 (3PM)
- 더블더블 (DD)
- 트리플더블 (TD)

---

## 🎨 디자인 특징

### 다크 모드 테마
- 배경: Gray-900 (#111827)
- 카드: Gray-800 (#1f2937)
- 테두리: Gray-700 (#374151)
- 텍스트: White & Gray-400

### 색상 강조
- 🥇 금메달: 1위
- 🥈 은메달: 2위
- 🥉 동메달: 3위
- 🟢 득점: 녹색 강조
- 🔵 팀 뱃지: 파란색
- 🟣 더블더블: 보라색
- 🟠 트리플더블: 주황색

### 반응형 디자인
- 모바일: 1열 레이아웃
- 태블릿: 2열 레이아웃
- 데스크톱: 3열 레이아웃

---

## 🔄 데이터 업데이트

### 정기적 업데이트
1. 파이썬 스크립트 실행:
   ```bash
   python fetch_nba_stats.py
   ```
2. Supabase 저장 선택: `y`
3. 웹 대시보드에서 "새로고침" 버튼 클릭

### 자동 업데이트 (선택사항)
스크립트를 크론잡이나 스케줄러로 자동 실행:

**Windows (작업 스케줄러)**
- 매일 특정 시간에 자동 실행

**Linux/Mac (Crontab)**
```bash
# 매일 오전 9시에 실행
0 9 * * * cd /path/to/CHATBOT && python fetch_nba_stats.py
```

---

## 📊 Supabase에서 데이터 확인

### 선수 데이터 조회
```sql
-- 모든 선수 조회
SELECT * FROM nba_players ORDER BY name;

-- 시즌 스탯 조회
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

### 트리플더블 선수
```sql
SELECT 
  p.name,
  p.team,
  s.triple_doubles,
  s.points,
  s.rebounds,
  s.assists
FROM player_season_stats s
JOIN nba_players p ON s.player_id = p.id
WHERE s.season = '2025-26' AND s.triple_doubles > 0
ORDER BY s.triple_doubles DESC;
```

---

## ⚡ 성능 최적화

### 데이터 캐싱
- 컴포넌트 레벨 상태 관리
- 필요시에만 데이터 새로고침

### 효율적인 렌더링
- 테이블 가상화 (대량 데이터 처리 시)
- 검색 결과 실시간 필터링

---

## 🛠 커스터마이징

### 표시할 선수 수 변경
`page.tsx` 파일에서:
```typescript
.limit(100) // 원하는 숫자로 변경
```

### 기본 정렬 기준 변경
```typescript
const [sortBy, setSortBy] = useState<'points' | 'rebounds' | 'assists'>('rebounds');
```

### 시즌 변경
```typescript
const [currentSeason, setCurrentSeason] = useState('2024-25');
```

---

## 🎯 다음 단계

### 추가 기능 아이디어
1. **선수 상세 페이지**: 클릭하면 개별 선수의 상세 통계 표시
2. **차트 추가**: 득점, 리바운드, 어시스트 차트 (Chart.js 또는 Recharts)
3. **팀별 필터**: 특정 팀의 선수만 보기
4. **비교 모드**: 여러 선수를 선택하여 비교
5. **커스텀 가중치**: 사용자가 정의한 가중치로 종합 점수 계산

### 배포
1. Vercel에 배포:
   ```bash
   vercel deploy
   ```
2. 환경 변수 설정 (Vercel 대시보드에서)
3. 자동 배포 완료!

---

## ❓ 문제 해결

### 데이터가 표시되지 않음
1. Supabase에 데이터가 있는지 확인
2. `.env` 파일 설정 확인
3. 브라우저 콘솔에서 오류 확인

### 테이블이 깨짐
1. Supabase SQL Editor에서 테이블 확인:
   ```sql
   SELECT * FROM player_season_stats LIMIT 1;
   ```
2. `nba-schema.sql` 재실행

### 느린 로딩
1. 표시할 선수 수 줄이기 (`.limit(50)`)
2. 인덱스 확인 (스키마에 이미 포함됨)

---

**완료! 🎉**

이제 멋진 NBA 스탯 대시보드를 즐기세요! 🏀
