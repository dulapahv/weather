# Contributing

Thanks for your interest! This is a small codebase, so the contributing process is meant to be lightweight.

## Setup

Check the [README](README.md#getting-started) for full details, but the short version is: you need **Node.js 20+** and **pnpm**. Run `pnpm install` then `pnpm dev`. Zero environment variables or API keys are required.

## Branches

- `develop`: The default branch. Auto-deploys to [dev](https://weather-dev.dulapahv.dev).
- `main`: Auto-deploys to [production](https://weather.dulapahv.dev).

Always branch off `develop` and target your PRs there. Code only merges to `main` after it's tested in the dev environment.

## Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat:`, `fix:`, `chore:`). Husky and commitlint will enforce this locally. A pre-commit hook automatically runs Prettier and ESLint on your staged files, catching most style issues before you even push. Keep commits small and focused on one logical change.

## Before opening a PR

CI runs three quality gates on every PR (verify, e2e, and lighthouse). Save yourself a wait and run them locally first:

```bash
pnpm format      # Prettier check
pnpm lint        # ESLint
pnpm test        # Unit + integration (90% line coverage required)
pnpm test:e2e    # Playwright + axe accessibility scan
```

Your PR description will auto-fill from the [pull request template](.github/PULL_REQUEST_TEMPLATE.md). Fill in each section and work through its checklist (it mirrors the CI gates above).

## Conventions

Match these patterns to keep the codebase consistent:

- **Co-location:** Components live in their own folders alongside their styles and tests (e.g., `Component/{Component.tsx, Component.module.scss, Component.test.tsx}`).
- **Tests ship with the feature:** Include tests for new logic or components in the same PR, not as a follow-up.
- **Theming:** Use CSS custom properties tied to `data-theme` for anything color-related. Reserve SCSS variables strictly for static layout constants like spacing and breakpoints.
- **Data access:** The client never calls upstream APIs directly. All traffic routes through our Route Handlers (`src/app/api/`) and is strictly validated using Zod (`src/lib/schemas/`).
- **Accessibility is required:** Interactive elements must be keyboard-navigable and properly labeled. The E2E suite runs a strict axe-core scan for WCAG 2.2 AA compliance, and regressions will fail the build.

## Bugs, ideas, and questions

Open an issue! The [bug report](.github/ISSUE_TEMPLATE/bug_report.md) and [feature request](.github/ISSUE_TEMPLATE/feature_request.md) templates will guide you through what to include.
