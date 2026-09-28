# my_dev.io

개인 포트폴리오 / 홈페이지 (GitHub Pages)

## 미리보기

`index.html`을 브라우저로 열거나, GitHub Pages로 배포하면 바로 확인할 수 있습니다.

## GitHub Pages 배포 방법

1. 이 저장소의 **Settings → Pages**로 이동합니다.
2. **Source**를 `main` 브랜치(혹은 사용 중인 기본 브랜치), 폴더는 `/ (root)`로 설정합니다.
3. 저장하면 `https://homesweetlove.github.io/my_dev.io/` 주소로 사이트가 배포됩니다.

## 최신 상태

페이지는 GitHub API에서 저장소와 사용 언어를 실시간으로 읽으며, API를 사용할 수 없을 때만 아래 HTML의 정적 폴백을 표시합니다.

## 내용

GitHub 계정(`@homesweetlove`)의 실제 공개 정보(아바타, bio, 공개 저장소 목록, 사용 언어)를 기반으로 채워져 있습니다.

- `index.html` — 페이지 구조 및 텍스트 콘텐츠
- `assets/style.css` — 색상, 폰트, 레이아웃 등 디자인
- `assets/script.js` — GitHub API 연동, 인터랙션, 애니메이션
- `tools.html` — 직장인을 위한 개인정보 비저장 업무 도구 허브
- `assets/tools.css`, `assets/tools.js` — 문서 작성/자동 저장/한글·Word 호환 저장/PDF 인쇄, JSON, 텍스트, 시간 변환, 집중 타이머

### 문서 스튜디오

`tools.html`의 문서 스튜디오는 별도 서버 없이 GitHub Pages에서 브라우저만으로 동작합니다. 작성 내용은 `localStorage`에만 저장되며, 한글과 Word에서 열 수 있는 `.doc` 호환 파일, HTML, Markdown, TXT로 내보낼 수 있습니다. PDF는 브라우저의 인쇄 대화상자에서 `PDF로 저장`을 선택합니다. `문서/HWP 열기`로 HWP 5.0/5.1 문서를 읽기 전용 미리보기로 열 수 있으며, 이때도 파일은 서버로 전송되지 않습니다. HWP 문서의 편집 및 HWP 바이너리 재저장은 브라우저용 뷰어의 범위를 넘어가므로 지원하지 않습니다.

### 실시간 GitHub 연동

페이지를 열면 `assets/script.js`가 GitHub REST API(`api.github.com/users/homesweetlove`,
`.../repos`)를 브라우저에서 직접 호출해서 아래 영역을 **실시간으로** 채웁니다.
새 저장소를 만들거나 기존 저장소를 업데이트하면 코드 수정 없이 사이트에 자동 반영됩니다.

- `#projects` — 최근 업데이트된 공개 저장소 카드 (언어별 필터 포함)
- `#skills`의 Languages — 저장소에서 실제로 사용된 언어 자동 집계
- `#about`의 통계 카드 — Public Repos / Languages Used / Year on GitHub
- `#activity` — 최근 업데이트된 저장소 목록
- `#contributions` — [ghchart](https://github.com/RayHY/github-contribution-chart-generator) 잔디 그래프

GitHub API 요청이 실패하거나(오프라인, API rate limit 등) 느릴 경우에는 `index.html`에
하드코딩된 정적 콘텐츠가 그대로 보이도록 폴백 처리되어 있습니다 (`#projects`, `#activity`의
기존 마크업이 폴백 역할). 새 저장소를 추가했을 때 폴백 콘텐츠도 맞추고 싶다면 해당 섹션의
정적 카드를 직접 수정하면 됩니다.

## GitHub 프로필 README

`PROFILE_README.md` 파일은 GitHub 프로필 페이지(예: `github.com/homesweetlove`)에 표시되는
소개 카드용 템플릿입니다. 적용하려면:

1. `homesweetlove/homesweetlove`라는 이름의 새 저장소를 만듭니다 (본인의 GitHub 아이디와 동일한 이름, public).
2. `PROFILE_README.md`의 내용을 그 저장소의 `README.md`로 붙여넣습니다.
3. 커밋하면 프로필 페이지 상단에 자동으로 표시됩니다.

원하시면 이 저장소도 대신 만들어 드릴 수 있습니다.

## 디자인 / 인터랙션

- 다크/라이트 모드 자동 감지 + 수동 토글
- 보라~시안 그라디언트 포인트 컬러의 미니멀 개발자 스타일
- Inter / JetBrains Mono 폰트
- 스크롤 시 요소가 나타나는 reveal 애니메이션 (`prefers-reduced-motion` 존중)
- 프로젝트 카드 마우스 틸트(3D 기울임) 효과
- 언어별 프로젝트 필터
- 빌드 도구 없이 순수 HTML/CSS/JS로 작성 (별도 설치 불필요)
