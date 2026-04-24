<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses Next.js 16.
Before applying older App Router conventions, check the relevant guide in `node_modules/next/dist/docs/`.
Prefer the current version's docs and deprecation guidance over memory.
<!-- END:nextjs-agent-rules -->

# Project AGENTS.md

## 프로젝트 고유 정보
- 이 저장소는 Next.js App Router + TypeScript + React 기반 프론트엔드 프로젝트다.
- 현재 주요 스타일링은 `styled-components` 흐름을 사용한다.
- 테스트는 Vitest + jsdom + MSW 흐름을 사용한다.
- Tailwind CSS 4가 설치되어 있어도, 실제 구현은 기존 코드 패턴을 먼저 확인한다.

## 실행 / 검증 명령어
- 개발 서버: `npm run dev`
- 빌드: `npm run build`
- 실행: `npm run start`
- 린트: `npm run lint`
- 테스트: `npm run test`
- 테스트 watch: `npm run test:watch`

## 프로젝트 구조 포인트
- `app/`: App Router 라우트 엔트리
- `app/(admin)`, `app/(public)`, `app/staff`: 주요 라우트 구역
- `components/`: UI 컴포넌트
- `components/common`: 공용 컴포넌트
- `components/home`: 홈 전용 컴포넌트
- `components/layout`: 레이아웃 관련 컴포넌트
- `api/`: 도메인별 API 계층
- `api/client`: 공통 API 클라이언트 계층
- `lib/`: 런타임/프레임워크 연동 유틸
- `styles/`: 전역 스타일 자원
- `styles/tokens.ts`: 우선 확인해야 하는 토큰 정의 위치
- `mocks/`: mock 및 MSW 관련 구성
- `test/`: 테스트 설정
- `types/`: 타입 정의

## 프로젝트 로컬 규칙
- 새 페이지 작업은 반드시 `app/` 하위 기존 라우트 그룹 구조를 먼저 따른다.
- `(admin)`, `(public)`, `staff` 중 어느 맥락에 속하는지 먼저 판단한다.
- import는 가능하면 `@/*` alias를 우선 사용한다.
- API 작업은 먼저 `api/` 하위 기존 도메인 구조와 `api/client` 재사용 가능성을 확인한다.
- 스타일 값은 먼저 `styles/tokens.ts`를 확인한다.
- styled-components 관련 설정은 `lib/styled-components-registry.tsx` 흐름을 존중한다.
- 테스트는 `test/setup.ts`와 `mocks/`의 기존 흐름에 맞춘다.

## 프로젝트에서 특히 피할 것
- Next.js 구버전 관습을 현재 구조에 그대로 적용하기
- `app/` 구조를 무시하고 임의 위치에 페이지를 추가하기
- `api/` 계층을 우회해 페이지/컴포넌트 안에 직접 API 호출을 난립시키기
- 기존 styled-components / tokens 흐름을 무시하고 임시 스타일만 덧붙이기
- 기존 테스트 흐름과 무관한 임시 검증 코드를 추가하기