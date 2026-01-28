# NBA 실제 데이터 업데이트 가이드

## ⚠️ 현재 상황
지금 표시되는 데이터는 샘플 데이터입니다. 실제 2024-25 시즌 현재 데이터를 수집해야 합니다.

---

## 📋 **Python으로 실제 데이터 수집**

### 1단계: Python 설치 확인
```bash
python --version
```

Python이 없다면:
- https://www.python.org/downloads/ 에서 다운로드
- **"Add Python to PATH" 체크 필수!**

### 2단계: 필요한 패키지 설치
```bash
pip install nba_api pandas supabase python-dotenv
```

### 3단계: 환경 변수 설정

`.env` 파일 확인 (프로젝트 폴더에 있어야 함):
```env
SUPABASE_URL=https://obgzapfpdiiovyikvmlx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZ3phcGZwZGlpb3Z5aWt2bWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MjA3MzAsImV4cCI6MjA4NTA5NjczMH0.3IOlPLXhclK_6vo8_TXhlwDSk4x_4hqAihqqaBEZdys
```

### 4단계: Python 스크립트 실행
```bash
python fetch_nba_stats.py
```

**질문에 답변:**
1. **시즌 선택**: `2024-25` 입력 (현재 진행 중인 시즌)
2. **표시할 선수 수**: `50` 입력 (원하는 숫자)
3. **Supabase에 저장**: `y` 입력

성공하면:
```
✅ 50명의 선수 정보 저장 완료
✅ 50명의 시즌 스탯 저장 완료

🎉 Supabase 저장 완료!
```

### 5단계: 웹사이트 확인
```
https://chatbot-phi-amber-51.vercel.app
```

**F5 키로 새로고침** - 실제 2024-25 시즌 현재 데이터가 표시됩니다!

---

## 🎯 빠른 명령어 모음

```bash
# 1. Python 설치 확인
python --version

# 2. 패키지 설치
pip install nba_api pandas supabase python-dotenv

# 3. 데이터 수집 (한 줄에 실행)
echo 2024-25 && echo 50 && echo y | python fetch_nba_stats.py

# 또는 대화형으로 실행
python fetch_nba_stats.py
```

---

## ❓ 문제 해결

### Python 명령어가 작동하지 않을 때
```bash
# Python 경로 확인
where python

# py 명령어 사용
py fetch_nba_stats.py
```

### pip 설치 오류
```bash
# pip 업그레이드
python -m pip install --upgrade pip

# 패키지 재설치
python -m pip install nba_api pandas supabase python-dotenv
```

### nba_api 오류
```bash
# 최신 버전으로 설치
pip install --upgrade nba_api
```

### Supabase 연결 오류
- `.env` 파일에 `SUPABASE_URL`과 `SUPABASE_KEY` 확인
- 인터넷 연결 확인
- Supabase 대시보드에서 프로젝트 활성 상태 확인

---

## 📊 데이터 확인

Supabase 대시보드에서 확인:
```
https://supabase.com/dashboard/project/obgzapfpdiiovyikvmlx
```

**Table Editor** → **player_season_stats** 테이블 확인
- `season = '2024-25'` 데이터 확인
- `points` 컬럼으로 정렬하여 상위 득점자 확인

---

## 🔄 자동 업데이트 설정

### Vercel Cron Jobs (이미 설정됨)
- 매일 12:00 PM: 스탯 수집 (`/api/stats/collect`)
- 매일 12:30 PM: 점수 계산 (`/api/stats/calculate`)

**주의**: Cron Jobs는 외부 NBA API 키가 필요합니다!

---

## ✅ 완료 체크리스트

- [ ] Python 설치 확인
- [ ] 필요한 패키지 설치
- [ ] `.env` 파일 생성/확인
- [ ] `fetch_nba_stats.py` 실행
- [ ] 2024-25 시즌 선택
- [ ] Supabase 저장 확인 (y)
- [ ] 웹사이트에서 실제 데이터 확인

---

**이제 실제 2024-25 시즌 현재 데이터를 볼 수 있습니다!** 🏀
