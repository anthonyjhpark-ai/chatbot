# NBA 선수 스탯 대시보드 - 프로젝트 구조

## 📂 전체 디렉토리 구조

```
CHATBOT/
│
├── 📁 app/                          # Next.js 14 App Router
│   ├── 📁 api/                     # API Routes
│   │   ├── 📁 stats/
│   │   │   ├── 📁 collect/
│   │   │   │   └── route.ts       # 스탯 수집 API
│   │   │   └── 📁 calculate/
│   │   │       └── route.ts       # 점수 계산 API
│   │   ├── 📁 rankings/
│   │   │   └── route.ts           # 랭킹 조회 API
│   │   └── 📁 weights/
│   │       └── route.ts           # 가중치 관리 API
│   │
│   ├── layout.tsx                  # 루트 레이아웃
│   ├── page.tsx                    # 메인 대시보드 페이지
│   └── globals.css                 # 글로벌 스타일시트
│
├── 📁 components/                   # React 컴포넌트
│   ├── RankingTable.tsx           # 선수 랭킹 테이블
│   ├── StatCard.tsx               # 통계 카드 컴포넌트
│   ├── WeightSelector.tsx         # 가중치 선택기
│   └── DateSelector.tsx           # 날짜 선택기
│
├── 📁 lib/                          # 유틸리티 & 라이브러리
│   ├── supabase.ts                # Supabase 클라이언트 설정
│   ├── nba-api.ts                 # NBA API 연동 함수
│   └── scoring.ts                 # 점수 계산 로직
│
├── 📁 types/                        # TypeScript 타입 정의
│   └── nba.ts                     # NBA 관련 인터페이스
│
├── 📁 supabase/                     # Supabase 관련 파일
│   ├── nba-schema.sql             # 데이터베이스 스키마
│   ├── schema.sql                 # (기존 스키마)
│   ├── seed.sql                   # (기존 시드)
│   └── README.md                  # (기존 README)
│
├── 📄 .env.example                  # 환경 변수 예시
├── 📄 .env.local                    # 환경 변수 (생성 필요)
├── 📄 .gitignore                    # Git 무시 파일
├── 📄 package.json                  # 프로젝트 의존성
├── 📄 package-lock.json            # 의존성 잠금 파일
├── 📄 tsconfig.json                # TypeScript 설정
├── 📄 tailwind.config.js           # Tailwind CSS 설정
├── 📄 postcss.config.js            # PostCSS 설정
├── 📄 next.config.js               # Next.js 설정
├── 📄 vercel.json                  # Vercel 배포 설정 (Cron)
├── 📄 README.md                    # 프로젝트 문서
├── 📄 SETUP_GUIDE.md               # 설정 가이드
└── 📄 PROJECT_STRUCTURE.md         # 이 문서
```

## 🗂 주요 파일 설명

### 1. API Routes (`app/api/`)

#### `/api/stats/collect` (route.ts)
- **목적**: 외부 NBA API에서 오늘의 경기 스탯 수집
- **메서드**: GET
- **프로세스**:
  1. NBA API 호출
  2. 선수 정보 확인/추가
  3. 스탯 데이터 저장
- **반환**: 저장된 스탯 개수

#### `/api/stats/calculate` (route.ts)
- **목적**: 저장된 스탯에 가중치를 적용하여 점수 계산
- **메서드**: GET, POST
- **프로세스**:
  1. 가중치 정보 로드
  2. 해당 날짜의 모든 스탯 조회
  3. 점수 계산 및 저장
- **반환**: 계산된 점수 개수

#### `/api/rankings` (route.ts)
- **목적**: 특정 날짜의 선수 랭킹 조회
- **메서드**: GET
- **쿼리 파라미터**:
  - `date`: 조회할 날짜 (기본: 오늘)
  - `weightId`: 가중치 ID (기본: 기본 가중치)
  - `limit`: 결과 개수 (기본: 50)
- **반환**: 랭킹 목록 (순위, 선수 정보, 점수)

#### `/api/weights` (route.ts)
- **목적**: 가중치 설정 관리
- **메서드**: GET, POST, PUT, DELETE
- **기능**:
  - GET: 모든 가중치 조회
  - POST: 새 가중치 생성
  - PUT: 가중치 수정
  - DELETE: 가중치 삭제

### 2. 컴포넌트 (`components/`)

#### `RankingTable.tsx`
- 선수 랭킹을 테이블 형식으로 표시
- 상위 3명은 메달 아이콘으로 강조
- 로딩 상태 애니메이션
- 선수 사진 지원

#### `StatCard.tsx`
- 주요 통계를 카드 형식으로 표시
- 아이콘, 트렌드 표시 지원
- 4가지 색상 테마 (blue, green, purple, orange)

#### `WeightSelector.tsx`
- 가중치 선택 드롭다운
- 가중치 상세 정보 토글
- 실시간 가중치 조회

#### `DateSelector.tsx`
- 날짜 선택 입력
- 이전/다음 날 버튼
- 오늘 날짜 표시

### 3. 라이브러리 (`lib/`)

#### `supabase.ts`
- Supabase 클라이언트 초기화
- 환경 변수에서 URL과 키 로드

#### `nba-api.ts`
- NBA API 연동 함수들
- 데이터 변환 함수
- 목 데이터 생성 함수 (테스트용)

#### `scoring.ts`
- 점수 계산 알고리즘
- 평균 점수 계산
- 트렌드 분석
- 스탯 비교

### 4. 타입 정의 (`types/nba.ts`)

주요 인터페이스:
- `NBAPlayer`: 선수 정보
- `PlayerDailyStat`: 일일 스탯
- `ScoringWeight`: 가중치 설정
- `PlayerScore`: 계산된 점수
- `PlayerRanking`: 랭킹 정보
- `DashboardStats`: 대시보드 통계

### 5. 데이터베이스 스키마 (`supabase/nba-schema.sql`)

테이블:
1. **nba_players**: 선수 기본 정보
2. **player_daily_stats**: 일일 경기 스탯
3. **scoring_weights**: 가중치 설정
4. **player_scores**: 계산된 종합 점수

뷰:
- **player_rankings**: 선수 랭킹 뷰

함수:
- **calculate_player_score()**: 점수 계산 함수

## 🔄 데이터 흐름

```
┌─────────────────┐
│   NBA API       │
│  (외부 데이터)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ /api/stats/     │
│   collect       │ ─────► Supabase DB
└────────┬────────┘         (player_daily_stats)
         │
         ▼
┌─────────────────┐
│ /api/stats/     │
│   calculate     │ ─────► Supabase DB
└────────┬────────┘         (player_scores)
         │
         ▼
┌─────────────────┐
│ /api/rankings   │ ◄───── Supabase DB
│                 │         (조회)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Dashboard      │
│  (page.tsx)     │
└─────────────────┘
```

## 🎨 스타일 구조

- **Tailwind CSS**: 유틸리티 기반 스타일
- **다크 모드**: 기본 테마
- **색상 팔레트**:
  - 배경: gray-900, gray-800
  - 텍스트: white, gray-400
  - 강조: blue-500, green-500, purple-500
  - 테두리: gray-700

## 🔐 환경 변수

필수:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon 키

선택:
- `NBA_API_KEY`: NBA API 인증 키
- `NBA_API_BASE_URL`: NBA API 베이스 URL

## 🚀 실행 흐름

### 개발 모드
```bash
npm run dev
```

1. Next.js 개발 서버 시작 (포트 3000)
2. Tailwind CSS 컴파일
3. 파일 변경 감지 및 핫 리로드

### 프로덕션 빌드
```bash
npm run build
npm start
```

1. TypeScript 컴파일
2. 페이지 빌드 및 최적화
3. 정적 파일 생성
4. 프로덕션 서버 시작

## 📊 확장 가능성

### 추가 가능한 기능
1. **선수 상세 페이지**: `/player/[id]`
2. **팀 페이지**: `/team/[name]`
3. **비교 페이지**: `/compare`
4. **통계 페이지**: `/stats`
5. **설정 페이지**: `/settings`

### 추가 가능한 컴포넌트
- `PlayerCard.tsx`: 선수 카드
- `StatChart.tsx`: 통계 차트
- `ComparisonTable.tsx`: 비교 테이블
- `FilterPanel.tsx`: 필터 패널
- `SearchBar.tsx`: 검색 바

### 추가 가능한 API
- `/api/player/[id]`: 선수 상세 정보
- `/api/team/[name]`: 팀 정보
- `/api/search`: 검색 API
- `/api/analytics`: 분석 API

---

이 구조는 확장 가능하고 유지보수하기 쉽게 설계되었습니다!
