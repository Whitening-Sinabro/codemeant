# CodeMeant - 현재 상태

## 지금 상태
- **Phase**: 0 (시장 검증)
- **마지막 업데이트**: 2026-01-29
- **피벗**: 프로젝트 가치 분석 → Ship + Onboard + Mentor

## 완료 목록

### 기반 구축 (2026-01-25)
- [x] Turborepo 모노레포 설정
- [x] apps/web (Next.js) 구현
- [x] apps/api (FastAPI) 구현
- [x] apps/cli (Node.js) 구현
- [x] packages/shared-types 구현
- [x] Supabase DB 마이그레이션 실행
- [x] Supabase 환경 변수 설정
- [x] Railway API 배포 완료

### 피벗 + 랜딩페이지 (2026-01-29)
- [x] 경쟁사 분석 (CodeRabbit, Qodo, Greptile, Cursor 등)
- [x] Ship + Onboard + Mentor 3가지 기능 확정
- [x] 랜딩페이지 전체 리뉴얼 (영문)
- [x] Space Grotesk 폰트 적용
- [x] 색상 시맨틱 수정 (problem = gray, solution = green)
- [x] Go/No-Go 기준 정의
- [x] PRD v2.0 작성 완료

## 다음 할 일
1. **설문 링크 생성**: Google Forms로 설문 만들기
2. **웨이트리스트 API**: Supabase에 이메일 저장
3. **랜딩페이지 배포**: Cloudflare에 배포
4. **커뮤니티 공유**: Reddit, HN, 긱뉴스

## 생성/수정된 파일 (2026-01-26)

### 신규 생성
| 파일 | 설명 |
|------|------|
| `apps/web/src/lib/scanner.ts` | 폴더 스캔 + 프로젝트 탐지 |
| `apps/web/src/lib/extractor.ts` | 메타데이터 추출 |
| `apps/web/src/lib/api.ts` | API 클라이언트 |
| `apps/web/src/components/ProjectList.tsx` | 프로젝트 목록 UI |
| `apps/web/src/app/globals.css` | 전역 스타일 |

### 수정
| 파일 | 변경 |
|------|------|
| `apps/web/src/app/page.tsx` | 랜딩페이지 전체 리뉴얼 + API 연동 |
| `apps/web/src/app/layout.tsx` | CSS import 추가 |
| `apps/api/app/main.py` | CORS localhost:4001 추가 |
| `apps/cli/package.json` | bin 경로 수정 |

## 환경 정보
- **Supabase Project**: oyooifhuclwqkjpqquil
- **Web 개발 서버**: http://localhost:4001
- **API 개발 서버**: http://localhost:8000
- **API 배포**: https://api-production-82c0.up.railway.app
- **도메인**: codemeant.dev
- **npm 패키지**: codemeant@0.1.0

## 설정된 파일
- `apps/web/.env.local` - Supabase 키 설정됨
- `apps/api/.env` - Supabase 키 + AI 키 필요

## 아키텍처

```
사용자 (Chrome/Edge)
    │
    ▼
┌─────────────────────────────────┐
│  랜딩페이지 (localhost:4001)    │
│  - 폴더 선택 (File System API) │
│  - 프로젝트 스캔               │
│  - 메타데이터 추출 (로컬)      │
│  - 코드는 서버로 안 감         │
└─────────────┬───────────────────┘
              │ 메타데이터만 전송
              ▼
┌─────────────────────────────────┐
│  API 서버 (localhost:8000)      │
│  - 인증 (Supabase)             │
│  - 크레딧 차감                 │
│  - AI 분석 (GPT+Gemini→Claude) │
└─────────────────────────────────┘
```

## 메모
- File System Access API는 Chrome/Edge만 지원
- Firefox/Safari 사용자는 npx codemeant analyze . 안내
- 이메일 확인(Confirm email) ON 상태
- 회원가입 시 실제 이메일 필요
- 가입 시 자동 10 크레딧 지급
