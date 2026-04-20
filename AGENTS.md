<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project AGENTS.md

## 주의
이 프로젝트는 Next.js 16 기반이다.
기존 학습 데이터 기준의 오래된 App Router 관습이나 예제를 그대로 적용하지 말고,
필요한 경우 `node_modules/next/dist/docs/`의 관련 가이드를 먼저 확인한다.
deprecation 경고와 현재 버전 문서를 우선한다.

## 프로젝트 개요
이 저장소는 Next.js App Router + TypeScript + React 기반 프론트엔드 프로젝트다.
스타일링은 `styled-components`를 사용하며, 테스트는 Vitest + jsdom + MSW 기반 흐름을 갖고 있다.

## 기술 스택
- Next.js 16.2.1
- React 19.2.4
- TypeScript (strict mode)
- styled-components
- axios
- dayjs
- ESLint 9 + `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- Prettier
- Vitest + jsdom
- MSW
- Tailwind CSS 4는 설치되어 있으나, 실제 스타일 작업은 기존 코드 패턴을 먼저 확인하고 styled-components 중심 흐름을 우선한다.

## 실행 / 검증 명령어
- 개발 서버: `npm run dev`
- 빌드: `npm run build`
- 실행: `npm run start`
- 린트: `npm run lint`
- 테스트: `npm run test`
- 테스트 watch: `npm run test:watch`

작업 후 의미 있는 변경이 있으면 최소한 `lint`와 관련 테스트를 우선 확인한다.

## 경로 / 구조 규칙
프로젝트의 주요 구조는 아래를 기준으로 이해한다.

- `app/`: App Router 기반 라우트 엔트리
- `app/(admin)`, `app/(public)`, `app/staff`: 라우트 그룹 및 주요 화면 구역
- `components/`: UI 컴포넌트
  - `components/common`: 공용 컴포넌트
  - `components/home`: 홈 전용 컴포넌트
  - `components/layout`: 레이아웃 관련 컴포넌트
- `api/`: API 계층
  - `auth`, `classroom`, `department`, `lesson`, `request`, `student`, `subject`, `user` 등 도메인 단위 분리
  - `client`는 공통 API 클라이언트 계층으로 간주하고 먼저 재사용 가능성을 확인한다.
- `lib/`: 런타임/프레임워크 연동 유틸
  - 현재 `styled-components-registry.tsx`가 존재하므로 styled-components 관련 설정은 이 흐름을 존중한다.
- `styles/`: 전역 스타일 자원
  - 현재 `tokens.ts`가 존재하므로 spacing, color, typography, radius, shadow 등은 가능하면 토큰을 먼저 확인한다.
- `mocks/`: mock 데이터 및 MSW 관련 구성
- `test/`: 테스트 설정
- `types/`: 타입 정의

## import 규칙
- 경로 alias `@/*`를 우선 사용한다.
- 깊은 상대경로(`../../../`) 남발보다 alias를 우선 고려한다.
- 단, 이미 파일 근처 상대경로가 더 자연스러운 영역이면 기존 패턴을 따른다.

## 라우트 / 페이지 작업 규칙
- 새 페이지 작업은 `app/` 하위의 기존 라우트 그룹 구조를 먼저 따른다.
- `(admin)`, `(public)`, `staff` 중 어느 맥락에 속하는 화면인지 먼저 판단한다.
- 페이지는 가능한 한 얇게 유지하고, 반복 UI나 복잡한 화면 블록은 `components/`로 분리한다.
- 특정 페이지 문맥에 강하게 묶인 것은 페이지 전용 컴포넌트로 두고, 여러 페이지에서 재사용 가능성이 높을 때만 `components/common` 이동을 고려한다.

## 컴포넌트 규칙
- `components/common`은 진짜 공용일 때만 사용한다.
- 페이지 전용 문맥이 강한 UI를 성급하게 공용화하지 않는다.
- 반복 카드, 패널, 툴바, 메뉴 그룹, 상태 배지 등은 먼저 분리 후보로 본다.
- 하나의 컴포넌트에 layout, interaction, API fetching을 모두 몰아넣지 않는다.

## 스타일링 규칙
- 이 프로젝트에서는 `styled-components` 흐름을 우선한다.
- 새 UI 구현 시 inline style보다 기존 styled-components 패턴을 먼저 따른다.
- 디자인 값은 가능하면 `styles/tokens.ts` 등 기존 토큰에서 먼저 찾는다.
- 임시 margin 보정, 위치 땜질, 매직 넘버 중심 수정은 피한다.
- 구조 문제를 스타일로 덮지 말고, 먼저 레이아웃 구조를 정리한다.

## API 작업 규칙
- API 관련 작업은 반드시 `api/` 하위 기존 도메인 구조를 먼저 확인한 뒤 맞는 위치에 추가한다.
- 새 API 호출을 페이지/컴포넌트 안에서 직접 만들기보다, 기존 `api/client` 및 도메인별 계층 재사용을 우선 검토한다.
- 응답 타입, 요청 타입, 에러 처리 방식은 기존 패턴에 맞춘다.
- UI에는 `loading`, `empty`, `success`, `error` 상태를 명시적으로 반영한다.
- mock 기반 UI가 있으면 실제 API 연동으로 자연스럽게 치환한다.

## 테스트 규칙
- 테스트 도구는 기존 Vitest + jsdom + MSW 흐름을 우선 사용한다.
- 테스트 설정은 `test/setup.ts`와 `mocks/` 구조를 먼저 확인한 뒤 맞춰서 작성한다.
- 중요한 변경에는 최소한 아래를 우선 고려한다.
  - 렌더링 테스트
  - 핵심 상호작용 테스트
  - API 성공/실패 또는 상태 분기 테스트
- 기존 테스트 패턴과 어긋나는 독자적 테스트 체계를 새로 만들지 않는다.

## 린트 / 포맷팅 규칙
- ESLint는 Next core-web-vitals + TypeScript 규칙을 따른다.
- Prettier 규칙은 저장소의 `.prettierrc`를 그대로 따른다.
- 의미 없는 스타일 변경만 대량으로 섞지 않는다.
- 기능 변경 PR에서 구조 정리와 포맷팅을 과도하게 함께 섞지 않는다.

## 작업 우선순위
항상 아래 순서를 우선한다.

1. 현재 라우트/도메인 맥락 파악
2. 기존 구조와 공용 계층 재사용 가능성 확인
3. 정적 UI 구조 안정화
4. 상호작용 추가
5. API 연동
6. 테스트 및 리팩터링

## 금지 사항
- Next.js 구버전 관습을 현재 프로젝트에 그대로 적용하기
- `app/` 구조를 무시하고 임의 위치에 페이지를 추가하기
- 공용 컴포넌트 기준 없이 `components/common`에 무분별하게 넣기
- `api/` 계층을 우회해서 페이지 안에 직접 API 호출을 난립시키기
- 기존 styled-components / tokens 흐름을 무시하고 임시 스타일만 덧붙이기
- 성공 상태만 구현하고 loading / empty / error 상태를 생략하기
- 기존 테스트 체계를 무시하고 임시 검증 코드만 추가하기