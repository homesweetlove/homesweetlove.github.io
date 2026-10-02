[![English](https://img.shields.io/badge/README-English-24292f?style=for-the-badge)](./README.md) [![한국어](https://img.shields.io/badge/README-%ED%95%9C%EA%B5%AD%EC%96%B4-24292f?style=for-the-badge)](./README.ko.md)

# homesweetlove.github.io

Personal portfolio / homepage hosted with GitHub Pages.

**Site: https://homesweetlove.github.io**

## Preview

Open `index.html` in a browser or deploy with GitHub Pages.

## GitHub Pages Deployment

This repository is a **user-site repository** in the `<username>.github.io` format, so it is deployed at the root URL without an extra subpath.

1. Open **Settings → Pages** for this repository.
2. Set **Source** to the `main` branch and `/ (root)` folder.
3. Push to `main`; the site is usually updated at `https://homesweetlove.github.io` within a few minutes.

> The old URL `https://homesweetlove.github.io/my_dev.io/` is no longer used after the repository rename.

## Current Behavior

The page reads repositories and language usage from the GitHub API in real time. Static HTML fallback content is shown only when the API is unavailable.

## Contents

The site is populated from public information for the GitHub account (`@homesweetlove`), including the avatar, bio, public repositories, and used languages.

- `index.html` — page structure and text content
- `assets/style.css` — colors, fonts, layout, and visual design
- `assets/script.js` — GitHub API integration, interactions, and animation
- `tools.html` — privacy-preserving productivity-tool hub
- `assets/tools.css`, `assets/tools.js` — document editing/autosave, Hangul/Word-compatible export, PDF print, JSON/text/time utilities, focus timer

### Document Studio

The document studio in `tools.html` runs entirely in the browser on GitHub Pages without a separate server. Drafts are stored only in `localStorage` and can be exported as Hangul/Word-readable `.doc`-compatible files, HTML, Markdown, or TXT. To create a PDF, choose `Save as PDF` from the browser print dialog.

`Open Document/HWP` can open HWP 5.0/5.1 documents in read-only preview mode without uploading the file to a server. Editing or re-saving HWP binary files is outside the scope of the browser viewer and is not supported.

### Live GitHub Integration

When the page opens, `assets/script.js` calls GitHub REST API endpoints such as `api.github.com/users/homesweetlove` and the repositories endpoint directly from the browser.

The following sections are populated **in real time**, so new or updated repositories can appear without editing the site code:

- `#projects` — recently updated public repository cards with language filters
- Languages under `#skills` — automatically aggregated from repository language data
- Statistics cards under `#about` — Public Repos / Languages Used / Year on GitHub
- `#activity` — recently updated repositories
- `#contributions` — [ghchart](https://github.com/RayHY/github-contribution-chart-generator) contribution graph

If GitHub API requests fail, are rate-limited, or are slow, existing hard-coded markup in `index.html` is kept as fallback content. To keep fallback content synchronized after adding new repositories, update the static cards manually.

## GitHub Profile README

This site is the main introduction page, and a separate profile README repository (`homesweetlove/homesweetlove`) is not currently used.

`PROFILE_README.md` remains as a template that can be moved into a profile README repository later.

## Design / Interaction

- Automatic dark/light mode detection + manual toggle
- Minimal developer-oriented design with purple-to-cyan gradient accents
- Inter / JetBrains Mono fonts
- Reveal-on-scroll animation with `prefers-reduced-motion` support
- 3D mouse-tilt effect on project cards
- Project filtering by language
- Pure HTML/CSS/JS with no build tool or installation required
