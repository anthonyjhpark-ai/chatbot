# 뉴스 검색 & 챗봇

키워드를 입력하면 구글에서 관련 뉴스를 검색하고, 제미나이 API를 사용하여 뉴스를 요약하고 대화할 수 있는 챗봇입니다.

## 기능

- 🔍 키워드 기반 뉴스 검색 (최대 10개)
- 📝 제미나이 API를 사용한 뉴스 요약
- 💬 뉴스 기반 대화형 챗봇

## 기술 스택

- Next.js 14
- React 18
- TypeScript
- Google Gemini API
- Google News RSS

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

**⚠️ 중요**: `.env.local` 파일은 Git에 업로드되지 않습니다. API 키는 절대 공개 저장소에 노출하지 마세요.

3. 개발 서버 실행:
```bash
npm run dev
```

4. 브라우저에서 `http://localhost:3000` 접속

## Vercel 배포

1. Vercel에 프로젝트를 연결합니다.

2. Vercel 대시보드에서 환경 변수를 설정합니다:
   - Settings > Environment Variables
   - `GEMINI_API_KEY`를 추가하고 API 키 값을 입력합니다.

3. 배포가 완료되면 자동으로 환경 변수가 적용됩니다.

## 주의사항

- `.env.local` 파일은 Git에 커밋되지 않도록 `.gitignore`에 포함되어 있습니다.
- API 키는 절대 공개 저장소에 노출하지 마세요.
- Vercel 배포 시 환경 변수를 반드시 설정해야 합니다.
