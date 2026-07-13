# Product Manager to Builder Blog Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Publish an externally safe first-person blog post about using Codex to turn an Agent Runtime product idea into a verified TKE demo.

**Architecture:** Add one VitePress Markdown post, register it in the post index and sidebar, then validate the static build and scan for internal identifiers. Keep the existing `.obsidian/` directory out of the change set.

**Tech Stack:** Markdown, VitePress, TypeScript configuration, npm.

---

### Task 1: Write the article

**Files:**
- Create: `docs/posts/2026/product-manager-to-builder-with-codex.md`

1. Write first-person narrative using the approved structure.
2. Include only final benchmark values and their scope limitations.
3. Explain Codex goal-driven collaboration and the human judgment boundary.
4. Scan the article for cluster IDs, IPs, internal URLs, credentials and customer names.

### Task 2: Register the article

**Files:**
- Modify: `docs/posts/index.md`
- Modify: `docs/.vitepress/config.ts`

1. Add the article as the newest 2026 entry.
2. Add a matching top sidebar item.
3. Verify the route and title match the filename and frontmatter.

### Task 3: Verify and publish

**Files:**
- Verify: `docs/posts/2026/product-manager-to-builder-with-codex.md`
- Verify: `docs/posts/index.md`
- Verify: `docs/.vitepress/config.ts`

1. Run `npm run docs:build`; expect success.
2. Run `git diff --check`; expect no output.
3. Inspect the targeted diff and confirm `.obsidian/` is not staged.
4. Commit only the article, index and sidebar changes.
5. Push `main` to `origin` and verify the remote commit.

