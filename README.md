# 🏀 NBA Player Stats Dashboard

Next.js와 Supabase를 활용한 NBA 선수 일일 스탯 수집 및 종합 점수 랭킹 시스템

## ✨ 주요 기능

- **일일 스탯 수집**: Python 스크립트로 NBA API에서 선수 통계 자동 수집
- **Supabase 연동**: 데이터베이스에 선수 정보 및 시즌 평균 스탯 저장
- **커스텀 가중치**: 사용자 정의 가중치로 선수 종합 점수 계산
- **실시간 랭킹**: 날짜별 선수 랭킹 조회
- **다크 모드 대시보드**: 깔끔하고 모던한 UI/UX
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원

## 🚀 빠른 시작

### 1️⃣ 환경 설정

```bash
# Node.js 패키지 설치
npm install

# Python 패키지 설치
pip install nba_api pandas supabase python-dotenv
```

### 2️⃣ 환경 변수 설정

`.env` 파일 생성:
```env
# Supabase (Python 스크립트용)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Supabase (Next.js 앱용)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3️⃣ Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/nba-schema.sql` 실행

### 4️⃣ 데이터 수집

```bash
python fetch_nba_stats.py
```

### 5️⃣ 웹 대시보드 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 📁 프로젝트 구조

```
CHATBOT/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── stats/              # 스탯 수집 & 계산
│   │   ├── rankings/           # 랭킹 조회
│   │   └── weights/            # 가중치 관리
│   ├── page.tsx                # 메인 대시보드
│   ├── layout.tsx              # 루트 레이아웃
│   └── globals.css             # 글로벌 스타일
├── components/                  # React 컴포넌트
│   ├── RankingTable.tsx        # 랭킹 테이블
│   ├── StatCard.tsx            # 통계 카드
│   ├── WeightSelector.tsx      # 가중치 선택기
│   └── DateSelector.tsx        # 날짜 선택기
├── lib/                        # 유틸리티
│   ├── supabase.ts            # Supabase 클라이언트
│   ├── nba-api.ts             # NBA API 연동
│   └── scoring.ts             # 점수 계산 로직
├── types/                      # TypeScript 타입
│   └── nba.ts                 # NBA 관련 타입
├── supabase/                   # 데이터베이스
│   └── nba-schema.sql         # 스키마 정의
├── fetch_nba_stats.py          # NBA 스탯 수집 스크립트
└── 📚 문서/
    ├── QUICKSTART.md           # 빠른 시작 가이드
    ├── DASHBOARD_GUIDE.md      # 대시보드 사용법
    ├── NBA_STATS_COMPLETE_GUIDE.md  # 완전한 가이드
    └── SUPABASE_INTEGRATION.md      # Supabase 연동
```

## 📊 데이터베이스 구조

### 주요 테이블
- **nba_players**: 선수 기본 정보
- **player_season_stats**: 시즌 평균 스탯 (Python 스크립트에서 저장)
- **player_daily_stats**: 일일 경기 스탯
- **scoring_weights**: 가중치 설정 (4개 프리셋 포함)
- **player_scores**: 계산된 종합 점수

## 🎨 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Data Collection**: Python, nba_api
- **Deployment**: Vercel (권장)

## 📚 문서

- **[QUICKSTART.md](QUICKSTART.md)**: 빠른 시작 가이드
- **[DASHBOARD_GUIDE.md](DASHBOARD_GUIDE.md)**: 웹 대시보드 사용법
- **[NBA_STATS_COMPLETE_GUIDE.md](NBA_STATS_COMPLETE_GUIDE.md)**: 완전한 사용 가이드
- **[SUPABASE_INTEGRATION.md](SUPABASE_INTEGRATION.md)**: Supabase 연동 가이드
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)**: 프로젝트 구조 설명
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)**: 상세 설정 가이드

## 🔄 데이터 수집 방법

### Python 스크립트 실행
```bash
python fetch_nba_stats.py
```

1. 시즌 선택 (기본: 2025-26)
2. 데이터 수집 (NBA API)
3. 화면에 통계 출력
4. Supabase에 저장
5. CSV 파일로 저장 (선택)

### 수집되는 데이터
- 경기당 평균 득점 (PTS)
- 경기당 평균 야투/야투율 (FGM, FG%)
- 경기당 평균 3점슛/3점율 (3PM, 3P%)
- 경기당 평균 자유투/자유투율 (FTM, FT%)
- 경기당 평균 리바운드 (REB, OREB)
- 경기당 평균 어시스트 (AST)
- 경기당 평균 턴오버 (TOV)
- 경기당 평균 스틸 (STL)
- 경기당 평균 블록 (BLK)
- 시즌 더블더블/트리플더블 (DD, TD)

## 🎯 주요 기능 상세

### 1. 데이터 수집 (Python)
- nba_api를 통한 실시간 NBA 통계 수집
- Supabase 자동 저장 (Upsert)
- CSV 파일 내보내기

### 2. 웹 대시보드 (Next.js)
- 선수 시즌 평균 통계 표시
- 실시간 검색 및 필터
- 정렬 기능 (득점, 리바운드, 어시스트)
- 통계 카드 (전체 선수, 최고 득점자, 평균)

### 3. 가중치 시스템
- 기본: 균형잡힌 가중치
- 공격 중심: 득점 강조
- 수비 중심: 수비 스탯 강조
- 플레이메이커: 어시스트 강조

## 🚀 배포

### Vercel 배포
1. GitHub 저장소 연결
2. 환경 변수 설정
3. 자동 배포 완료

### 자동화 (Cron Jobs)
`vercel.json`에 설정된 자동 스탯 수집:
- 매일 12:00 - 스탯 수집
- 매일 12:30 - 점수 계산

## 🤝 기여

이슈 제보 및 풀 리퀘스트를 환영합니다!

## 📄 라이센스

MIT License

---

**Made with ❤️ for NBA fans**

🏀 2025-26 시즌
