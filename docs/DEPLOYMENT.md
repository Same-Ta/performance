# ProofWork - 배포 가이드

## 배포 아키텍처

```
Frontend (Vercel) ←→ Backend (Firebase Functions) ←→ Firestore
                     ↓
            On-Device Agent (.exe)
            사용자 PC에서 실행
```

## 1. Frontend 배포 (Vercel)

### 자동 배포 (권장)

1. **GitHub 연동**
   - Vercel 대시보드에서 GitHub 저장소 연결
   - `main` 브랜치 푸시 시 자동 배포

2. **환경 변수 설정** (Vercel 대시보드)
   ```
   VITE_FIREBASE_API_KEY=AIzaSyCpiD11mXBsoOooAZ44Qf5fqoHHtyKO4nw
   VITE_FIREBASE_AUTH_DOMAIN=performance-fefc0.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=performance-fefc0
   VITE_FIREBASE_STORAGE_BUCKET=performance-fefc0.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=298365900297
   VITE_FIREBASE_APP_ID=1:298365900297:web:7e472d9bd52e42ef524ad8
   VITE_FIREBASE_MEASUREMENT_ID=G-L6GY46M5KX
   VITE_GEMINI_API_KEY=AIzaSyC1mgXjUqEfXzNJ-_D0Fcq0bh_pRLf1glk
   VITE_AGENT_API_URL=http://localhost:5001
   ```

3. **빌드 설정**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 수동 배포

```bash
cd frontend
npm run build
npx vercel --prod
```

**배포 URL**: https://performance-one-plum.vercel.app

---

## 2. Backend 배포 (Firebase Functions)

### 사전 요구사항

- Node.js 20+ (Functions v2)
- Firebase CLI: `npm install -g firebase-tools`
- Firebase 프로젝트: `performance-fefc0`

### 배포 단계

1. **Firebase 로그인**
   ```powershell
   firebase login
   ```

2. **Functions 빌드**
   ```powershell
   cd backend/functions
   npm run build
   ```

3. **배포**
   ```powershell
   cd backend
   firebase deploy --only functions
   ```

4. **특정 함수만 배포**
   ```powershell
   firebase deploy --only functions:notionProxy
   ```

### Functions 목록

| 함수명 | 트리거 | 설명 |
|--------|--------|------|
| `onPerformanceSubmit` | Firestore Write | 성과 제출 시 팀 집계 |
| `aggregateTeamDashboard` | HTTP Schedule | 팀 대시보드 갱신 |
| `syncJira` | HTTP | Jira 웹훅 |
| `sendSlackNotification` | HTTP | Slack 알림 |
| `mapMetricsToGoals` | HTTP | 목표 매핑 |
| `notionProxy` | HTTP | Notion API 프록시 |

### CORS 설정 확인

Firebase Functions의 CORS 허용 도메인:
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://performance-fefc0.web.app',
  'https://performance-fefc0.firebaseapp.com',
  'https://performance-one-plum.vercel.app'
];
```

---

## 3. On-Device Agent 배포 (.exe 파일)

### 빌드 프로세스

1. **환경 준비**
   ```powershell
   cd on-device-agent
   pip install -r requirements.txt
   pip install pyinstaller
   ```

2. **실행파일 빌드**
   ```powershell
   python build_exe.py
   ```

3. **결과물**
   ```
   dist/
   └── ProofWorkAgent.exe  (약 70-100MB)
   ```

### 배포 방법

#### Option 1: GitHub Releases (권장)

1. **Release 생성**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **GitHub에서 Release 생성**
   - https://github.com/your-repo/releases/new
   - Tag: `v1.0.0`
   - Title: `ProofWork Agent v1.0.0`
   - Attach: `dist/ProofWorkAgent.exe`

3. **사용자 다운로드**
   - GitHub Releases 페이지에서 .exe 다운로드
   - 바로 실행 (Python 설치 불필요)

#### Option 2: 직접 배포

1. `dist/` 폴더 전체를 zip으로 압축
2. 웹사이트 또는 파일 공유 서비스에 업로드
3. 사용자 가이드 제공

### 사용자 실행 가이드

```
1. ProofWorkAgent.exe 다운로드
2. .exe 더블클릭 실행
3. Flask 서버 자동 시작 (localhost:5001)
4. 웹 대시보드(Vercel)에서 로그인
5. [추적 시작] 버튼 클릭
```

### 시스템 요구사항

- **OS**: Windows 10/11 (64-bit)
- **RAM**: 최소 4GB
- **디스크**: 200MB 여유 공간
- **권한**: 관리자 권한 불필요

### 주의사항

⚠️ **Windows 전용**: 현재 버전은 Windows API(`ctypes.wintypes`)를 사용하므로 Windows에서만 작동합니다.

**macOS/Linux 지원 계획**:
- macOS: `PyObjC` 사용 (활성 창 추적)
- Linux: `python-xlib` 사용
- 빌드: PyInstaller의 `--target-os` 옵션

---

## 4. 통합 배포 체크리스트

### 배포 전

- [ ] Frontend `.env` 파일 환경 변수 확인
- [ ] Firebase Functions CORS 설정 확인
- [ ] Firestore 보안 규칙 배포
- [ ] Gemini API 키 유효성 확인
- [ ] On-Device Agent 로컬 테스트

### 배포

- [ ] Frontend: Vercel에 Git push
- [ ] Backend: `firebase deploy --only functions`
- [ ] Agent: `python build_exe.py` → GitHub Releases 업로드

### 배포 후

- [ ] Frontend 접속 테스트 (https://performance-one-plum.vercel.app)
- [ ] 로그인 기능 테스트
- [ ] Agent .exe 다운로드 및 실행 테스트
- [ ] 추적 시작 → 데이터 업로드 확인
- [ ] Firebase Functions 로그 확인

---

## 5. 롤백 전략

### Frontend (Vercel)

```bash
# Vercel 대시보드에서 이전 배포 선택 → Promote to Production
# 또는
git revert HEAD
git push
```

### Backend (Firebase Functions)

Firebase Functions는 버전 관리가 자동으로 되므로, 콘솔에서 이전 버전으로 롤백 가능합니다.

```bash
# 또는 이전 코드로 재배포
git checkout <previous-commit>
cd backend
firebase deploy --only functions
```

### On-Device Agent

- 이전 버전 .exe를 GitHub Releases에 보관
- 사용자에게 이전 버전 다운로드 링크 제공

---

## 6. 모니터링

### Firebase Console

- **Functions 로그**: https://console.firebase.google.com/project/performance-fefc0/functions/logs
- **Firestore 데이터**: https://console.firebase.google.com/project/performance-fefc0/firestore
- **Auth 사용자**: https://console.firebase.google.com/project/performance-fefc0/authentication

### Vercel Dashboard

- **배포 로그**: https://vercel.com/dashboard
- **Analytics**: 트래픽 및 성능 모니터링

### On-Device Agent

- 로컬 로그: `~/.proofwork/agent.log`
- Flask 콘솔 출력

---

## 7. 비용 예측

| 서비스 | 무료 Tier | 예상 비용 (월) |
|--------|-----------|---------------|
| Vercel | 100GB 대역폭, 무제한 요청 | $0 |
| Firebase Functions | 125K 호출, 40K GB-초 | $0 (초반) |
| Firebase Firestore | 1GB 저장, 50K 읽기, 20K 쓰기 | $0 (초반) |
| Firebase Auth | 무제한 (Email/Google) | $0 |
| Gemini API | 1500 요청/일 (무료 tier) | $0 |

**총 예상 비용**: **$0/월** (MVP 단계, 사용자 100명 이하)

---

## 문제 해결

### Frontend가 Firebase에 연결되지 않음

1. `.env` 파일 확인
2. Vercel 환경 변수 확인
3. Firebase 프로젝트 ID 일치 확인

### Functions CORS 오류

```typescript
// backend/functions/src/index.ts
const allowedOrigins = [/* Vercel URL 추가 */];
```

### Agent .exe 실행 오류

- Windows Defender가 차단하는 경우: "추가 정보" → "실행"
- 서명되지 않은 실행파일 경고: 코드 서명 인증서 구매 필요 ($200-500/년)

### Agent가 데이터를 업로드하지 못함

1. Firebase 프로젝트 ID 확인
2. 네트워크 방화벽 확인
3. `firebase_client.py`의 Admin SDK 인증 확인

### 1. Render에서 새 Web Service 생성

1. [Render Dashboard](https://dashboard.render.com/) 접속
2. **New +** → **Web Service** 선택
3. GitHub 저장소 연결

### 2. 배포 설정

#### Build & Deploy Settings:
- **Name**: `proofwork-agent` (또는 원하는 이름)
- **Region**: `Oregon (US West)` (권장)
- **Branch**: `main` (또는 `master`)
- **Root Directory**: 비워둠 (프로젝트 루트)
- **Runtime**: `Python 3`
- **Build Command**: 
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**: 
  ```bash
  python on-device-agent/server.py
  ```

#### Environment Variables:
```
PYTHONIOENCODING=utf-8
PYTHONUTF8=1
```

#### Plan:
- **Free** (개발/테스트용)
- **Starter** (프로덕션용)

### 3. 배포 URL 확인

배포 완료 후 다음 형식의 URL이 생성됩니다:
```
https://proofwork-agent.onrender.com
또는
https://performance-65sc.onrender.com
```

이 URL을 프론트엔드 `.env` 파일의 `VITE_AGENT_API_URL`에 설정하세요.

### 4. 주의사항

⚠️ **Windows 전용 기능 제한**
- `pywin32` (활성 창 추적)는 Linux에서 작동하지 않습니다
- Render는 Linux 환경이므로 Windows 전용 기능(활성 창 추적, 시스템 트레이 등)은 비활성화됩니다
- 스크린 캡처 및 기본 API 엔드포인트는 정상 작동합니다

⚠️ **Free Tier 제한**
- 15분간 요청이 없으면 자동으로 sleep 모드 진입
- 첫 요청 시 cold start로 30초~1분 소요

### 5. 로그 확인

Render Dashboard → 해당 서비스 → **Logs** 탭에서 실시간 로그 확인 가능

### 6. 헬스 체크 엔드포인트

```
GET https://your-app.onrender.com/health
```

정상 응답:
```json
{
  "ok": true,
  "running": false
}
```

---

## 문제 해결

### requirements.txt를 찾지 못하는 경우
✅ 이미 해결됨 - 프로젝트 루트에 `requirements.txt` 추가

### Port 바인딩 오류
✅ 이미 해결됨 - `server.py`가 환경변수 `PORT` 사용하도록 수정

### pywin32 설치 실패
✅ 이미 해결됨 - `requirements.txt`에 Windows 전용으로 조건부 설치

### CORS 오류
✅ 이미 해결됨 - Vercel URL이 허용 목록에 추가됨
