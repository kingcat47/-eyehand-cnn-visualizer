# 백엔드 개발자를 위한 프론트엔드 가이드

이 문서는 프론트엔드에 익숙하지 않은 개발자가 이 프로젝트의 구조를 빠르게 파악하기 위한 가이드입니다. AI와 함께 읽으면 더 효과적입니다.

---

## 핵심 개념 3가지

### 1. 컴포넌트 = 함수

React에서 UI는 함수로 만듭니다. 함수가 HTML을 리턴하면 그게 컴포넌트입니다.

```tsx
function Home() {
  return <div>Home</div>;
}
```

### 2. props = 함수 인자

컴포넌트에 데이터를 넘기는 방식은 함수에 인자를 넘기는 것과 같습니다.

```tsx
// 정의
function Button({ size, variant, children }) {
  return <button className={size}>{children}</button>;
}

// 사용
<Button size="large" variant="primary">클릭</Button>
```

### 3. 파일 하나 = 관심사 하나

컴포넌트 하나는 이렇게 구성됩니다:

```
button/
  index.tsx           # 컴포넌트 로직 (어떻게 동작하는가)
  styles.module.scss  # 스타일 (어떻게 보이는가)
```

`styles.module.scss`는 해당 컴포넌트에만 적용됩니다. 다른 컴포넌트의 스타일에 영향을 주지 않습니다.

---

## 프로젝트 구조

```
src/
  main.tsx              # 1. 앱이 여기서 시작됩니다
  router.tsx            # 2. URL과 페이지를 연결합니다
  pages/                # 3. 각 페이지의 내용입니다
  components/
    ui/                 # 4. 여러 페이지에서 재사용하는 부품들입니다
    layout/             # 5. 페이지의 뼈대(헤더, 영역 배치)입니다
    only-page/          # 6. 특정 페이지에서만 쓰는 컴포넌트입니다
  styles/
    variables.scss      # 7. 디자인 토큰 (색상, 간격, 그림자 등)
    globals.scss        # 8. 전체 앱에 적용되는 기본 스타일입니다
  hooks/                # 9. 재사용 가능한 로직입니다
  utils/                # 10. 유틸리티 함수입니다
  types/                # 11. TypeScript 타입 정의입니다
```

### 흐름 요약

```
사용자가 URL 입력
  → router.tsx 에서 매칭되는 페이지를 찾음
  → pages/ 에 있는 페이지 컴포넌트를 렌더링
  → 페이지 안에서 components/ui/ 의 부품들을 조합해서 화면을 구성
```

---

## 디자인 토큰

`src/styles/variables.scss`에 프로젝트 전체에서 사용하는 디자인 값들이 정의되어 있습니다. 브랜드 색상이나 간격을 바꾸고 싶으면 이 파일만 수정하면 모든 컴포넌트에 반영됩니다.

### 색상 체계

```
텍스트 색상
  $color-text            #151515    기본 텍스트
  $color-text-subtle     #7D7D7D    보조 텍스트 (설명, 캡션)
  $color-text-white      #FFFFFF    어두운 배경 위 텍스트

브랜드 색상
  $color-text-brand         #45C1FF    브랜드 강조 텍스트
  $color-surface-brand      #45C1FF    브랜드 버튼, 체크박스 등의 배경
  $color-surface-brand-heavy #0D8FCF   브랜드 진한 변형
  $color-surface-brand-subtle #EAF8FF  브랜드 연한 변형 (호버, 배지 등)

배경 색상
  $color-surface         #FFFFFF    기본 배경
  $color-surface-subtle  #F5F5F5    구분이 필요한 영역의 배경

테두리 색상
  $color-border          #E8E8E8    기본 테두리
  $color-border-subtle   #EFEFEF    연한 테두리
```

### 색상 네이밍 규칙

이름만 보면 어디에 쓰는 색인지 알 수 있습니다:

| 접두사 | 용도 | 예시 |
|---|---|---|
| `text-` | 글자 색상 | `$color-text-subtle` → 보조 텍스트 |
| `surface-` | 배경 색상 | `$color-surface-brand` → 브랜드 버튼 배경 |
| `border-` | 테두리 색상 | `$color-border` → 입력창 테두리 |

| 접미사 | 의미 |
|---|---|
| (없음) | 기본값 |
| `-subtle` | 연한 변형 |
| `-heavy` | 진한 변형 |
| `-brand` | 브랜드 계열 |

### 간격 (Spacing)

컴포넌트 사이의 여백이나 패딩에 사용합니다. 일관된 간격을 유지하기 위해 정해진 값만 사용합니다.

```
$spacing-4    4px     아주 좁은 간격
$spacing-8    8px     좁은 간격
$spacing-12   12px
$spacing-16   16px    기본 간격
$spacing-20   20px
$spacing-24   24px    넓은 간격
$spacing-32   32px
$spacing-40   40px
$spacing-48   48px
$spacing-64   64px
$spacing-100  100px   섹션 간 간격
```

### 모서리 둥글기 (Radius)

```
$radius-4     4px     살짝 둥근 (체크박스 등)
$radius-8     8px
$radius-12    12px
$radius-14    14px    입력창, 버튼
$radius-16    16px
$radius-32    32px    큰 카드
$radius-full  9999px  완전한 원형 (아바타 등)
```

### 레이아웃

```
$max-width    1200px   콘텐츠 최대 너비
$padding      24px     좌우 여백
$shadow       0px 1px 2px 0px rgba(0,0,0,0.07)   기본 그림자
```

### 프로젝트에 맞게 커스텀하기

새 프로젝트를 시작할 때 바꿀 가능성이 높은 값들:

```scss
// 브랜드 색상 3개만 바꾸면 전체 톤이 바뀝니다
$color-surface-brand: #45C1FF;        // → 원하는 메인 색상
$color-surface-brand-heavy: #0D8FCF;  // → 메인 색상의 진한 버전
$color-surface-brand-subtle: #EAF8FF; // → 메인 색상의 연한 버전

// 텍스트 브랜드 색상도 맞춰서 변경
$color-text-brand: #45C1FF;
$color-text-brand-heavy: #0D8FCF;
$color-text-brand-subtle: #EAF8FF;
```

---

## 자주 하게 될 작업

### 새 페이지 추가하기

1. `src/pages/About.tsx` 생성:

```tsx
export default function About() {
  return <div>소개 페이지</div>;
}
```

2. `src/pages/index.tsx`에 export 추가:

```tsx
export { default as About } from "./About";
```

3. `src/router.tsx`에 라우트 추가:

```tsx
import { Home, About } from "@/pages";

const Router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
]);
```

### UI 컴포넌트 사용하기

모든 UI 컴포넌트는 `@/components/ui`에서 import합니다:

```tsx
import { Button, Input, Typo, VStack } from "@/components/ui";

export default function LoginPage() {
  return (
    <VStack gap={16}>
      <Typo.Headline>로그인</Typo.Headline>
      <Input label="이메일" placeholder="email@example.com" />
      <Input label="비밀번호" type="password" />
      <Button variant="primary" size="large" fullWidth>
        로그인
      </Button>
    </VStack>
  );
}
```

---

## 사용 가능한 컴포넌트

### Button

```tsx
<Button variant="primary" size="large">확인</Button>
<Button variant="secondary" size="medium">취소</Button>
<Button variant="tertiary" disabled>비활성</Button>
<Button pending>처리 중...</Button>
<Button leadingIcon={<Search />}>검색</Button>
```

| prop | 값 | 설명 |
|---|---|---|
| `variant` | `"primary"` `"secondary"` `"tertiary"` | 버튼 스타일 |
| `size` | `"large"` `"medium"` | 크기 |
| `pending` | `boolean` | 로딩 스피너 표시 |
| `fullWidth` | `boolean` | 가로 100% |
| `leadingIcon` | `ReactNode` | 왼쪽 아이콘 |
| `trailingIcon` | `ReactNode` | 오른쪽 아이콘 |

### Input

```tsx
<Input label="이메일" placeholder="입력" />
<Input label="비밀번호" type="password" error="필수 항목입니다" />
<Input leftIcon={<Search />} />
```

| prop | 값 | 설명 |
|---|---|---|
| `variant` | `"primary"` `"secondary"` | 입력창 스타일 |
| `size` | `"large"` `"medium"` | 크기 |
| `label` | `string` | 상단 라벨 |
| `error` | `string` | 에러 메시지 |
| `leftIcon` / `rightIcon` | `ReactNode` | 아이콘 |
| `required` | `boolean` | 필수 표시 (*) |

### Checkbox

```tsx
<Checkbox label="동의합니다" />
<Checkbox label="전체 선택" indeterminate />
<Checkbox label="설명 포함" description="부가 설명" />
```

| prop | 값 | 설명 |
|---|---|---|
| `size` | `"sm"` `"md"` `"lg"` | 크기 |
| `indeterminate` | `boolean` | 중간 상태 (전체 선택 등) |
| `label` | `ReactNode` | 라벨 |
| `description` | `ReactNode` | 부가 설명 |
| `error` | `ReactNode` | 에러 메시지 |

### Typo (텍스트)

```tsx
<Typo.Display>큰 제목 (26px)</Typo.Display>
<Typo.Headline>중간 제목 (24px)</Typo.Headline>
<Typo.BodyLarge>큰 본문 (18px)</Typo.BodyLarge>
<Typo.Body>기본 본문 (17px)</Typo.Body>
<Typo.Subtext>보조 텍스트 (14px)</Typo.Subtext>
<Typo.Caption>캡션 (12px)</Typo.Caption>
```

### HStack / VStack (레이아웃)

```tsx
// 가로 배치
<HStack gap={16} align={FlexAlign.Center}>
  <Button>왼쪽</Button>
  <Button>오른쪽</Button>
</HStack>

// 세로 배치
<VStack gap={8}>
  <Input label="이름" />
  <Input label="이메일" />
</VStack>
```

| prop | 값 | 설명 |
|---|---|---|
| `gap` | `number` | 요소 간 간격 (px) |
| `align` | `FlexAlign.Start` `Center` `End` `Stretch` | 정렬 |
| `justify` | `FlexJustify.Start` `Center` `End` `Between` `Around` `Evenly` | 배치 |
| `fullWidth` | `boolean` | 가로 100% |
| `wrap` | `boolean` | 줄바꿈 허용 |

### Spacing (여백)

```tsx
<Spacing size={24} />                          // 세로 24px 여백
<Spacing size={16} direction="horizontal" />   // 가로 16px 여백
```

---

## 경로 별칭

`@/`는 `src/` 폴더를 가리킵니다:

```tsx
// 이렇게 쓰지 않고
import Button from "../../../components/ui/button";

// 이렇게 씁니다
import { Button } from "@/components/ui";
```

---

## 명령어

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 (http://localhost:5173) |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과물 미리보기 |
| `npm run lint` | 코드 검사 |
