[![English](https://img.shields.io/badge/README-English-24292f?style=for-the-badge)](./README.md) [![한국어](https://img.shields.io/badge/README-%ED%95%9C%EA%B5%AD%EC%96%B4-24292f?style=for-the-badge)](./README.ko.md)

# homesweetlove.github.io

실측 근거가 있는 개발 사례, 공개 프로젝트, 연구 기록, 브라우저 도구를 정리한 한국어·영어 개인 포트폴리오입니다.

**배포 주소:** https://homesweetlove.github.io/

## 주요 페이지

| 페이지 | 내용 |
| --- | --- |
| [홈](index.html) | 대표 작업, RamFlow 측정 시각화, 추가 공개 프로젝트, 연락처 |
| [기술 사례](work.html) | RamFlow, Luma, Subject Japan, sEMG 팔꿈치 각도 연구 |
| [실험실과 도구](labs.html) | Android 앱, 웹 데모, 생산성 도구, 수업 코드, 한·영 IT 뉴스 |
| [이력서](resume.html) · [CV](cv.html) | 간단 이력과 확장 기술 경험 |
| [브라우저 도구](tools.html) | 로컬 우선 문서·텍스트 유틸리티 |

## 프로젝트 공개 상태

- **RamFlow:** MIT 공개 소스. 단일 PC·합성 부하의 Chrome/VS Code 실험에서 기능별 p95 중앙 지연이 45~49% 감소했으며, 배경 처리량 감소도 함께 공개합니다.
- **Subject Japan:** MIT 공개 소스 및 ARM64 Android 개발용 서명 테스트 APK. 실기기 NFC·카메라·마이크 검증을 완료했다고 주장하지 않습니다.
- **Luma:** WinUI 3/WebView2 기반 MIT 공개 소스 프리뷰. 안정적인 Windows 설치 파일은 아직 없습니다.
- **YeaAnBus Open Source:** 개인 API 키를 제외한 Android 포트폴리오 공개본. 실기기·승인 API 검증은 별도입니다.
- **IDEONQ Clinic:** 가상 데이터만 사용하는 웹 UI 데모이며 실제 의료기관 운영 시스템이 아닙니다.
- **sEMG 연구:** 공개 데이터 기반 팔꿈치 관절각 연속 회귀 연구 진행 중. 검증되지 않은 정확도·로봇 제어 성능은 주장하지 않습니다.

메인 프로젝트 카드는 **정적 HTML에서 직접 선별**하며, 새 저장소가 생긴다고 자동으로 대표 프로젝트가 바뀌지는 않습니다. 일부 화면은 GitHub 공개 메타데이터를 조회할 수 있습니다.

## 편집과 배포

별도의 빌드 과정이나 서버가 필요 없는 GitHub Pages 정적 사이트입니다.

1. `index.html`, `work.html`, `labs.html`과 관련 `assets/` 파일을 수정합니다.
2. 모바일·키보드 조작·라이트/다크 모드·외부 링크를 점검합니다.
3. `main`에 커밋하면 GitHub Pages로 배포됩니다.

브라우저 생산성 도구는 페이지별 저장·변환 범위를 확인하고 사용하세요. 이 저장소에는 IDEONQ Clinic의 비공개 운영 백엔드나 개인 API 키가 포함되지 않습니다.

## 주요 파일

- `assets/home.css`, `assets/home.js`, `assets/ramflow-chart.js` — 홈 디자인과 실측 데이터
- `assets/style.css`, `assets/i18n.js` — 공통 스타일 및 언어 전환
- `tools.html`, `pdf-tools.html`, `readme-generator.html` — 웹 유틸리티
- `PROFILE_README.md` — 별도 [GitHub 프로필 README](https://github.com/homesweetlove/homesweetlove) 복사본

최종 콘텐츠 점검: **2026년 11월 16일**.
