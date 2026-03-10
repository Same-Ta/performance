# ProofWork — 자율 성과 증명 및 관리 솔루션

> On-Device AI + Firebase 기반 프라이버시 우선 성과 관리 플랫폼

## 🎯 개요

ProofWork는 직원의 업무 활동을 **로컬에서 자동 추적**하고, AI로 분석하여 **객관적인 성과 지표**를 생성하는 솔루션입니다. 

- ✅ **프라이버시 우선**: 모든 데이터는 사용자 PC에서 처리, 승인 후에만 전송
- ✅ **자동화**: Windows 활동 자동 추적, 수동 입력 불필요
- ✅ **AI 분석**: Gemini 2.0 Flash로 업무 패턴 분석 및 인사이트 제공
- ✅ **실시간 대시보드**: 직원/매니저별 맞춤 대시보드

## 📦 아키텍처

```
Frontend (Vercel)      Backend (Firebase)      On-Device Agent (.exe)
      ↓                        ↓                         ↓
React + Vite           Cloud Functions            Python Flask
  + Tailwind              + Firestore               + Windows API
  + Chart.js              + Auth                    + PyInstaller
```

### 배포 구조

| 컴포넌트 | 플랫폼 | URL |
|---------|-------|-----|
| **Frontend** | Vercel | https://performance-one-plum.vercel.app |
| **Backend API** | Firebase Functions | asia-northeast3-performance-fefc0.cloudfunctions.net |
| **Database** | Firestore | Firebase 콘솔 |
| **On-Device Agent** | 사용자 PC (.exe) | localhost:5001 |

## 🚀 빠른 시작

### 1. Frontend 로컬 실행

```powershell
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### 2. Backend (Firebase Functions) 에뮬레이터

```powershell
cd backend
npm install
firebase emulators:start --only functions
# http://localhost:5003
```

### 3. On-Device Agent 실행

```powershell
cd on-device-agent
pip install -r requirements.txt
python server.py
# http://localhost:5001
```

## 📚 프로젝트 구조

```
ProofWork/
├── frontend/              # React 프론트엔드 (Vercel)
│   ├── src/
│   │   ├── components/    # UI 컴포넌트
│   │   ├── pages/         # 라우트별 페이지
│   │   ├── services/      # API 서비스
│   │   └── hooks/         # 커스텀 훅
│   └── package.json
│
├── backend/               # Firebase 백엔드
│   ├── functions/         # Cloud Functions
│   │   └── src/index.ts   # 6개 함수
│   ├── firestore.rules    # 보안 규칙
│   └── firebase.json
│
├── on-device-agent/       # Python 에이전트 (.exe)
│   ├── server.py          # Flask HTTP 서버
│   ├── tracker.py         # Windows 활동 추적
│   ├── metrics_engine.py  # 메트릭 계산
│   ├── build_exe.py       # 실행파일 빌드
│   └── agent.spec         # PyInstaller 설정
│
└── docs/
    ├── ARCHITECTURE.md    # 상세 아키텍처
    ├── DEPLOYMENT.md      # 배포 가이드
    └── PROJECT_REVIEW.md  # 프로젝트 리뷰
```

## 🔧 기술 스택

### Frontend
- **Framework**: React 18 + Vite 6.4
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **차트**: Chart.js + react-chartjs-2
- **상태 관리**: Context API
- **라우팅**: React Router v7

### Backend
- **런타임**: Node.js 20 (Firebase Functions v2)
- **언어**: TypeScript
- **데이터베이스**: Firestore
- **인증**: Firebase Auth (Google, Email)
- **AI**: Gemini 2.0 Flash (Google AI Studio)

### On-Device Agent
- **언어**: Python 3.11
- **서버**: Flask 3.0 + flask-cors
- **추적**: pywin32 (Windows API)
- **스크린**: mss (선택적)
- **빌드**: PyInstaller (→ .exe)

## 📥 배포

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Git push → 자동 배포
```

### Backend (Firebase Functions)

```powershell
cd backend
firebase deploy --only functions
```

### On-Device Agent (.exe)

```powershell
cd on-device-agent
python build_exe.py
# dist/ProofWorkAgent.exe 생성
# GitHub Releases에 업로드
```

자세한 배포 가이드는 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) 참고

## 🔐 환경 변수

### Frontend (`.env`)

```env
VITE_FIREBASE_API_KEY=<Firebase API Key>
VITE_FIREBASE_AUTH_DOMAIN=performance-fefc0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=performance-fefc0
VITE_GEMINI_API_KEY=<Gemini API Key>
VITE_AGENT_API_URL=http://localhost:5001
```

### Backend (Firebase Functions)

환경 변수는 Firebase 콘솔에서 관리:
- Notion API Key
- Jira/Slack Webhook URL

### On-Device Agent

환경 변수 없음 (로컬 실행만)

## 📊 주요 기능

### 직원 대시보드
- ✅ 실시간 활동 추적 (시작/정지)
- ✅ 일일/주간/월간 성과 차트
- ✅ 딥 포커스 타임 분석
- ✅ 카테고리별 시간 분포
- ✅ 데이터 리뷰 및 승인
- ✅ 보상 센터 (게이미피케이션)

### 매니저 대시보드
- ✅ 팀 전체 성과 개요
- ✅ 구성원별 비교 분석
- ✅ 병목 구간 자동 감지
- ✅ AI 기반 성과 리포트 생성
- ✅ Notion 태스크 연동
- ✅ Jira/Slack 웹훅

### On-Device Agent
- ✅ Windows 활성 창 추적
- ✅ 카테고리 자동 분류 (개발/문서/커뮤니케이션 등)
- ✅ 딥 포커스 구간 탐지 (20분+ 무중단)
- ✅ 컨텍스트 전환 횟수 계산
- ✅ PII 자동 제거 (프라이버시)
- ✅ 사용자 승인 후에만 업로드

## 🧮 성과 스코어링

```
종합 점수 = 산출물(30%) + 효율성(25%) + 몰입도(25%) + 목표정렬도(20%)
```

### 몰입도 (Focus Score)
- 컨텍스트 전환율 (낮을수록 좋음)
- 딥 포커스 비율 (높을수록 좋음)
- 입력 밀도 (적정 수준)

### 효율성 (Efficiency Score)
- 시간 대비 산출물 비율
- 작업 완료 속도
- 리소스 활용도

### 목표정렬도 (Goal Alignment Score)
- Notion 태스크 완료율
- 목표 카테고리 시간 비중
- 우선순위 작업 집중도

## 🎮 보상 시스템

| 티어 | 점수 | 혜택 |
|------|------|------|
| 🔰 탐험가 | 0-59 | 기본 |
| 🏆 성취자 | 60-74 | 배지 + 월간 리포트 |
| 💎 전문가 | 75-84 | + 팀 대시보드 우선 표시 |
| 👑 마스터 | 85-94 | + AI 코칭 |
| 🌟 레전드 | 95-100 | + 특별 리워드 |

## 🔒 프라이버시

- **로컬 우선**: 모든 추적 데이터는 사용자 PC에서만 처리
- **승인 기반**: 사용자가 리뷰 후 승인한 데이터만 업로드
- **자동 마스킹**: 이메일, 전화번호, 민감 키워드 자동 제거
- **즉시 삭제**: 프레임 처리 후 메모리 제로화
- **투명성**: 모든 데이터 수집/전송 로그 제공

## 📖 문서

- [아키텍처 상세](docs/ARCHITECTURE.md)
- [배포 가이드](docs/DEPLOYMENT.md)
- [프로젝트 리뷰](docs/PROJECT_REVIEW.md)

## 🤝 기여

이 프로젝트는 MVP(Minimum Viable Product) 단계입니다. 

## 📄 라이선스

Private Repository (All Rights Reserved)

## 👥 팀

**ProofWork Team** — 성과 증명의 새로운 기준

---

**제작**: MVP 개발 세션 (2026년 3월)
