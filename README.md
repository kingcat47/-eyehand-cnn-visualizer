# React Template

백엔드 개발자가 협업 전 프론트엔드 구조에 익숙해질 수 있도록 만든 템플릿.

프론트엔드에 익숙하지 않다면 [GUIDE_FOR_BACKEND.md](./GUIDE_FOR_BACKEND.md)를 참고하세요.

## 사용 방법

```bash
npx create-oj-react my-project
cd my-project
npm run dev
```

## 기술 스택

- Vite 7 + React 19 + TypeScript
- SCSS Modules
- react-router-dom v7
- lucide-react
- Pretendard

## 프로젝트 구조

```
src/
  components/
    ui/          # 재사용 가능한 UI 컴포넌트 (Button, Input 등)
    layout/      # 페이지 레이아웃
    only-page/   # 특정 페이지에서만 쓰는 컴포넌트
  pages/         # 페이지 컴포넌트
  hooks/         # 커스텀 훅
  styles/        # 전역 스타일, 디자인 토큰
  types/         # 타입 정의
  utils/         # 유틸리티 함수
  router.tsx     # 라우트 정의
  main.tsx       # 앱 진입점
```
