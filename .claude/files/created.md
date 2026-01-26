# CodeMeant - 생성된 파일 목록

## 2026-01-25 세션 (문서)

| 파일 경로 | 목적 | 삭제 가능 |
|-----------|------|-----------|
| docs/PRD.md | 제품 요구사항 문서 | NO |
| docs/ARCHITECTURE.md | 아키텍처 문서 | NO |
| docs/API.md | API 문서 | NO |
| docs/DATABASE.md | 데이터베이스 문서 | NO |
| docs/VERIFICATION.md | 검증 체크리스트 | NO |
| .claude/status/current.md | 프로젝트 상태 추적 | NO |
| .claude/files/created.md | 파일 추적 | NO |

## 2026-01-25 세션 (MVP 구현)

### 루트
| 파일 경로 | 목적 | 삭제 가능 |
|-----------|------|-----------|
| package.json | 루트 패키지 설정 | NO |
| pnpm-workspace.yaml | pnpm 워크스페이스 설정 | NO |
| turbo.json | Turborepo 설정 | NO |
| .env.example | 환경 변수 템플릿 | NO |
| .gitignore | Git 무시 목록 | NO |

### apps/web (Next.js)
| 파일 경로 | 목적 | 삭제 가능 |
|-----------|------|-----------|
| apps/web/package.json | Web 패키지 설정 | NO |
| apps/web/tsconfig.json | TypeScript 설정 | NO |
| apps/web/next.config.js | Next.js 설정 | NO |
| apps/web/src/app/layout.tsx | 루트 레이아웃 | NO |
| apps/web/src/app/page.tsx | 홈페이지 | NO |
| apps/web/src/app/(auth)/login/page.tsx | 로그인 페이지 | NO |
| apps/web/src/app/(dashboard)/dashboard/page.tsx | 대시보드 | NO |
| apps/web/src/app/(dashboard)/credits/page.tsx | 크레딧 페이지 | NO |
| apps/web/src/app/(dashboard)/analysis/[id]/page.tsx | 분석 결과 페이지 | NO |
| apps/web/src/app/auth/device/page.tsx | CLI 디바이스 인증 | NO |
| apps/web/src/app/api/auth/signout/route.ts | 로그아웃 API | NO |
| apps/web/src/lib/supabase/client.ts | Supabase 클라이언트 | NO |
| apps/web/src/lib/supabase/server.ts | Supabase 서버 클라이언트 | NO |
| apps/web/src/middleware.ts | Next.js 미들웨어 | NO |

### apps/api (FastAPI)
| 파일 경로 | 목적 | 삭제 가능 |
|-----------|------|-----------|
| apps/api/pyproject.toml | Python 프로젝트 설정 | NO |
| apps/api/app/main.py | FastAPI 엔트리포인트 | NO |
| apps/api/app/config.py | 설정 관리 | NO |
| apps/api/app/routers/auth.py | 인증 라우터 | NO |
| apps/api/app/routers/credits.py | 크레딧 라우터 | NO |
| apps/api/app/routers/analysis.py | 분석 라우터 | NO |
| apps/api/app/routers/webhooks.py | 웹훅 라우터 (Polar) | NO |
| apps/api/app/services/supabase_client.py | Supabase 클라이언트 | NO |
| apps/api/app/services/credits.py | 크레딧 서비스 | NO |
| apps/api/app/services/ai_analyzer.py | AI 분석 서비스 | NO |

### apps/cli (Node.js CLI)
| 파일 경로 | 목적 | 삭제 가능 |
|-----------|------|-----------|
| apps/cli/package.json | CLI 패키지 설정 | NO |
| apps/cli/tsconfig.json | TypeScript 설정 | NO |
| apps/cli/src/index.ts | CLI 엔트리포인트 | NO |
| apps/cli/src/config.ts | CLI 설정 | NO |
| apps/cli/src/commands/login.ts | 로그인 명령어 | NO |
| apps/cli/src/commands/analyze.ts | 분석 명령어 | NO |
| apps/cli/src/commands/credits.ts | 크레딧 명령어 | NO |
| apps/cli/src/auth/token-manager.ts | 토큰 관리 | NO |
| apps/cli/src/extractors/metadata.ts | 메타데이터 추출기 | NO |

### packages/shared-types
| 파일 경로 | 목적 | 삭제 가능 |
|-----------|------|-----------|
| packages/shared-types/package.json | 타입 패키지 설정 | NO |
| packages/shared-types/tsconfig.json | TypeScript 설정 | NO |
| packages/shared-types/src/index.ts | 공유 타입 정의 | NO |

### supabase
| 파일 경로 | 목적 | 삭제 가능 |
|-----------|------|-----------|
| supabase/config.toml | Supabase 로컬 설정 | NO |
| supabase/migrations/001_initial.sql | 초기 DB 스키마 | NO |
