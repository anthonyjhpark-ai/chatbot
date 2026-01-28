# GitHub Actions로 NBA 데이터 자동 업데이트 설정 가이드

## 🎯 개요

로컬에 Python이 없어도 GitHub Actions를 사용하여 매일 자동으로 NBA 선수 스탯을 수집하고 Supabase에 저장할 수 있습니다.

---

## 📋 **1단계: GitHub Secrets 설정**

### 1. GitHub 저장소 접속
```
https://github.com/anthonyjhpark-ai/chatbot
```

### 2. Settings > Secrets and variables > Actions 이동

**경로:**
1. 저장소 페이지에서 **"Settings"** 클릭
2. 왼쪽 메뉴에서 **"Secrets and variables"** 클릭
3. **"Actions"** 클릭

### 3. New repository secret 추가

**첫 번째 Secret:**
- **Name**: `SUPABASE_URL`
- **Value**: `https://obgzapfpdiiovyikvmlx.supabase.co`
- **"Add secret"** 클릭

**두 번째 Secret:**
- **Name**: `SUPABASE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZ3phcGZwZGlpb3Z5aWt2bWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MjA3MzAsImV4cCI6MjA4NTA5NjczMH0.3IOlPLXhclK_6vo8_TXhlwDSk4x_4hqAihqqaBEZdys`
- **"Add secret"** 클릭

---

## 📋 **2단계: 코드 푸시**

터미널에서 실행:

```bash
git add .
git commit -m "feat: add GitHub Actions for automatic NBA data updates"
git push origin main
```

---

## 📋 **3단계: GitHub Actions 확인**

### 자동 실행 확인

1. **GitHub 저장소 페이지 접속**
2. **"Actions"** 탭 클릭
3. **"NBA 데이터 자동 업데이트"** 워크플로우 확인

### 수동 실행 (테스트용)

1. **Actions** 탭에서 **"NBA 데이터 자동 업데이트"** 클릭
2. 오른쪽 **"Run workflow"** 버튼 클릭
3. **"Run workflow"** 확인
4. 실행 결과 확인 (1-2분 소요)

---

## ⏰ **자동 실행 일정**

- **실행 시간**: 매일 한국시간 새벽 6:00 AM
- **UTC 시간**: 전날 21:00 (9:00 PM)
- **실행 내용**:
  1. Python 환경 설정
  2. 필요한 패키지 설치
  3. NBA API에서 최신 데이터 수집
  4. Supabase에 자동 저장

---

## 📊 **수집되는 데이터**

- **시즌**: 2024-25 (현재 시즌)
- **선수 수**: 상위 50명 (득점순)
- **최소 경기 수**: 10경기 이상 출전
- **통계 항목**:
  - 기본: 득점, 리바운드, 어시스트, 스틸, 블록
  - 슈팅: FG%, 3점슛, FT%
  - 고급: 더블더블, 트리플더블

---

## 🔍 **실행 로그 확인**

### GitHub Actions 로그 보기

1. **Actions** 탭 클릭
2. 최근 실행된 워크플로우 클릭
3. **"update-nba-data"** 작업 클릭
4. 각 단계별 로그 확인

**성공 로그 예시:**
```
✅ 환경 변수 확인 완료
🏀 NBA 2024-25 시즌 선수 통계 가져오는 중...
✅ 50명의 선수 데이터 수집 완료
✅ 50명의 선수 정보 저장 완료
✅ 50명의 시즌 스탯 저장 완료
🎉 NBA 데이터 수집 및 저장 완료!
```

---

## ⚙️ **설정 변경**

### 실행 시간 변경

`.github/workflows/nba_update.yml` 파일에서:

```yaml
schedule:
  - cron: '0 21 * * *'  # 한국시간 새벽 6시
```

다른 시간으로 변경:
- 한국시간 정오 12시: `cron: '0 3 * * *'`
- 한국시간 오후 6시: `cron: '0 9 * * *'`
- 한국시간 자정: `cron: '0 15 * * *'`

### 수집 선수 수 변경

`fetch_data.py` 파일에서:

```python
# 상위 50명 → 100명으로 변경
df = fetch_nba_player_stats(season=CURRENT_SEASON, max_players=100)
```

---

## ❓ **문제 해결**

### Secrets가 인식되지 않을 때

1. Secret 이름이 정확한지 확인:
   - `SUPABASE_URL` (대소문자 구분)
   - `SUPABASE_KEY`
2. Secret 값에 따옴표나 공백이 없는지 확인
3. 저장소가 Private인 경우 Actions가 활성화되어 있는지 확인

### 워크플로우가 실행되지 않을 때

1. **Settings > Actions > General** 확인
2. **"Allow all actions and reusable workflows"** 선택
3. **"Read and write permissions"** 선택 (필요시)

### NBA API 오류

- NBA API가 일시적으로 응답하지 않을 수 있음
- 다음 실행 때 자동으로 재시도됨
- Actions 로그에서 오류 메시지 확인

### Supabase 연결 오류

- Supabase 프로젝트가 활성 상태인지 확인
- Secrets의 URL과 Key가 정확한지 재확인
- Supabase 대시보드에서 API 키 확인:
  ```
  https://supabase.com/dashboard/project/obgzapfpdiiovyikvmlx/settings/api
  ```

---

## ✅ **완료 체크리스트**

- [ ] GitHub Secrets 설정 (`SUPABASE_URL`, `SUPABASE_KEY`)
- [ ] 코드 푸시 (`fetch_data.py`, `.github/workflows/nba_update.yml`)
- [ ] Actions 탭에서 워크플로우 확인
- [ ] 수동으로 워크플로우 실행하여 테스트
- [ ] 실행 로그 확인 (성공 메시지)
- [ ] 웹사이트에서 데이터 확인

---

## 🎉 **완료!**

이제 매일 자동으로 NBA 데이터가 업데이트됩니다!

**웹사이트 확인:**
```
https://chatbot-phi-amber-51.vercel.app
```

**다음 자동 실행:** 내일 새벽 6시 (한국시간)

---

## 💡 **추가 팁**

### 이메일 알림 설정

GitHub에서 Actions 실패 시 자동으로 이메일이 발송됩니다.
- **Settings > Notifications** 에서 설정 가능

### 실행 기록 확인

- 최근 30일간의 모든 실행 기록이 Actions 탭에 저장됨
- 각 실행의 로그를 다운로드할 수 있음

### 비용

- **GitHub Actions**: Public 저장소는 무료
- **Supabase**: Free tier 사용 중
- **총 비용**: 0원! 🎉
