# GitHub Copilot Instructions

## Project Overview
- This repository contains PHP-based websites under `memosite.jp` and `mahjong.cloudfree.jp`.
- Primary app structure for memosite: `memosite.jp/public_html/`.
- Shared includes live in `memosite.jp/public_html/includes/`.

## Coding Conventions
- Keep changes small and focused; do not refactor unrelated files.
- Follow existing style in each file (indentation, naming, inline HTML/PHP mix).
- Prefer updating existing helper functions instead of duplicating logic.
- Avoid adding new dependencies unless explicitly requested.
- Write content in Japanese when editing user-facing text.

## PHP Page Patterns
- Typical page header setup:
  - `require_once '../includes/head.php';`
  - `require_once '../includes/common.php';`
  - optional ad/image helpers from `includes/`.
- Use existing rendering helpers when available:
  - `renderHead($title, $description, $keywords, $canonical)`
  - `renderNavigation($active)` — keys: `home`, `memo`, `clock`, `vocabulary`, `game`, `protype`
  - `renderFooter()`
  - `renderA8Ad()`
  - `renderImage(...)`
  - `renderBreadcrumb($items)` — from `article-helper.php`
  - `renderArticleHeader($title, $lead, $tags, $filePath)` — from `article-helper.php`
  - `renderBreadcrumbJsonLd($items)` — from `article-helper.php`

## Adding New Articles
- Copy `memo/voice/_template.php` as a starting point for new articles.
- Update meta fields: `$title`, `$description`, `$keywords`, `$canonical`, `$tags`, `$lead`.
- Add the article to `includes/voice-articles.php` in the `getVoiceArticles()` array.
- Use `page-content` class on `<main>` for consistent layout.
- Use shared CSS classes: `content-grid`, `content-card`, `tag`, `article-tags`, `breadcrumb`.

## Navigation Keys
- All memo/voice/* and memo/sdv/* pages use `renderNavigation('memo')`.
- Home: `'home'` | Clock: `'clock'` | Game: `'game'` | Protype: `'protype'`

## CSS Architecture
- `assets/css/app.css` — shared design system (variables, components, layout).
- `assets/css/custom.css` — home page card customizations.
- Shared component classes: `.page-content`, `.content-grid`, `.content-card`, `.tag`, `.breadcrumb`.
- Do NOT duplicate styles in per-page `<style>` blocks — use shared CSS.

## Assets and Images
- Prefer `.jxl` image assets where already migrated.
- Keep image paths consistent with current file naming (example: `image.png.jxl`).
- Do not reintroduce removed legacy formats unless asked.

## Safety and Validation
- Before finalizing PHP edits, run lint for changed files when possible.
- Existing task available in workspace:
  - `PHP Lint new SafeEar article`
- Preserve production-safe behavior and avoid breaking includes/require paths.

## Deployment Awareness
- This repo is used with FTP/SFTP workflows.
- Be careful with absolute URLs and relative include paths.
- Keep generated/debug files out of public pages unless explicitly required.
- After edits, update copilot instructions if new patterns or conventions are introduced.
- After edits, git commit with clear messages for deployment.
