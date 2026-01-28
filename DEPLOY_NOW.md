# 🚀 Vercel 자동 배포 - 즉시 실행 가이드

## ⚡ 현재 상태

Vercel 로그인이 대기 중입니다!

### 🔐 인증 필요

**브라우저에서 다음 URL을 열어 인증하세요:**
```
https://vercel.com/oauth/device?user_code=VZHQ-DKMF
```

또는 터미널에서 **Enter 키**를 눌러 자동으로 브라우저를 여세요.

---

## 🎯 3가지 배포 방법

### ✅ 방법 1: CLI 자동 배포 (추천 - 가장 빠름)

#### 1단계: 로그인 완료
위의 URL에서 인증 완료 → 터미널로 돌아오기

#### 2단계: 자동 배포 실행
터미널에서:
```bash
vercel --prod
```

질문이 나오면:
- `Set up and deploy?` → **Y**
- `Which scope?` → **Enter** (기본값)
- `Link to existing project?` → **N**
- `Project name?` → **nba-stats-dashboard** (또는 Enter)
- `Directory?` → **Enter** (현재 디렉토리)
- `Override settings?` → **N**

#### 3단계: 환경 변수 설정
배포 완료 후:
```bash
# Supabase URL 추가
vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Supabase Key 추가
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

각각 실제 값을 입력하세요.

#### 4단계: 재배포 (환경 변수 적용)
```bash
vercel --prod
```

**완료! 🎉**

---

### ✅ 방법 2: Vercel 웹 대시보드 (가장 쉬움)

CLI 인증이 안되면 웹에서:

#### 1. Vercel 대시보드 접속
https://vercel.com/dashboard

#### 2. "Add New" → "Project"

#### 3. GitHub 저장소 가져오기
- "Import Git Repository" 클릭
- GitHub 연결 (처음이면 인증 필요)
- `anthonyjhpark-ai/chatbot` 선택
- "Import" 클릭

#### 4. 프로젝트 설정
- Framework: **Next.js** (자동 감지됨)
- Root Directory: `./` (기본값)
- Build Command: `npm run build` (자동)
- Output Directory: `.next` (자동)

#### 5. 환경 변수 추가 ⭐
"Environment Variables" 섹션:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: [실제 Supabase URL]
Environment: Production, Preview, Development (모두 체크)

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
Value: [실제 Supabase Anon Key]
Environment: Production, Preview, Development (모두 체크)
```

#### 6. "Deploy" 클릭

**3-5분 대기** → 배포 완료! 🎉

배포 URL: `https://chatbot-xxx.vercel.app`

---

### ✅ 방법 3: GitHub Actions 자동 배포

`.github/workflows/deploy.yml` 파일을 만들면 자동 배포:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

필요한 Secrets:
- `VERCEL_TOKEN`: Vercel 토큰
- `ORG_ID`: 조직 ID
- `PROJECT_ID`: 프로젝트 ID

---

## 🎯 즉시 시작 (단계별)

### 지금 바로 실행하세요!

#### Step 1: Vercel 인증
브라우저에서:
```
https://vercel.com/oauth/device?user_code=VZHQ-DKMF
```
- GitHub로 로그인
- "Authorize" 클릭

#### Step 2: 터미널로 돌아가기
인증 완료되면 터미널에 "Success!" 표시됨

#### Step 3: 배포 실행
```bash
vercel --prod
```

#### Step 4: 환경 변수 설정
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# 값 입력: https://your-project.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# 값 입력: eyJhbG...
```

#### Step 5: 재배포
```bash
vercel --prod
```

**끝! 🎉**

---

## 📝 환경 변수 값 찾기

### Supabase URL과 Key 가져오기

1. [Supabase 대시보드](https://app.supabase.com) 로그인
2. 프로젝트 선택
3. Settings → API
4. 다음 값 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## ✅ 배포 확인

배포 완료 후:

### 1. URL 확인
```
https://chatbot-xxx.vercel.app
```

또는

```
https://nba-stats-dashboard-xxx.vercel.app
```

### 2. 기능 테스트
- ✅ 페이지 로드
- ✅ 선수 데이터 표시
- ✅ 검색 기능
- ✅ 정렬 기능

### 3. 에러 확인
Vercel 대시보드 → Deployments → 로그 확인

---

## 🔄 업데이트 배포

코드 수정 후:

### 자동 배포 (GitHub 연동)
```bash
git add .
git commit -m "Update feature"
git push origin main
```
→ Vercel이 자동으로 배포!

### 수동 배포
```bash
vercel --prod
```

---

## 💡 팁

### 1. 배포 URL 커스터마이징
Vercel 대시보드:
- Settings → Domains
- "Add Domain" 클릭
- 원하는 도메인 입력

### 2. Preview 배포
```bash
vercel
```
(--prod 없이 실행하면 Preview 배포)

### 3. 로컬 환경 변수 사용
```bash
vercel env pull .env.local
```

---

## 🚨 문제 해결

### 로그인 안됨
- 브라우저에서 직접 URL 복사: https://vercel.com/oauth/device?user_code=VZHQ-DKMF
- GitHub 계정으로 인증
- "Authorize Vercel" 클릭

### 빌드 실패
```bash
# 로컬에서 먼저 테스트
npm run build

# 에러 확인
vercel logs
```

### 환경 변수 적용 안됨
- Vercel 대시보드 → Settings → Environment Variables
- 수동으로 추가
- 재배포 필요

---

## 📊 다음 단계

배포 완료 후:

1. **도메인 연결**
   - 커스텀 도메인 설정
   - SSL 자동 활성화

2. **분석 활성화**
   - Vercel Analytics
   - 실시간 모니터링

3. **Cron Jobs 활성화**
   - Settings → Crons
   - 자동 스탯 수집 활성화

---

**지금 바로 시작하세요! 🚀**

인증 URL: https://vercel.com/oauth/device?user_code=VZHQ-DKMF

선택:
- 🚀 **CLI 자동 배포** (빠름)
- 🌐 **웹 대시보드** (쉬움)
- 🤖 **GitHub Actions** (고급)
