import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const read = (filePath) => readFileSync(filePath, "utf8");
const readBytes = (filePath) => readFileSync(filePath);

test("published Markdown endpoints exist, exclude drafts, use LF, and omit em/en dashes", () => {
  const ftpMdPath = join("public", "notes", "security", "footprinting", "ftp.md");

  assert.ok(existsSync(ftpMdPath), "missing public/notes/security/footprinting/ftp.md");

  for (const removedOrDraft of [
    "welcome-to-field-notes.md",
    "overthewire-bandit-workflow.md",
    "reliable-sensor-to-flutter-pipeline.md"
  ]) {
    assert.equal(
      existsSync(join("public", "notes", removedOrDraft)),
      false,
      `removed or draft article must not be published at public/notes/${removedOrDraft}`
    );
  }

  for (const mdPath of [ftpMdPath]) {
    const rawBytes = readBytes(mdPath);
    assert.equal(rawBytes.includes(13), false, `${mdPath} contains CR bytes`);
    const text = read(mdPath);
    assert.equal(text.includes("\u2014"), false, `${mdPath} contains an em dash`);
    assert.equal(text.includes("\u2013"), false, `${mdPath} contains an en dash`);
  }
});

test("ftp.md includes complete Stage 2 reading-order text, tables, inline extended references, diagrams, attribution, and canonical URL without outer code fence", () => {
  const ftpMd = read(join("public", "notes", "security", "footprinting", "ftp.md"));

  assert.equal(ftpMd.includes("````"), false, "ftp.md must not wrap content in an outer four-backtick fence");
  assert.equal(
    ftpMd.includes("## Extended Technical Reference and Full Outputs"),
    false,
    "ftp.md must place extended references in logical reading order instead of a disconnected dump"
  );

  const requiredTokens = [
    "# FTP Footprinting",
    "Ahmed Ibrahim Asl (ASL)",
    "https://eng-asl.com/notes/security/footprinting/ftp/",
    "https://eng-asl.com/notes/security/footprinting/ftp.md",
    "listen=NO",
    "secure_chroot_dir=/var/run/vsftpd/empty",
    "verify error:num=18",
    "appointments.xlsx",
    "Service Info: OS: Unix",
    "54230",
    "Use of PORT cmds: on",
    "Downloaded: 15 files",
    "master.inlanefreight.htb",
    "Abbreviated output",
    "Illustrative example",
    "Reconstructed directory tree",
    "https://datatracker.ietf.org/doc/html/rfc959",
    "https://security.appspot.com/vsftpd/vsftpd_conf.html",
    "https://nmap.org/book/nse.html",
    "Hack The Box Academy"
  ];

  for (const token of requiredTokens) {
    assert.ok(ftpMd.includes(token), `ftp.md missing expected content: ${token}`);
  }

  const controlIdx = ftpMd.indexOf("#### Inspect Control Channel");
  const activePassiveIdx = ftpMd.indexOf("## Active and Passive FTP");
  const vsftpdIdx = ftpMd.indexOf("## vsFTPd");
  const setupIdx = ftpMd.indexOf("#### vsFTPd Setup Guide");
  const configIdx = ftpMd.indexOf("## vsFTPd Configuration Settings");
  const treeIdx = ftpMd.indexOf("#### Recursive Directory Structure (ls -R)");
  const transfersIdx = ftpMd.indexOf("## Downloading and Uploading Files");

  assert.ok(controlIdx > 0 && controlIdx < activePassiveIdx, "Inspect Control Channel should appear inside How FTP Works");
  assert.ok(setupIdx > vsftpdIdx && setupIdx < configIdx, "vsFTPd Setup Guide should appear inside vsFTPd");
  assert.ok(treeIdx > 0 && treeIdx < transfersIdx, "Recursive directory tree should appear before Downloading and Uploading Files");
});

test("llms.txt and llms-full.txt index published notes, projects, publications, and exclude drafts", () => {
  const llmsTxt = read(join("public", "llms.txt"));
  const llmsFull = read(join("public", "llms-full.txt"));

  assert.equal(llmsTxt.includes("\u2014"), false, "llms.txt contains an em dash");
  assert.equal(llmsTxt.includes("\u2013"), false, "llms.txt contains an en dash");

  for (const token of [
    "https://eng-asl.com/notes/security/footprinting/ftp/",
    "https://eng-asl.com/notes/security/footprinting/ftp.md",
    "https://eng-asl.com/llms-full.txt",
    "Biovety International",
    "Scientific Reports 15 (1), 39011"
  ]) {
    assert.ok(llmsTxt.includes(token), `llms.txt missing token: ${token}`);
  }

  for (const removed of ["welcome-to-field-notes", "Engineering Field Notes: Methods and Tests"]) {
    assert.equal(llmsTxt.includes(removed), false, `llms.txt still references removed article: ${removed}`);
    assert.equal(llmsFull.includes(removed), false, `llms-full.txt still references removed article: ${removed}`);
  }

  assert.equal(
    llmsFull.includes("A draft structure for turning every Bandit level"),
    false,
    "llms-full.txt leaked a draft post"
  );
  assert.ok(llmsFull.includes("verify error:num=18"), "llms-full.txt missing full FTP content");
});

test("robots.js explicitly distinguishes search and user retrieval bots from AI model training bots while keeping internal previews disallowed", () => {
  const robotsSource = read(join("app", "robots.js"));
  for (const token of [
    "Googlebot",
    "Bingbot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot",
    "Perplexity-User",
    "GPTBot",
    "ClaudeBot",
    "Applebot-Extended",
    "CCBot",
    "Bytespider",
    "Meta-ExternalAgent",
    "/work/ui-preview/",
    "/concepts/"
  ]) {
    assert.ok(robotsSource.includes(token), `app/robots.js missing rule token: ${token}`);
  }
});

test("Schema.org JSON-LD helpers cover TechArticle, BreadcrumbList, CreativeWork, and ScholarlyArticle", () => {
  const seoSource = read(join("lib", "seo.ts"));
  for (const schemaType of [
    "TechArticle",
    "BreadcrumbList",
    "CreativeWork",
    "ScholarlyArticle",
    "text/markdown"
  ]) {
    assert.ok(seoSource.includes(schemaType), `lib/seo.ts missing schema type: ${schemaType}`);
  }
});
