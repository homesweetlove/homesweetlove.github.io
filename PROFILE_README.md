# homesweetlove

**Computer Science undergraduate · Undergraduate researcher**  
Building practical software for **resource-constrained systems**, **mobile experiences**, and **everyday automation**.

컴퓨터공학을 공부하며 직접 겪은 불편을 소프트웨어로 해결합니다. 구현뿐 아니라 성능 측정, 데이터 보호, 검증 범위를 중요하게 생각합니다.

[**Portfolio**](https://homesweetlove.github.io/) · [Projects & case studies](https://homesweetlove.github.io/work.html) · [Resume](https://homesweetlove.github.io/resume.html) · [CV](https://homesweetlove.github.io/cv.html)

---

## Featured projects

| Project | Focus | Current state & evidence |
| --- | --- | --- |
| **[RamFlow](https://github.com/homesweetlove/RamFlow)** · C# / WPF | Foreground-first resource orchestration for Windows, with explicit background controls and memory-aware job scheduling. | [Measured Chrome / VS Code study](https://github.com/homesweetlove/RamFlow/blob/main/docs/REAL_APP_STUDY.ko.md) · [Validation](https://github.com/homesweetlove/RamFlow/blob/main/docs/VALIDATION.md) |
| **[Subject Japan](https://github.com/homesweetlove/Subject-Japan)** · React Native / TypeScript / Kotlin / Swift | Japan travel utilities: shopping phrases, saved sizes, offline-first information, and native translation/OCR integrations. | [Android ARM64 test APK](https://github.com/homesweetlove/Subject-Japan/releases/download/android-test-43793915298/Subject-Japan-android-test-arm64.apk) · [Device verification checklist](https://github.com/homesweetlove/Subject-Japan/blob/main/docs/device-validation.md) |
| **[Luma](https://github.com/homesweetlove/Luma)** · C# / WinUI 3 / WebView2 | Lightweight personal Windows browser with local automation, a local vault, and human-approved AI handoffs. | [Architecture](https://github.com/homesweetlove/Luma/blob/main/docs/ARCHITECTURE.md) · Public **source preview** (no stable installer yet) |
| **[MusicCut](https://github.com/homesweetlove/MusicCut)** · Kotlin / Android | Multitrack audio editing, recording, DSP effects, and optional on-device AI stem separation. | [Android CI](https://github.com/homesweetlove/MusicCut/actions/workflows/android.yml) · Open-source development preview |

### Engineering in practice: RamFlow

In a controlled **single-PC** study with synthetic background contention, four foreground Chrome / VS Code workflows showed **45–49% lower median p95 latency** across five paired blocks per workflow. The study covered **1,200 feature operations** and recorded the cost to background throughput. 

[Study details](https://github.com/homesweetlove/RamFlow/blob/main/docs/REAL_APP_STUDY.ko.md) · [Raw trial data](https://github.com/homesweetlove/RamFlow/blob/main/docs/evidence/2026-11-10-real-apps/trials.csv)

## Other public work

- **[YeaAnBus Open Source](https://github.com/homesweetlove/YeaAnBus-OpenSource)** — Andong–Yecheon bus information Android app; portfolio-oriented public code without private API credentials.
- **[IDEONQ Clinic](https://github.com/homesweetlove/ideonq-clinic)** — interactive clinic workflow UI showcase using **synthetic data only**. [Live demo](https://ideonq-clinic.vercel.app).
- **[Daily IT News](https://github.com/homesweetlove/Daily_IT_News)** — sourced IT / AI / security news notes in Korean, with English editions for available dates.
- **[Payroll Manager](https://github.com/homesweetlove/payroll-manager)** — TypeScript web app for attendance-based payroll calculations and spreadsheet exports.
- **[Club Recruitment](https://github.com/homesweetlove/club_recruitment)** — static club introduction, recruitment, and study archive website.

## Research in progress

Exploring **surface EMG-based elbow-angle estimation** with public datasets, focusing on cross-subject generalization, calibration requirements, and low-latency inference. This is ongoing undergraduate research, not a published performance claim.

[Research and project notes](https://homesweetlove.github.io/work.html#semg) · [Labs & tools](https://homesweetlove.github.io/labs.html)

---

<sub>I try to distinguish implemented features, automated test results, and real-device validation. Preview builds are labeled as previews.</sub>
