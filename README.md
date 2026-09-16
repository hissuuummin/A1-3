# ✨ TripSpark (트립스파크)
> **AI 기반 맞춤형 여행 코스 & 경비 플래너 웹 서비스**  
> 사용자의 취향, 동행자, 기간, 예산에 맞춰 최적의 시간대별 여행 일정과 예상 지출을 30초 만에 설계합니다.

![TripSpark Banner](https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80)

---

## 🔗 배포 및 서비스 접속 (Live Demo)

- **배포 URL**: `https://your-tripspark-project.vercel.app` *(Vercel 배포 후 생성된 URL을 입력하세요)*
- **GitHub 저장소**: `https://github.com/your-username/tripspark`

---

## 📖 1. 프로젝트 소개

**TripSpark**는 수많은 블로그 검색과 복잡한 이동 동선 고민에 지친 여행자들을 위한 **스마트 AI 여행 컨시어지 웹 서비스**입니다.  
프론트엔드는 가볍고 빠른 순수 웹 표준(Vanilla HTML5 / CSS3 / JavaScript)으로 구현되었으며, 백엔드는 **Vercel Serverless Functions (Python 3.9+)** 환경에서 AI API를 안전하게 호출하여 최적의 여행 일정을 생성합니다.

### 🌟 핵심 기능
1. **맞춤형 여행 일정 생성**:
   - 목적지, 기간(당일~3박4일), 동행자(혼자/연인/친구/가족), 테마(힐링, 맛집, 카페 등), 예산 범위를 고려한 지능형 코스 추천
2. **시간대별 타임라인 & 여행 팁**:
   - 오전, 점심, 오후, 저녁, 숙소로 이어지는 현실적인 이동 동선 및 방문 팁 제공
3. **예산 지출 분석 & 짐 싸기 체크리스트**:
   - 교통, 식비, 숙소, 체험비 예상 비율 분석 및 인터랙티브 체크리스트 제공
4. **결과 보관 및 공유 편의 기능**:
   - 원클릭 전체 일정 클립보드 복사
   - 브라우저 로컬 스토리지(`localStorage`) 기반 **내 보관함** 저장 및 재열람
   - 인쇄 및 PDF 저장 지원
5. **다크 모드 & 반응형 UI (보너스 과제)**:
   - 모바일, 태블릿, 데스크톱 완벽 지원
   - 시스템 테마 감지 및 원클릭 라이트/다크 테마 토글

---

## 🛠️ 2. 기술 스택 (Tech Stack)

### Frontend
- **HTML5**: 웹 접근성과 검색 엔진 최적화(SEO)를 고려한 시맨틱 마크업
- **CSS3**: CSS Custom Properties(변수), Flexbox, CSS Grid, 미디어 쿼리(반응형), 다크 모드
- **Vanilla JavaScript (ES6+)**: `async/await`, Fetch API, `AbortController`(타임아웃 제어), LocalStorage API *(React, Vue 등 프레임워크 미사용)*

### Backend (Serverless)
- **Vercel Serverless Functions**: `Python 3.9+` 기반 `http.server.BaseHTTPRequestHandler` 경량 엔드포인트
- **AI Model Integration**: OpenAI Chat Completion API (`gpt-4o-mini`) 및 Google Gemini API 지원
- **Fallback Simulation Engine**: API 키 미설정 또는 개발 환경에서도 안전하게 전체 플로우를 확인할 수 있는 스마트 시뮬레이션 모드 탑재

---

## 📂 3. 프로젝트 디렉토리 구조

```
tripspark/
├── index.html                 # 메인 화면 (시맨틱 SPA 레이아웃)
├── dev_server.py              # 로컬 풀스택 통합 테스트 서버 (Python 내장)
├── requirements.txt           # Python 백엔드 의존성
├── vercel.json                # Vercel 서버리스 라우팅 설정
├── .gitignore                 # 보안 키 및 캐시 파일 형상관리 제외
├── .env.example               # 환경 변수 설정 템플릿
├── css/
│   ├── style.css              # 메인 스타일, 반응형 미디어 쿼리, 애니메이션
│   └── dark-mode.css          # 다크 모드 전용 테마 스타일
├── js/
│   ├── app.js                 # UI 이벤트 바인딩, 폼 인터랙션, 모달 제어
│   ├── api.js                 # 백엔드 API 통신, 입력 검증, 타임아웃/에러 처리
│   └── storage.js             # LocalStorage 기반 테마 및 일정 보관함 관리
├── api/
│   └── generate.py            # Vercel Serverless Python 함수 (AI 엔드포인트)
└── docs/
    ├── SERVICE_PLAN.md        # 서비스 기획서 (제출 필수 문서)
    └── SUBMISSION_GUIDE.md    # 스크린샷 캡처 및 과제 제출 안내서
```

---

## 💻 4. 로컬 실행 방법 (Local Development)

외부 패키지 설치 없이 Python만 설치되어 있으면 로컬에서 정적 화면과 백엔드 API를 한 번에 실행할 수 있습니다.

### 1) 저장소 클론 및 이동
```bash
git clone https://github.com/your-username/tripspark.git
cd tripspark
```

### 2) 환경 변수 설정 (선택 사항)
`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 본인의 API 키를 입력합니다.
*(키를 입력하지 않아도 스마트 시뮬레이션 모드로 정상 동작합니다)*
```bash
cp .env.example .env
```
`.env` 내용 예시:
```env
OPENAI_API_KEY=sk-proj-xxxx...
```

### 3) 로컬 통합 서버 실행
```bash
python dev_server.py
```
서버가 구동되면 웹 브라우저에서 **`http://localhost:3000`** 으로 접속합니다.

---

## 🚀 5. Vercel 배포 및 환경 변수 설정 방법

### 1단계: GitHub 저장소 업로드
```bash
git add .
git commit -m "feat: complete TripSpark AI web service"
git branch -M main
git remote add origin https://github.com/본인계정/저장소이름.git
git push -u origin main
```

### 2단계: Vercel 프로젝트 생성 및 임포트
1. [Vercel 대시보드](https://vercel.com)에 로그인합니다.
2. **`Add New...`** → **`Project`**를 클릭합니다.
3. 방금 푸시한 GitHub 저장소를 찾아 **`Import`**를 누릅니다.

### 3단계: 환경 변수(Environment Variables) 등록 (중요 🔐)
1. Vercel 설정 화면의 **`Environment Variables`** 섹션을 펼칩니다.
2. 아래 항목을 입력하고 **`Add`** 버튼을 클릭합니다:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: 본인의 OpenAI API 키 (`sk-...`)
   *(또는 Google Gemini 사용 시 Key: `GEMINI_API_KEY` 입력)*
3. **`Deploy`** 버튼을 누르면 약 1분 이내에 글로벌 배포가 완료됩니다.

> ⚠️ **보안 주의사항**:
> - API 키는 절대 깃허브 커밋(코드, README, 이슈 등)에 올리지 마세요.
> - 본 프로젝트는 `.gitignore`에 `.env`가 등록되어 있어 실수로 유출되는 것을 원천 방지합니다.

---

## 🛡️ 6. AI UX 및 에러 핸들링 원리

본 프로젝트는 미션의 AI UX 요구사항(실패 처리)을 엄격하게 준수합니다.

1. **빈 입력(필수값 누락) 방지**:
   - 목적지 미입력 상태로 제출 시 클라이언트에서 즉시 감지하여 붉은색 알림 배너와 입력창 포커스를 제공합니다.
2. **지연 및 타임아웃 UX 대응**:
   - 4초 이상 응답이 지연될 경우 안내 문구(`⏳ 응답까지 약 5~15초 소요될 수 있습니다`)가 표시됩니다.
   - 30초 이상 응답이 없을 경우 `AbortController`가 자동으로 연결을 중단하고 재시도 안내를 표시합니다.
3. **API 오류(4xx/5xx) 처리**:
   - 호출 한도 초과(429), 키 오류(401), 서버 내부 장애(500/502) 발생 시 친절한 한국어 안내 메시지를 출력합니다.
4. **키 미설정 Fallback**:
   - API 키가 아직 등록되지 않은 상태에서도 사이트가 멈추지 않고 스마트 시뮬레이션 데이터를 제공하여 끊김 없는 사용자 경험을 보장합니다.

---

## 📄 7. 과제 제출 증빙 문서

- 상세 서비스 기획서: [docs/SERVICE_PLAN.md](docs/SERVICE_PLAN.md)
- 증빙 자료 가이드 (스크린샷 및 대화 로그): [docs/SUBMISSION_GUIDE.md](docs/SUBMISSION_GUIDE.md)

---

## 📜 8. 라이선스 및 저작권
© 2026 TripSpark Team. All rights reserved.