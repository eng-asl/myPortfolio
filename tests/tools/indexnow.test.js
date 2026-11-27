import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  DEFAULT_KEY,
  DEFAULT_ORIGIN,
  buildIndexNowPayload,
  canonicalHtmlFingerprint,
  computePagesBranchChangedUrls,
  computeSourceChangedUrls,
  extractSitemapUrls,
  isEligiblePublicUrl
} from "../../scripts/indexnow-notify.mjs";

function writeFile(filePath, content) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, content.replace(/\r\n?/g, "\n"), "utf8");
}

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

test("IndexNow verification key file exists with exact 32-char hex contents and LF/no-CR bytes", () => {
  const keyPath = path.join("public", `${DEFAULT_KEY}.txt`);
  assert.ok(existsSync(keyPath), `missing IndexNow key file at ${keyPath}`);
  assert.match(DEFAULT_KEY, /^[a-f0-9]{32}$/);

  const raw = readFileSync(keyPath);
  assert.equal(raw.includes(13), false, "key file must not contain CR bytes");
  assert.equal(raw.includes(10), false, "key file must not contain extra newlines");
  assert.equal(raw.toString("utf8"), DEFAULT_KEY);
});

test("isEligiblePublicUrl accepts canonical public docs and rejects internal, draft, or foreign URLs", () => {
  for (const okUrl of [
    `${DEFAULT_ORIGIN}/`,
    `${DEFAULT_ORIGIN}/notes/`,
    `${DEFAULT_ORIGIN}/notes/security/footprinting/ftp/`,
    `${DEFAULT_ORIGIN}/notes/security/footprinting/ftp.md`,
    `${DEFAULT_ORIGIN}/llms.txt`,
    `${DEFAULT_ORIGIN}/llms-full.txt`
  ]) {
    assert.equal(isEligiblePublicUrl(okUrl), true, `expected eligible: ${okUrl}`);
  }

  for (const badUrl of [
    `${DEFAULT_ORIGIN}/api/health`,
    `${DEFAULT_ORIGIN}/work/ui-preview/sample/`,
    `${DEFAULT_ORIGIN}/concepts/mobile-hero.html`,
    `${DEFAULT_ORIGIN}/writing/welcome-to-field-notes/`,
    `${DEFAULT_ORIGIN}/_next/static/chunks/main.js`,
    `${DEFAULT_ORIGIN}/404.html`,
    `${DEFAULT_ORIGIN}/${DEFAULT_KEY}.txt`,
    `${DEFAULT_ORIGIN}/robots.txt`,
    `${DEFAULT_ORIGIN}/sitemap.xml`,
    `${DEFAULT_ORIGIN}/notes/overthewire-bandit-workflow/`,
    `${DEFAULT_ORIGIN}/notes/overthewire-bandit-workflow.md`,
    `${DEFAULT_ORIGIN}/notes/reliable-sensor-to-flutter-pipeline/`,
    "https://example.com/notes/security/footprinting/ftp/"
  ]) {
    assert.equal(isEligiblePublicUrl(badUrl), false, `expected rejected: ${badUrl}`);
  }
});

test("canonicalHtmlFingerprint ignores Next.js asset hashes and class hashes while detecting real content edits", () => {
  const baseHtml = `<!DOCTYPE html><html><head>
    <title>FTP Notes</title>
    <meta name="description" content="FTP guide" />
    <link rel="canonical" href="https://eng-asl.com/notes/security/footprinting/ftp/" />
    <link rel="alternate" type="text/markdown" href="https://eng-asl.com/notes/security/footprinting/ftp.md" />
    <script type="application/ld+json">{"@type":"TechArticle","headline":"FTP Notes"}</script>
    <script src="/_next/static/chunks/app-111111.js"></script>
  </head><body>
    <header class="hdr_a1">Nav</header>
    <main class="main_a1"><h1 class="h1_a1">FTP Notes</h1><p class="p_a1">Port 21 control channel.</p><script>self.__next_f.push([1,"chunk-1111"])</script></main>
  </body></html>`;

  const hashChurnOnlyHtml = `<!DOCTYPE html><html><head>
    <title>FTP Notes</title>
    <meta name="description" content="FTP guide" />
    <link rel="canonical" href="https://eng-asl.com/notes/security/footprinting/ftp/" />
    <link rel="alternate" type="text/markdown" href="https://eng-asl.com/notes/security/footprinting/ftp.md" />
    <script type="application/ld+json">{"@type":"TechArticle","headline":"FTP Notes"}</script>
    <script src="/_next/static/chunks/app-999999.js"></script>
  </head><body>
    <header class="hdr_z9">Nav</header>
    <main class="main_z9"><h1 class="h1_z9">FTP Notes</h1><p class="p_z9">Port 21 control channel.</p><script>self.__next_f.push([1,"chunk-9999"])</script></main>
  </body></html>`;

  const updatedTextHtml = baseHtml.replace("Port 21 control channel.", "Port 21 control and port 20 data channels.");
  const updatedJsonLdHtml = baseHtml.replace('"headline":"FTP Notes"', '"headline":"FTP and vsFTPd Notes"');

  assert.equal(canonicalHtmlFingerprint(baseHtml), canonicalHtmlFingerprint(hashChurnOnlyHtml));
  assert.notEqual(canonicalHtmlFingerprint(baseHtml), canonicalHtmlFingerprint(updatedTextHtml));
  assert.notEqual(canonicalHtmlFingerprint(baseHtml), canonicalHtmlFingerprint(updatedJsonLdHtml));
});

test("computePagesBranchChangedUrls detects added, removed, genuinely updated HTML, and changed Markdown while skipping chunk-only rebuilds", () => {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), "asl-indexnow-pages-"));
  try {
    git(tmpDir, ["init"]);
    git(tmpDir, ["config", "user.name", "Test"]);
    git(tmpDir, ["config", "user.email", "test@example.com"]);

    const makeSitemap = (urls) =>
      `<?xml version="1.0" encoding="UTF-8"?><urlset>${urls
        .map((u) => `<url><loc>${u}</loc></url>`)
        .join("")}</urlset>`;

    const wrapHtml = (title, body, chunkId = "111") =>
      `<html><head><title>${title}</title><script src="/_next/static/chunks/${chunkId}.js"></script></head><body><main class="m_${chunkId}"><h1>${title}</h1><p>${body}</p></main></body></html>`;

    writeFile(
      path.join(tmpDir, "sitemap.xml"),
      makeSitemap([
        `${DEFAULT_ORIGIN}/`,
        `${DEFAULT_ORIGIN}/about/`,
        `${DEFAULT_ORIGIN}/old-page/`
      ])
    );
    writeFile(path.join(tmpDir, "index.html"), wrapHtml("Home", "Initial home", "111"));
    writeFile(path.join(tmpDir, "about", "index.html"), wrapHtml("About", "Unchanged bio", "111"));
    writeFile(path.join(tmpDir, "old-page", "index.html"), wrapHtml("Old", "Will be removed", "111"));
    writeFile(path.join(tmpDir, "notes", "security", "footprinting", "ftp.md"), "# FTP\nInitial\n");
    writeFile(path.join(tmpDir, "llms.txt"), "# Index\nInitial\n");
    git(tmpDir, ["add", "."]);
    git(tmpDir, ["commit", "-m", "base"]);

    writeFile(
      path.join(tmpDir, "sitemap.xml"),
      makeSitemap([
        `${DEFAULT_ORIGIN}/`,
        `${DEFAULT_ORIGIN}/about/`,
        `${DEFAULT_ORIGIN}/notes/security/footprinting/ftp/`
      ])
    );
    writeFile(path.join(tmpDir, "index.html"), wrapHtml("Home", "Updated with FTP link", "222"));
    writeFile(path.join(tmpDir, "about", "index.html"), wrapHtml("About", "Unchanged bio", "222"));
    rmSync(path.join(tmpDir, "old-page"), { recursive: true, force: true });
    writeFile(
      path.join(tmpDir, "notes", "security", "footprinting", "ftp", "index.html"),
      wrapHtml("FTP", "New FTP note", "222")
    );
    writeFile(path.join(tmpDir, "notes", "security", "footprinting", "ftp.md"), "# FTP\nUpdated\n");
    writeFile(path.join(tmpDir, "llms.txt"), "# Index\nUpdated\n");
    git(tmpDir, ["add", "-A"]);
    git(tmpDir, ["commit", "-m", "head"]);

    const { changed, skippedUnchangedHtml } = computePagesBranchChangedUrls({
      cwd: tmpDir,
      baseRef: "HEAD~1",
      headRef: "HEAD"
    });

    assert.equal(skippedUnchangedHtml, 1);
    assert.deepEqual(changed, [
      { url: `${DEFAULT_ORIGIN}/`, change: "updated" },
      { url: `${DEFAULT_ORIGIN}/llms.txt`, change: "updated" },
      { url: `${DEFAULT_ORIGIN}/notes/security/footprinting/ftp.md`, change: "updated" },
      { url: `${DEFAULT_ORIGIN}/notes/security/footprinting/ftp/`, change: "added" },
      { url: `${DEFAULT_ORIGIN}/old-page/`, change: "removed" }
    ]);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("computeSourceChangedUrls maps changes across articles, projects, publications, and tools", () => {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), "asl-indexnow-src-"));
  try {
    git(tmpDir, ["init"]);
    git(tmpDir, ["config", "user.name", "Test"]);
    git(tmpDir, ["config", "user.email", "test@example.com"]);

    writeFile(path.join(tmpDir, "data", "notes", "security", "footprinting", "ftp.ts"), "export const ftp = 1;");
    writeFile(
      path.join(tmpDir, "content", "writing", "secret-draft.md"),
      "---\ntitle: Secret\ndraft: true\n---\nDraft"
    );
    writeFile(path.join(tmpDir, "data", "portfolio.ts"), "export const projects = [];");
    writeFile(path.join(tmpDir, "data", "publications.json"), '{"publications":[]}');
    writeFile(path.join(tmpDir, "data", "tools.js"), "export const engineeringTools = [];");
    git(tmpDir, ["add", "."]);
    git(tmpDir, ["commit", "-m", "base"]);

    writeFile(path.join(tmpDir, "data", "notes", "security", "footprinting", "ftp.ts"), "export const ftp = 2;");
    writeFile(
      path.join(tmpDir, "content", "writing", "secret-draft.md"),
      "---\ntitle: Secret\ndraft: true\n---\nEdited draft"
    );
    writeFile(path.join(tmpDir, "data", "portfolio.ts"), "export const projects = [{ slug: 'p1' }];");
    writeFile(path.join(tmpDir, "data", "publications.json"), '{"publications":[{"id":"1"}]}');
    writeFile(path.join(tmpDir, "data", "tools.js"), "export const engineeringTools = [{ id: 't1' }];");
    git(tmpDir, ["add", "."]);
    git(tmpDir, ["commit", "-m", "update"]);

    const { changed } = computeSourceChangedUrls({
      cwd: tmpDir,
      baseRef: "HEAD~1",
      headRef: "HEAD"
    });
    const urls = changed.map((c) => c.url);

    for (const expectedUrl of [
      `${DEFAULT_ORIGIN}/`,
      `${DEFAULT_ORIGIN}/ar/`,
      `${DEFAULT_ORIGIN}/about/`,
      `${DEFAULT_ORIGIN}/ar/about/`,
      `${DEFAULT_ORIGIN}/work/`,
      `${DEFAULT_ORIGIN}/ar/work/`,
      `${DEFAULT_ORIGIN}/tools/`,
      `${DEFAULT_ORIGIN}/ar/tools/`,
      `${DEFAULT_ORIGIN}/notes/`,
      `${DEFAULT_ORIGIN}/notes/security/`,
      `${DEFAULT_ORIGIN}/notes/security/footprinting/`,
      `${DEFAULT_ORIGIN}/notes/security/footprinting/ftp/`,
      `${DEFAULT_ORIGIN}/notes/security/footprinting/ftp.md`,
      `${DEFAULT_ORIGIN}/llms.txt`,
      `${DEFAULT_ORIGIN}/llms-full.txt`
    ]) {
      assert.ok(urls.includes(expectedUrl), `expected URL in source diff: ${expectedUrl}`);
    }
    assert.equal(urls.some((u) => u.includes("secret-draft")), false, "draft note edit must not emit URL");

    const payload = buildIndexNowPayload({ urls });
    assert.equal(payload.host, "eng-asl.com");
    assert.equal(payload.key, DEFAULT_KEY);
    assert.equal(payload.keyLocation, `${DEFAULT_ORIGIN}/${DEFAULT_KEY}.txt`);
    assert.deepEqual(extractSitemapUrls(`<urlset><url><loc>${DEFAULT_ORIGIN}/</loc></url></urlset>`), [`${DEFAULT_ORIGIN}/`]);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("GitHub deployment workflows integrate scripts/indexnow-notify.mjs", () => {
  const sourceWorkflow = readFileSync(path.join(".github", "workflows", "deploy-pages.yml"), "utf8");
  const pagesBranchWorkflow = readFileSync(
    path.join("scripts", "pages-branch-workflows", "indexnow.yml"),
    "utf8"
  );

  assert.ok(sourceWorkflow.includes("scripts/indexnow-notify.mjs"));
  assert.ok(sourceWorkflow.includes("notify-indexnow:"));
  assert.ok(pagesBranchWorkflow.includes("pages-build-deployment"));
  assert.ok(pagesBranchWorkflow.includes("indexnow-notify.mjs"));
});
