# 🚀 Vercel 배포 가이드 (자동화)

## ⚡ 빠른 배포 (3단계)

### 1️⃣ Vercel 로그인

터미널에서:
```bash
vercel login
```

브라우저가 자동으로 열립니다:
- 인증 코드: **VZHQ-DKMF**
- URL: https://vercel.com/oauth/device?user_code=VZHQ-DKMF
- GitHub 계정으로 로그인
- "Authorize" 클릭

### 2️⃣ 환경 변수 준비

**중요**: 실제 Supabase 값으로 변경하세요!

`.env.production` 파일 생성 (또는 `.env` 수정):
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3️⃣ 배포 실행

```bash
# 프로젝트 링크 및 배포
vercel

# 또는 프로덕션 배포
vercel --prod
```

---

## 📋 상세 배포 단계

### Step 1: Vercel CLI 설치 확인
```bash
vercel --version
# Vercel CLI 50.6.0 ✅
```

### Step 2: 로그인
```bash
vercel login
```

로그인 방법:
1. **GitHub**: 추천 (자동 저장소 연결)
2. **Email**: 이메일 인증
3. **GitLab/Bitbucket**: 다른 Git 제공자

### Step 3: 프로젝트 설정
```bash
vercel
```

질문에 답변:
```
? Set up and deploy "~/Desktop/CHATBOT"? [Y/n] y
? Which scope do you want to deploy to? [YOUR_USERNAME]
? Link to existing project? [y/N] n
? What's your project's name? nba-stats-dashboard
? In which directory is your code located? ./
? Want to override the settings? [y/N] n
```

### Step 4: 환경 변수 설정
```bash
# Supabase URL 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Supabase Anon Key 설정
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

입력 프롬프트에서:
1. 변수 이름 확인
2. 실제 값 입력
3. Enter

### Step 5: 프로덕션 배포
```bash
vercel --prod
```

---

## 🎯 한 번에 실행하기

### 옵션 1: 대화형 배포
```bash
vercel
```

### 옵션 2: 자동 배포 (환경 변수 제외)
```bash
vercel --prod --yes --name nba-stats-dashboard
```

### 옵션 3: 환경 변수 포함 (스크립트)
```bash
# Windows PowerShell
$env:NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
vercel --prod --yes
```

---

## 🌐 Vercel 웹 대시보드에서 배포

CLI 대신 웹 인터페이스 사용:

### 1. Vercel 대시보드 접속
https://vercel.com/dashboard

### 2. "Add New" → "Project" 클릭

### 3. GitHub 저장소 선택
- "Import Git Repository"
- `anthonyjhpark-ai/chatbot` 선택
- "Import" 클릭

### 4. 프로젝트 설정
- **Framework Preset**: Next.js (자동 감지)
- **Root Directory**: `./`
- **Build Command**: `npm run build` (자동)
- **Output Directory**: `.next` (자동)

### 5. 환경 변수 추가
"Environment Variables" 섹션에서:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR-PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` |

**Environment**: Production, Preview, Development 모두 선택

### 6. "Deploy" 클릭

---

## ✅ 배포 완료 후 확인

### 배포 URL
```
https://nba-stats-dashboard-xxx.vercel.app
```

또는 커스텀 도메인:
```
https://nba-stats.yoursite.com
```

### 확인 사항
- ✅ 페이지가 로드되는지
- ✅ Supabase 연결이 작동하는지
- ✅ 선수 데이터가 표시되는지
- ✅ 검색 및 정렬이 작동하는지

---

## 🔧 환경 변수 관리

### CLI로 환경 변수 추가
```bash
# Production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Preview (선택사항)
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview

# Development (선택사항)
vercel env add NEXT_PUBLIC_SUPABASE_URL development
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
```

### CLI로 환경 변수 조회
```bash
vercel env ls
```

### CLI로 환경 변수 삭제
```bash
vercel env rm VARIABLE_NAME production
```

---

## 🔄 재배포

### 자동 재배포
GitHub에 푸시하면 자동으로 배포:
```bash
git add .
git commit -m "Update dashboard"
git push origin main
```

### 수동 재배포
```bash
vercel --prod
```

---

## 📊 Vercel 대시보드 기능

### 1. Deployments
- 모든 배포 이력 확인
- 롤백 가능
- 로그 확인

### 2. Analytics
- 페이지 뷰
- 방문자 수
- 성능 지표

### 3. Domains
- 커스텀 도메인 연결
- SSL 인증서 자동 생성
- DNS 설정

### 4. Integrations
- GitHub 자동 배포
- Slack 알림
- Sentry 에러 추적

---

## ⚡ Cron Jobs 설정

`vercel.json`에 이미 설정되어 있습니다:

```json
{
  "crons": [
    {
      "path": "/api/stats/collect",
      "schedule": "0 12 * * *"
    },
    {
      "path": "/api/stats/calculate",
      "schedule": "30 12 * * *"
    }
  ]
}
```

### Cron 스케줄 설명
- `0 12 * * *`: 매일 12:00 (스탯 수집)
- `30 12 * * *`: 매일 12:30 (점수 계산)

### Vercel에서 Cron 활성화
1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Crons
3. "Enable Cron Jobs" 클릭

---

## 🐛 문제 해결

### 1. 배포 실패
```bash
# 로그 확인
vercel logs

# 빌드 로그 확인
vercel inspect [DEPLOYMENT_URL]
```

### 2. 환경 변수 오류
```bash
# 환경 변수 확인
vercel env ls

# 환경 변수 재설정
vercel env rm NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
```

### 3. Supabase 연결 실패
- Supabase URL과 Key가 올바른지 확인
- RLS 정책 확인
- 네트워크 설정 확인

---

## 📝 배포 체크리스트

배포 전:
- ✅ `.env.example` 파일 확인
- ✅ `.gitignore`에 `.env` 포함 확인
- ✅ Supabase 테이블 생성 완료
- ✅ 로컬에서 테스트 완료
- ✅ GitHub에 푸시 완료

배포 중:
- ✅ Vercel 로그인
- ✅ 프로젝트 생성
- ✅ 환경 변수 설정
- ✅ 배포 실행

배포 후:
- ✅ 배포 URL 확인
- ✅ 기능 테스트
- ✅ 에러 확인
- ✅ 성능 확인

---

## 🎯 다음 단계

1. **커스텀 도메인 연결**
   - Vercel → Domains → Add Domain
   - DNS 레코드 설정

2. **모니터링 설정**
   - Vercel Analytics 활성화
   - Sentry 연동 (에러 추적)

3. **성능 최적화**
   - 이미지 최적화
   - 캐싱 전략
   - CDN 활용

---

**준비 완료! 🚀**

위의 방법 중 하나를 선택하여 Vercel에 배포하세요!

추천: **Vercel 웹 대시보드** (가장 쉬움) 
