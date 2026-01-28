# CodeMeant PRD v2.0

## 메타 정보
- **버전:** 2.0
- **작성일:** 2026-01-29
- **상태:** Draft
- **도메인:** codemeant.dev

---

## A. 문제 & 솔루션

### 한 줄 정의
> 개발팀의 온보딩과 PR 자동화 도구. "3개월 온보딩을 3주로 줄인다."

### 고객 문제
| # | 문제 | 누가 겪나 | 현재 해결책 |
|---|------|----------|------------|
| 1 | 신입 온보딩 3개월 | 팀 전체 | 시니어가 직접 설명 |
| 2 | 시니어 시간 30% 낭비 | 시니어 | 같은 질문 반복 답변 |
| 3 | PR 전 수동 체크 | 모든 개발자 | lint, test, build 직접 실행 |

### 우리 솔루션: 3가지 도구
| 도구 | 핵심 가치 | 누구를 위해 |
|------|----------|------------|
| **Ship** | 코드 완료 → PR 준비. 원클릭 | 모든 개발자 |
| **Onboard** | 코드베이스 즉시 이해 | 신입/주니어 |
| **Mentor** | 24시간 시니어 대리인 | 주니어 + 시니어 |

### 검증 상태
| 검증 유형 | 상태 | 목표 | 증거 |
|-----------|------|------|------|
| 시장 검증 | 진행중 | 웨이트리스트 200+ | 랜딩페이지 배포 |
| 문제 검증 | 대기 | 설문 100+ | 설문 링크 준비 |
| 가격 검증 | 대기 | 40%+ 결제 의향 | 설문에 포함 |

### Go/No-Go 기준
| 지표 | Go | No-Go |
|------|-----|-------|
| 웨이트리스트 | 200+ | <50 |
| 설문 응답 | 100+ | <30 |
| 결제 의향 | 40%+ | <20% |

---

## B. 타겟 사용자

### Primary Persona: 성장하는 개발팀
```yaml
팀 규모: 5-20명
상황: 주니어 2-3명 채용 예정
고통점:
  - 시니어가 온보딩에 시간 많이 씀
  - 같은 질문 반복
  - PR 리뷰 병목
현재 해결책:
  - 위키/노션 문서 (outdated)
  - 슬랙에서 직접 질문
우리 제품 사용 시:
  - 주니어가 AI에게 먼저 질문
  - 시니어는 복잡한 것만 답변
  - 첫 PR까지 3주
```

### Secondary Persona: 솔로 개발자
```yaml
상황: 오픈소스 또는 사이드 프로젝트
고통점:
  - PR 전에 체크할 게 많음
  - 귀찮아서 스킵 → CI 실패
우리 제품 사용 시:
  - codemeant ship 한 번으로 끝
```

---

## C. 기능 요구사항

### MVP Phase 1: Ship + Onboard Lite

#### Ship (핵심 기능)
| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| S001 | git diff 분석 | 변경 사항 수집 | P0 |
| S002 | AI 셀프 리뷰 | Claude가 코드 리뷰 | P0 |
| S003 | 자동 커밋 | 리뷰 통과 시 커밋 | P0 |
| S004 | PR 생성 | gh CLI로 PR 생성 | P0 |
| S005 | lint 실행 | ESLint/Prettier 등 | P1 |
| S006 | test 실행 | npm test / pytest | P1 |
| S007 | build 검증 | npm run build | P1 |

**CLI 인터페이스:**
```bash
codemeant ship [options]

Options:
  --no-review    AI 리뷰 스킵
  --draft        Draft PR로 생성
  --title "..."  PR 제목 지정
  --no-push      커밋만 하고 PR 생성 안 함
```

**플로우:**
```
codemeant ship
    │
    ├─1. git status 확인
    │   └─ 변경 없으면 종료
    │
    ├─2. git diff 수집
    │   └─ staged + unstaged 모두
    │
    ├─3. [옵션] lint 실행
    │   └─ 실패 시 경고 (블록 안 함)
    │
    ├─4. [옵션] test 실행
    │   └─ 실패 시 경고 (블록 안 함)
    │
    ├─5. [옵션] build 실행
    │   └─ 실패 시 경고 (블록 안 함)
    │
    ├─6. AI 셀프 리뷰 (Claude)
    │   ├─ 보안 이슈 체크
    │   ├─ 버그 가능성 체크
    │   ├─ 코드 품질 체크
    │   └─ 개선 제안
    │
    ├─7. 리뷰 결과 표시
    │   └─ 심각한 이슈 있으면 확인 요청
    │
    ├─8. git commit
    │   └─ AI가 커밋 메시지 생성
    │
    ├─9. git push
    │
    └─10. gh pr create
        └─ AI가 PR 설명 생성
```

#### Onboard Lite (MVP)
| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| O001 | README 분석 | README.md 파싱 | P0 |
| O002 | 구조 분석 | 폴더 구조 트리 | P0 |
| O003 | 의존성 분석 | package.json 등 | P0 |
| O004 | AI 요약 | GPT로 프로젝트 설명 생성 | P0 |
| O005 | 핵심 파일 표시 | 중요 파일 하이라이트 | P1 |

**CLI 인터페이스:**
```bash
codemeant onboard [path] [options]

Options:
  --output json|md   출력 형식 (기본: md)
  --depth N          폴더 깊이 (기본: 3)
```

**플로우:**
```
codemeant onboard .
    │
    ├─1. README.md 읽기
    │
    ├─2. package.json / requirements.txt 파싱
    │   └─ 기술 스택 추출
    │
    ├─3. 폴더 구조 스캔
    │   └─ .gitignore 존중
    │
    ├─4. AI 요약 생성 (GPT-4o-mini)
    │   ├─ 프로젝트 목적
    │   ├─ 주요 기술 스택
    │   ├─ 폴더 구조 설명
    │   └─ 시작하기 가이드
    │
    └─5. 마크다운 출력
```

**출력 예시:**
```markdown
# Project Summary: my-app

## Overview
This is a Next.js e-commerce application with...

## Tech Stack
- Frontend: Next.js 14, React 18, Tailwind CSS
- Backend: API Routes, Prisma
- Database: PostgreSQL

## Key Directories
- `/src/app` - Next.js App Router pages
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and API clients

## Getting Started
1. npm install
2. cp .env.example .env.local
3. npm run dev

## Key Files to Know
- `src/app/layout.tsx` - Root layout
- `src/lib/db.ts` - Database connection
- `src/components/ui/` - Design system components
```

### Phase 2: Mentor (Post-MVP)
| ID | 기능 | 설명 | 의존성 |
|----|------|------|--------|
| M001 | RAG 인덱싱 | 코드베이스 임베딩 | Onboard 완료 |
| M002 | 질의응답 | 코드 관련 질문 답변 | M001 |
| M003 | 컨벤션 학습 | 팀 코딩 스타일 학습 | M001 |
| M004 | PR 리뷰 어시스트 | 리뷰 코멘트 초안 | Ship 데이터 |

### Out of Scope (MVP 제외)
- RAG 기반 전체 인덱싱 (Phase 2)
- VS Code Extension (Phase 2)
- 웹 대시보드 (Phase 2)
- 팀 관리 기능 (Phase 2)
- 자체 Git 서버 연동 (Phase 2)

---

## D. 비즈니스

### 경쟁 분석
| 경쟁사 | 가격 | 강점 | 약점 | 우리 차별점 |
|--------|------|------|------|-------------|
| CodeRabbit | $15/user | PR 리뷰 전문 | 리뷰만 됨 | Ship + Onboard 통합 |
| Qodo | Free tier | 코드 분석 | 온보딩 없음 | 온보딩 특화 |
| Greptile | $19/user | 코드베이스 이해 | 비쌈 | 가격 경쟁력 |
| Cursor | $20/mo | AI 코딩 | IDE 종속 | CLI 독립 |

**우리의 포지션:**
> Ship + Onboard + Mentor를 하나로. CLI 기반으로 IDE 종속 없음.

### 수익 모델: Freemium + Per Seat

#### Free Tier
| 기능 | 한도 |
|------|------|
| Ship | 20회/월 |
| Onboard | 5회/월 |
| Mentor | 없음 |

#### Pro Tier: $10/seat/month
| 기능 | 한도 |
|------|------|
| Ship | 무제한 |
| Onboard | 무제한 |
| Mentor | 500 질문/월 |
| 팀 대시보드 | 포함 |

#### Enterprise: 문의
- 온프레미스
- 커스텀 모델
- SLA

### 비용 구조 (Ship 1회)
| 항목 | 비용 |
|------|------|
| Claude Haiku (리뷰) | ~$0.01-0.02 |
| GPT-4o-mini (커밋 메시지) | ~$0.005 |
| **총** | **~$0.015-0.025** |

### 비용 구조 (Onboard 1회)
| 항목 | 비용 |
|------|------|
| GPT-4o-mini (요약) | ~$0.01 |
| **총** | **~$0.01** |

**마진 분석:**
- Free 20 ships/month = ~$0.50 비용 → 마케팅 비용으로 처리
- Pro $10/seat → 실제 사용량 ~$2-3 → 70%+ 마진

### GTM (Go-To-Market)
| 단계 | 채널 | 목표 |
|------|------|------|
| 1. 베타 | 웨이트리스트 + 설문 | 100명 |
| 2. 커뮤니티 | Reddit, HN, 긱뉴스 | 500명 |
| 3. 콘텐츠 | 블로그, 유튜브 | 1000명 |
| 4. Product Hunt | 런칭 | 2000명 |

---

## E. 기술 아키텍처

### 구조
```
┌─────────────────────────────────────────────────────────┐
│  개발자 터미널                                            │
│  $ codemeant ship                                       │
│  $ codemeant onboard .                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  CodeMeant CLI (npm package)                            │
│  ├─ ship.ts      - git diff → AI review → PR           │
│  ├─ onboard.ts   - metadata → AI summary               │
│  └─ auth.ts      - Supabase 인증                        │
└──────────────────┬──────────────────────────────────────┘
                   │ API 호출
┌──────────────────▼──────────────────────────────────────┐
│  CodeMeant API (FastAPI)                                │
│  ├─ /ship/review    - Claude AI 리뷰                   │
│  ├─ /ship/commit    - 커밋 메시지 생성                  │
│  ├─ /ship/pr        - PR 설명 생성                      │
│  └─ /onboard/summary - 프로젝트 요약 생성               │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  External Services                                      │
│  ├─ Claude API (리뷰, 분석)                             │
│  ├─ OpenAI API (요약, 커밋 메시지)                       │
│  ├─ Supabase (인증, 사용량 추적)                         │
│  └─ GitHub API (gh CLI)                                 │
└─────────────────────────────────────────────────────────┘
```

### 기술 스택
| 영역 | 기술 | 이유 |
|------|------|------|
| CLI | Node.js + TypeScript | npm 배포 용이 |
| API | FastAPI (Python) | AI SDK 풍부 |
| Auth | Supabase | 빠른 구현 |
| AI | Claude (리뷰), GPT (요약) | 각각 강점 활용 |
| Git | gh CLI | 공식 도구 활용 |

### 데이터 흐름

#### Ship 플로우
```
1. CLI: git diff 수집
2. CLI → API: diff 전송
3. API: Claude 리뷰 요청
4. API → CLI: 리뷰 결과
5. CLI: 결과 표시 + 확인
6. CLI: git commit (로컬)
7. CLI: git push (로컬)
8. CLI: gh pr create (로컬)
```

#### Onboard 플로우
```
1. CLI: README + package.json + 폴더 구조 수집
2. CLI → API: 메타데이터 전송
3. API: GPT 요약 요청
4. API → CLI: 요약 결과
5. CLI: 마크다운 출력
```

---

## F. 성공 지표

### 시장 검증 (Pre-MVP)
| 지표 | 목표 | 현재 |
|------|------|------|
| 웨이트리스트 | 200+ | 0 |
| 설문 응답 | 100+ | 0 |
| 결제 의향 | 40%+ | - |

### MVP (출시 후 1개월)
| 지표 | 목표 |
|------|------|
| MAU | 100+ |
| Ship 사용량 | 500+/월 |
| Onboard 사용량 | 100+/월 |
| 유료 전환 | 10+ |

### Growth (3개월)
| 지표 | 목표 |
|------|------|
| MAU | 500+ |
| MRR | $500+ |
| NPS | 40+ |

---

## G. 타임라인

| Phase | 기간 | 목표 | 완료 조건 |
|-------|------|------|-----------|
| 0 | 1주 | 시장 검증 | 웨이트리스트 200+, 설문 100+ |
| 1 | 2주 | Ship MVP | 명령어 동작, PR 생성 확인 |
| 2 | 1주 | Onboard Lite | 요약 생성 동작 확인 |
| 3 | 1주 | 베타 | 피드백 반영, 버그 수정 |
| 4 | - | 출시 | Product Hunt, 커뮤니티 |

---

## H. 리스크

| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| 시장 관심 없음 | 중 | 높 | 빠른 검증, No-Go 시 피벗 |
| AI 비용 초과 | 낮 | 중 | Haiku 사용, 토큰 제한 |
| GitHub API 제한 | 낮 | 중 | gh CLI 사용 (로컬) |
| 경쟁사 진입 | 중 | 중 | Onboard 차별화 강화 |

---

## I. Acceptance Criteria

### Ship MVP 완료 조건 (Definition of Done)

#### S001: git diff 분석
- [ ] `git status`로 변경 파일 목록 추출
- [ ] `git diff`로 staged/unstaged 변경 내용 수집
- [ ] 변경 없으면 "Nothing to ship" 메시지
- [ ] 바이너리 파일 제외

#### S002: AI 셀프 리뷰
- [ ] Claude API 호출 성공
- [ ] 보안 이슈 체크 (API 키 노출, SQL injection 등)
- [ ] 버그 가능성 체크
- [ ] 코드 품질 체크
- [ ] 결과를 severity (high/medium/low)로 분류
- [ ] API 실패 시 graceful fallback (리뷰 스킵 옵션)

#### S003: 자동 커밋
- [ ] AI가 커밋 메시지 생성 (Conventional Commits)
- [ ] 사용자 확인 후 커밋
- [ ] `--no-verify` 옵션 지원

#### S004: PR 생성
- [ ] `gh` CLI 설치 확인
- [ ] GitHub 인증 상태 확인
- [ ] AI가 PR 제목 + 설명 생성
- [ ] `gh pr create` 실행
- [ ] PR URL 출력
- [ ] `--draft` 옵션 지원

#### S005-S007: lint/test/build
- [ ] npm scripts 또는 package.json 스크립트 감지
- [ ] 실행 결과 표시
- [ ] 실패해도 진행 가능 (경고만)
- [ ] `--skip-checks` 옵션으로 스킵 가능

### Onboard Lite MVP 완료 조건

#### O001: README 분석
- [ ] README.md 파일 읽기
- [ ] README 없으면 스킵 (에러 아님)
- [ ] 10KB 초과 시 truncate

#### O002: 구조 분석
- [ ] 폴더 트리 생성 (depth 3 기본)
- [ ] .gitignore 패턴 존중
- [ ] node_modules, .git 등 제외
- [ ] 파일 개수 표시

#### O003: 의존성 분석
- [ ] package.json → 기술 스택 추출
- [ ] requirements.txt → Python 패키지
- [ ] go.mod, Cargo.toml 등 지원
- [ ] 감지된 스택 목록 출력

#### O004: AI 요약
- [ ] GPT-4o-mini API 호출
- [ ] 5가지 섹션 생성 (Overview, Stack, Directories, Getting Started, Key Files)
- [ ] 마크다운 형식 출력
- [ ] API 실패 시 에러 메시지

### 전체 MVP 완료 조건
- [ ] Ship: `codemeant ship` → PR 생성까지 동작
- [ ] Onboard: `codemeant onboard .` → 요약 출력
- [ ] 인증: Supabase 로그인 동작
- [ ] 사용량: API 호출 횟수 추적
- [ ] 에러: 네트워크 오류, API 실패 처리
- [ ] 문서: README에 설치/사용법 작성

---

## 버전 히스토리
| 버전 | 날짜 | 변경 |
|------|------|------|
| 1.0 | 2026-01-25 | 초안 (프로젝트 가치 분석) |
| 2.0 | 2026-01-29 | 피벗: Ship + Onboard + Mentor |
