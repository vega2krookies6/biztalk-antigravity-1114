# 업무 말투 변환기 (BizTalk) — AGENTS.md

> 본 문서는 **업무 말투 변환기(`biztalk_antigravity`)** 프로젝트를 개발·유지보수할 때 **Google Antigravity 에이전트**가 반드시 숙지하고 준수해야 하는 프로젝트 개요, 기술 사양 및 행동 규칙입니다.

---

## 1. 프로젝트 개요 (Project Overview)

- **프로젝트명**: 업무 말투 변환기 (`biztalk_antigravity`)
- **프로젝트 목적**: 사용자가 작성한 일상적인 구어체 및 거친 초안 텍스트를, 업무 수신 대상(상사, 타팀 동료, 고객, 팀 동료)에 맞는 격식 있고 정중한 비즈니스 커뮤니케이션 언어로 자동 변환해 주는 원데이(One Day) 웹 서비스입니다.
- **핵심 개발 철학**: 
  - **"완벽한 서비스"가 아니라 "작동하는 서비스"**를 빠르게 구현하고 완성합니다.
  - 불필요한 기능 확장이나 복잡한 아키텍처를 지양하고 PRD의 완료 체크리스트를 100% 충족하는 데 집중합니다.

---

## 2. 기능 범위 및 명세 (Scope & Specifications)

### 2.1. 구현 대상 (In-Scope)
- **F-01 텍스트 입력**: 원문 텍스트 자유 입력 (최소 1자 이상)
- **F-02 수신 대상 선택 (4종)**:
  - `boss`: 상사 / 임원 (격식 있는 공손한 경어체)
  - `colleague`: 타팀 동료 (정중하고 협조적인 업무 어조)
  - `client`: 고객 / 외부 (친절하고 신뢰감을 주는 서비스 어조)
  - `team`: 팀 내 동료 (간결하고 실무적인 어조)
- **F-03 AI 말투 변환 처리**: FastAPI → LangChain (`langchain-upstage`) → Upstage Solar-Pro4 모델 호출
- **F-04 결과 출력 및 복사 (F-06)**: 변환 텍스트 출력 및 원클릭 클립보드 복사
- **F-05 처리 상태 표시**: 변환 요청 중 로딩 인디케이터 표시
- **서버 기본 기능**: `/health` 헬스체크 엔드포인트, Swagger UI (`/docs`), 정적 페이지 서빙

### 2.2. 제외 대상 (Out-of-Scope — 절대 임의 추가 금지)
- ❌ 로그인 / 회원 가입 및 인증(Auth) 기능
- ❌ 데이터베이스(DB) 연동 및 변환 이력(History) 저장
- ❌ 복잡한 상태 관리 라이브러리 및 프론트엔드 프레임워크(React, Vue 등) 도입
- ❌ 과도한 에러 재시도 복합 로직

---

## 3. 기술 스택 (Tech Stack)

| 구분 | 기술 스택 | 설명 / 라이브러리 |
| :--- | :--- | :--- |
| **Backend** | Python 3.11+ | FastAPI, Uvicorn, Pydantic, python-dotenv |
| **AI / LLM** | Upstage Solar-Pro4 | `langchain`, `langchain-upstage` |
| **Frontend** | Vanilla Web | HTML5, CSS3, JavaScript (ES6+, No Framework) |
| **인프라 & 배포** | Git, Vercel | GitHub 리포지토리 연동, Vercel 풀스택 배포 |
| **MCP 도구** | Context7, Playwright, GitHub | 최신 패키지/문서 검색, E2E/브라우저 테스트, Git 제어 |

---

## 4. 표준 디렉토리 구조 (Directory Structure)

에이전트는 프로젝트 파일 생성 및 수정 시 아래 표준 구조를 반드시 준수해야 합니다.

```
biztalk_antigravity/
├── AGENTS.md                  # 본 에이전트 지침서
├── PRD_업무말투변환기.md          # 상세 제품 요구사항 명세서
├── 개요서_업무말투변환기.md        # 프로젝트 개요서
├── .env                       # API Key 등 환경 변수 (★절대 열람·출력·수정 금지)
├── .gitignore                 # .env, __pycache__, .venv 등 제외
├── .venv/                     # Python 가상환경
├── backend/
│   ├── main.py                # FastAPI 앱 초기화, CORS, 라우터 등록
│   ├── requirements.txt       # 백엔드 의존성 (context7 활용 최신 버전 명시)
│   ├── routers/
│   │   └── convert.py         # POST /api/convert 라우터
│   ├── services/
│   │   └── tone_converter.py  # LangChain + Upstage Solar-Pro4 연동 로직
│   ├── prompts/
│   │   └── templates.py       # 수신 대상별 프롬프트 템플릿
│   └── models/
│       └── schemas.py         # Pydantic 요청(ConvertRequest) / 응답(ConvertResponse)
└── frontend/
    ├── index.html             # 메인 사용자 UI
    ├── css/
    │   └── style.css          # UI 스타일시트 (frontend-design 스킬 준수)
    └── js/
        └── app.js             # API 연동, 버튼 이벤트, 클립보드 복사 로직
```

---

## 5. Antigravity 핵심 개발 원칙 (Agent Behavioral Rules)

Antigravity는 본 프로젝트를 수행할 때 아래 원칙을 **절대적 우선순위**로 적용합니다.

### 5.1. 바이브 코딩 3원칙
1. **완료 기준을 먼저 정의하라 (체크리스트 기반 실행)**:
   - PRD의 완료 체크리스트 항목만 구현합니다.
   - 요청받지 않은 기능을 임의로 추가하거나 아키텍처를 과도하게 확장하지 않습니다.
2. **조사 먼저, 구현 나중 (Investigation First)**:
   - Upstage 연동 및 최신 패키지 버전 설정 시, 추측해서 코드를 작성하지 말고 MCP `context7` 또는 공식 문서를 먼저 조회하여 확인 후 구현합니다.
3. **버그는 분석 먼저, 수정 나중 (Root-Cause Analysis)**:
   - 오류 발생 시 에러 메시지만 보고 코드를 마구잡이로 수정(코드 누더기화)하지 않습니다.
   - 발생 원인을 먼저 정확히 사용자에게 설명하고, 영향 범위를 파악한 후 최소한의 외과적 수정을 진행합니다.

### 5.2. Karpathy 코딩 가이드라인 준수
- **Think Before Coding**: 요구사항이 모호할 경우 임의로 넘겨짚지 않고 사용자에게 선택지를 제시하고 확인합니다.
- **Simplicity First**: 50줄로 해결 가능한 코드를 200줄로 늘리지 않습니다. 1회성 사용 로직에 불필요한 추상화 레이어를 만들지 않습니다.
- **Surgical Changes**: 변경이 요청된 범위만 정밀하게 수정하며, 멀쩡히 동작하는 인접 코드나 무관한 주석을 임의로 리팩토링하지 않습니다.
- **Goal-Driven Execution**: 모든 단계마다 구체적인 검증 기준(Test/Verify)을 세우고, 동작 검증이 완료된 후 다음 단계로 이동합니다.

### 5.3. 프론트엔드 디자인 원칙 (`frontend-design` 스킬)
- AI가 생성한 흔한 템플릿(지나치게 둥근 카드, 불필요한 올캡스 라벨, 천편일률적인 그라데이션)을 지양합니다.
- 비즈니스 업무 도구로서의 **신뢰감, 가독성, 직관적인 사용성**에 초점을 맞춘 타이포그래피와 레이아웃을 구성합니다.

---

## 6. 절대 금지 규칙 (Hard Constraints — Never Do)

1. **`.env` 파일 접근 절대 금지**:
   - `.env`, `.env.*` 파일의 내용을 화면에 출력하거나 `read_file`로 열람/수정하지 않습니다.
   - API 키 및 비밀 값은 항상 환경 변수를 통해 간접 로드합니다.
2. **파괴적 Git 명령어 금지**:
   - `git push --force`, `git reset --hard`, `git clean -fd` 등을 실행하지 않습니다.
3. **무단 커밋/푸시 금지**:
   - 사용자 확인 없이 임의로 `git commit` 및 `git push`를 실행하지 않습니다.
4. **미승인 계획 자동 실행 금지**:
   - 다중 파일에 걸친 대규모 작업이나 구조 변경은 Plan을 먼저 제시하고 사용자 동의를 얻은 후 수행합니다.

---

## 7. 단계별 실행 로드맵 (Implementation Checklist)

- [x] **STEP 1. 환경 준비**
  - 가상환경(`.venv`) 구성 및 `backend/requirements.txt` 의존성 설치
  - `.gitignore` 검증 (`.env` 제외 확인)
- [ ] **STEP 2. 백엔드 구현**
  - `schemas.py` → `templates.py` → `tone_converter.py` → `convert.py` → `main.py` 순서로 구현
  - 로컬 서버 기동(`uvicorn main:app --reload`) 및 Swagger UI(`/docs`), `/health` 검증
- [ ] **STEP 3. 프론트엔드 구현**
  - `index.html` → `style.css` → `app.js` 순서로 구현
  - 대상 선택, 텍스트 변환, 로딩 표시, 복사 기능 브라우저 동작 검증
- [ ] **STEP 4. 배포 및 최종 검증**
  - Git 커밋 및 Vercel 배포 준비
  - 배포 환경에서의 실제 API 호출 및 말투 변환 최종 확인

---
## 8. @PRD_업무말투변환기.md 문서와 AGENTS.md 문서 항상 최신화 하기
* 모든 변경사항이 발생하면 (예를 들어 기능이나 요구사항이 변경 되거나, 화면명세가 변경되거나, Source Code가 변경 되거나 라이브러리 버전이 변경되면) 관련된 markdown 문서들도 반드시 업데이트 합니다. 
* 구현이 완료된 사항들은 `@PRD_업무말투변환기.md\2. 완료 체크리스트`에 모두 체크표시를 해서 완료 되었음을 반드시 표시하세요.
* `@PRD_업무말투변환기.md\8. 단계별 구현 순서` 에서도 단계별로 구현이 완료되면 체크표시를 해서 완료 되었음을 반드시 표시하세요.

---
## 9. 계획서(Plan).md 문서의 저장 위치
* 계획서(플랜).md 문서는 모두 현재 프로젝트 루트 아래에 plan 폴더를 생성하여 작성하세요.