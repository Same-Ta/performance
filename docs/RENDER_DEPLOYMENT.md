# ProofWork - Render 배포 가이드

## On-Device Agent 백엔드 배포 (Render)

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
