# 🏀 NBA 스탯 대시보드 - Supabase 설정 가이드

## ⚠️ 현재 상태
웹사이트는 배포되었지만, Supabase 데이터베이스에 테이블이 없어서 데이터를 표시할 수 없습니다.

---

## 📋 **1단계: Supabase 대시보드 접속**

1. 브라우저에서 다음 링크 열기:
   ```
   https://supabase.com/dashboard/project/obgzapfpdiiovyikvmlx
   ```

2. 로그인이 필요하면 로그인하세요.

---

## 📋 **2단계: SQL Editor 열기**

1. 왼쪽 메뉴에서 **"SQL Editor"** 클릭
2. 우측 상단 **"New query"** 버튼 클릭

---

## 📋 **3단계: 스키마 SQL 복사 & 실행**

1. 아래 프로젝트 폴더에서 파일 열기:
   ```
   supabase/nba-schema.sql
   ```

2. **전체 내용을 복사** (Ctrl+A, Ctrl+C)

3. Supabase SQL Editor에 **붙여넣기** (Ctrl+V)

4. 우측 하단 **"Run"** 버튼 클릭 (또는 Ctrl+Enter)

5. 성공 메시지 확인:
   ```
   Success. No rows returned
   ```

---

## 📋 **4단계: 샘플 데이터 삽입**

터미널(PowerShell)에서 실행:

```bash
node insert_sample_data.js
```

성공하면 다음과 같은 메시지가 표시됩니다:

```
✅ 10명의 선수 삽입 완료!
✅ 10명의 시즌 스탯 삽입 완료!

📊 삽입된 선수 목록:
================================================================================
 1. Joel Embiid                | PHI   |  33.1 PPG
 2. Giannis Antetokounmpo      | MIL   |  30.4 PPG
 3. Stephen Curry              | GSW   |  29.8 PPG
...
```

---

## 📋 **5단계: 웹사이트 확인**

브라우저에서 웹사이트 열기:

```
https://chatbot-phi-amber-51.vercel.app
```

**F5 키로 새로고침** 하면 10명의 NBA 선수 데이터가 표시됩니다! 🎉

---

## 🎯 완료 체크리스트

- [ ] Supabase 대시보드 접속
- [ ] SQL Editor에서 nba-schema.sql 실행
- [ ] `node insert_sample_data.js` 실행
- [ ] 웹사이트에서 선수 데이터 확인

---

## ❓ 문제 해결

### Node.js 오류가 발생하는 경우
```bash
# Node.js 버전 확인
node --version

# 24.x 이상이어야 합니다
```

### SQL 실행 오류가 발생하는 경우
- Supabase 프로젝트가 활성화되어 있는지 확인
- 인터넷 연결 확인
- 브라우저 새로고침 후 다시 시도

### 웹사이트에 데이터가 안 나오는 경우
1. 브라우저 F12 → Console 탭에서 에러 확인
2. 웹사이트 강력 새로고침 (Ctrl+Shift+R)
3. `node insert_sample_data.js` 다시 실행

---

## 🚀 다음 단계

### 실제 NBA 데이터 수집 (Python)

1. **Python 설치**
   - https://www.python.org/downloads/
   - "Add Python to PATH" 체크 필수!

2. **패키지 설치**
   ```bash
   pip install nba_api pandas supabase python-dotenv
   ```

3. **데이터 수집**
   ```bash
   python fetch_nba_stats.py
   ```

---

## 📞 도움이 필요하신가요?

위 단계를 따라하다가 막히는 부분이 있으면 알려주세요!
