# homesweetlove

Computer Science undergraduate building reliable, resource-aware software.
I focus on **systems engineering**, and extend that work into desktop automation, mobile products, and human-centered research.

**What I care about:** understanding constraints, documenting trade-offs, protecting user work, and validating behavior instead of listing features.

## Selected engineering work

| Project | Engineering question | Evidence |
| --- | --- | --- |
| [RamFlow](https://github.com/homesweetlove/RamFlow) | How can a constrained Windows PC manage resources without disrupting active work? | [Case study](https://github.com/homesweetlove/RamFlow/blob/main/docs/ENGINEERING_CASE_STUDY.md) · [Validation](https://github.com/homesweetlove/RamFlow/blob/main/docs/VALIDATION.md) |
| [Claude/Codex Usage Widget](https://github.com/homesweetlove/ClaudeCodexUsageWidget) | What can be displayed from local usage metadata without triggering model requests? | Local-first utility · unavailable-data handling |
| [Payroll Manager](https://github.com/homesweetlove/payroll-manager) | How should attendance inputs and wage-calculation rules be organized in a web application? | React / TypeScript application |

## RamFlow: from resource contention to measured response

Implemented explicit background priority/EcoQoS control, a memory-aware job queue, and a lightweight tray that keeps the engine running after WPF closes.

In five paired sessions per app on one PC, a generated dashboard in real Chrome and a generated TypeScript document in real VS Code were exercised under fixed synthetic background CPU/memory contention. Feature p95 medians decreased **45–49%**, with improvements in **5/5 pairs for all four features**. Background processing rate decreased about **60%** as those jobs yielded resources to foreground work. All **1,200 feature operations** completed with correctness and resource restoration verified.

**[Measured results](https://github.com/homesweetlove/RamFlow/blob/main/docs/REAL_APP_STUDY.ko.md)** · [Per-block CSV](https://github.com/homesweetlove/RamFlow/blob/main/docs/evidence/2026-11-10-real-apps/trials.csv) · [Implementation and validation](https://github.com/homesweetlove/RamFlow/blob/main/docs/VALIDATION.md)

## Beyond the core

- **Desktop / AI automation:** [Luma design notes](https://homesweetlove.github.io/work.html#luma) (private project)
- **Mobile UX / data reliability:** [Subject Japan design notes](https://homesweetlove.github.io/work.html#subject-japan) (private project)
- **Biosignal research:** [sEMG fatigue analysis](https://homesweetlove.github.io/work.html#semg) (undergraduate research in progress)

**[Portfolio](https://homesweetlove.github.io/)** · **[Case Studies](https://homesweetlove.github.io/work.html)** · **[Resume](https://homesweetlove.github.io/resume.html)** · **[CV](https://homesweetlove.github.io/cv.html)** · **[Labs & Tools](https://homesweetlove.github.io/labs.html)**

<sub>Featured work is selected for clear engineering decisions and verifiable evidence.</sub>
