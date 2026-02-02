# Implementation Report: Extension Policy Enforcement
**Date:** 2026-02-01
**Sequence:** 04
**Status:** In Progress

## 1. Objectives
Implement security guardrails to prevent Cross-Site Scripting (XSS) from untrusted Content Repositories.
*   **Default Policy**: STRICT. No `<script>` tags, no `javascript:` links, no remote code loading.
*   **Opt-In Policy**: `allowScripts: true`. Allows standard HTML execution (for trusted repos).

## 2. Design
### Configuration
*   Add `allowScripts` boolean to `config.json`.
*   Default: `false`.

### Sanitization Strategy
*   Use **`rehype-sanitize`** plugin for `react-markdown`.
*   **Logic**:
    *   If `config.allowScripts` is `false`: Add `rehype-sanitize` to the plugin list. Use the default GitHub schema (strips scripts, iframes, etc.).
    *   If `config.allowScripts` is `true`: Omit `rehype-sanitize` (allowing `rehype-raw` to render full HTML).

## 3. Implementation Details
### Dependencies
*   `npm install rehype-sanitize`

### Code Changes
*   **`src/App.js`**:
    *   Read `allowScripts` from config.
    *   Construct `rehypePlugins` array dynamically.
    *   Pass `rehypePlugins` to `<ReactMarkdown>` components.
*   **Templates**: Ensure all templates using `ReactMarkdown` accept and use the updated plugin list.

## 4. Verification Plan
*   **Test A (Sanitized)**:
    1.  Content: `docs/xss_test.md` containing `<script>alert("XSS")</script>` and `<img onerror="alert(1)" src=x>`.
    2.  Config: `allowScripts: false`.
    3.  Result: No alert. HTML is stripped or encoded.
*   **Test B (Unsanitized)**:
    1.  Config: `allowScripts: true`.
    2.  Result: Alert executes (or image error triggers).
