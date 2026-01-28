# 🚀 GitHub 푸시 가이드

## ✅ 로컬 커밋 완료!

31개 파일이 성공적으로 커밋되었습니다:
- 새로 추가된 파일: 24개
- 수정된 파일: 7개

커밋 메시지:
```
feat: NBA 선수 스탯 대시보드 완성
- NBA API 연동 Python 스크립트 추가
- Supabase 데이터베이스 스키마 설계
- Next.js 웹 대시보드 구현 (다크 모드)
- 선수 시즌 평균 통계 표시
- 실시간 검색 및 정렬 기능
```

---

## 📋 GitHub 저장소 생성 및 푸시 방법

### 방법 1: GitHub 웹사이트에서 생성 (추천)

1. **GitHub 저장소 생성**
   - [GitHub](https://github.com)에 로그인
   - 우측 상단 `+` 버튼 클릭 → `New repository` 선택
   - Repository name: `nba-stats-dashboard`
   - Description: `NBA 선수 스탯 대시보드 - Next.js, Supabase, Python`
   - Public 선택
   - ❌ **"Initialize this repository with"** 체크박스 모두 해제 (비워두기)
   - `Create repository` 클릭

2. **생성된 저장소 URL 복사**
   - 예: `https://github.com/YOUR_USERNAME/nba-stats-dashboard.git`

3. **터미널에서 다음 명령어 실행**
   ```bash
   # 원격 저장소 추가
   git remote add origin https://github.com/YOUR_USERNAME/nba-stats-dashboard.git
   
   # 푸시
   git push -u origin main
   ```

### 방법 2: GitHub CLI 사용 (gh 설치 필요)

GitHub CLI가 설치되어 있지 않으므로, 먼저 설치가 필요합니다:

1. **GitHub CLI 설치**
   - Windows: https://cli.github.com/ 에서 다운로드
   - 또는 winget: `winget install --id GitHub.cli`

2. **로그인**
   ```bash
   gh auth login
   ```

3. **저장소 생성 및 푸시**
   ```bash
   gh repo create nba-stats-dashboard --public --source=. --push
   ```

---

## 🎯 빠른 실행 명령어

저장소를 만든 후 터미널에서 실행:

```bash
# YOUR_USERNAME을 실제 GitHub 사용자명으로 변경하세요
git remote add origin https://github.com/YOUR_USERNAME/nba-stats-dashboard.git
git branch -M main
git push -u origin main
```

---

## ✨ 푸시 후 확인사항

GitHub 저장소에서 다음을 확인하세요:

### 📁 파일 구조
- ✅ `fetch_nba_stats.py` - Python 스크립트
- ✅ `app/page.tsx` - 메인 대시보드
- ✅ `supabase/nba-schema.sql` - DB 스키마
- ✅ `README.md` - 프로젝트 문서
- ✅ 7개의 가이드 문서 (*.md)
- ✅ `.env.example` - 환경 변수 예시

### 🔒 보안 확인
- ✅ `.env` 파일은 제외됨 (.gitignore)
- ✅ `node_modules/` 제외됨
- ✅ CSV 파일 제외됨

---

## 📝 README 업데이트

저장소 README에는 다음 내용이 포함되어 있습니다:
- 프로젝트 설명
- 주요 기능
- 빠른 시작 가이드
- 프로젝트 구조
- 기술 스택
- 문서 링크

---

## 🚀 다음 단계

1. **GitHub 저장소 생성**: https://github.com/new
2. **원격 저장소 추가 및 푸시**: 위의 명령어 실행
3. **Vercel 배포** (선택사항):
   - [Vercel](https://vercel.com) 로그인
   - GitHub 저장소 연결
   - 환경 변수 설정
   - 자동 배포!

---

## 💡 팁

### GitHub Actions로 자동화
`.github/workflows/` 폴더에 워크플로우를 추가하면:
- 자동 테스트
- 자동 배포
- 정기적인 데이터 수집

### 저장소 설정
- **Topics 추가**: `nba`, `stats`, `dashboard`, `nextjs`, `supabase`, `python`
- **About 섹션**: 프로젝트 설명과 웹사이트 URL 추가
- **README 뱃지**: 빌드 상태, 버전 등

---

**모든 준비가 완료되었습니다! 🎉**

위의 방법 중 하나를 선택하여 GitHub에 푸시하세요! 🚀
