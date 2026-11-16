[![English](https://img.shields.io/badge/README-English-24292f?style=for-the-badge)](./README.md) [![한국어](https://img.shields.io/badge/README-%ED%95%9C%EA%B5%AD%EC%96%B4-24292f?style=for-the-badge)](./README.ko.md)

# homesweetlove.github.io

A lightweight, bilingual portfolio of verified engineering work, open-source projects, research notes and useful browser tools.

**Live site:** https://homesweetlove.github.io/

## Main pages

| Page | Contents |
| --- | --- |
| [Home](index.html) | Featured work, RamFlow measurement visualization, selected public projects and contact |
| [Engineering case studies](work.html) | RamFlow, Luma, Subject Japan, sEMG elbow-angle research and additional public projects |
| [Labs & tools](labs.html) | Android apps, web demos, writing tools, coursework and bilingual IT news |
| [Resume](resume.html) · [CV](cv.html) | Concise and extended engineering background |
| [Browser tools](tools.html) | Local-first document and text utilities |

## Accurate project status

- **RamFlow:** MIT-licensed Windows source with a reproducible, single-PC Chrome/VS Code study. Its 45–49% lower median p95 foreground latency was measured under specified synthetic contention, accompanied by a background-throughput cost.
- **Subject Japan:** MIT-licensed source and ARM64 Android **test-signed** APK. Real-device NFC, camera, microphone and translation checks are not claimed as complete.
- **Luma:** MIT-licensed WinUI 3/WebView2 browser **source preview**; no stable installer.
- **YeaAnBus Open Source:** Public Android portfolio source, without private API credentials; real-device and API setup remain separate.
- **IDEONQ Clinic:** Fictional-data-only interactive UI demo, not an operational medical system.
- **sEMG research:** Ongoing continuous elbow-angle regression using public datasets; no unverified accuracy or robot-control claims.

The featured portfolio is **curated in static HTML**. It does not automatically turn every new repository into a featured case study. Some page widgets fetch public GitHub metadata when available.

## Development and deployment

This is a static GitHub Pages site using HTML, CSS and JavaScript; no site build step or server-side service is required.

1. Edit `index.html`, `work.html`, `labs.html` and the appropriate `assets/*.css` or `assets/*.js` files.
2. Check links, mobile layout, keyboard navigation and light/dark themes.
3. Commit to `main`; the user-site repository is deployed at `https://homesweetlove.github.io/` by GitHub Pages.

The productivity utilities run in the browser; read their individual pages before relying on format conversion or persistent browser storage. This repository does not host the private backend of IDEONQ Clinic or any private API credentials.

## Source organization

- `assets/home.css`, `assets/home.js`, `assets/ramflow-chart.js` — portfolio presentation and measurements
- `assets/style.css`, `assets/i18n.js` — shared styling and Korean/English switching
- `tools.html`, `pdf-tools.html`, `readme-generator.html` — standalone browser tools
- `PROFILE_README.md` — snapshot of the separate [GitHub profile README](https://github.com/homesweetlove/homesweetlove)

Last portfolio-content review: **November 16, 2026**.
