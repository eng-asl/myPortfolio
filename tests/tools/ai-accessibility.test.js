import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const read = (filePath) => readFileSync(filePath, "utf8");
const readBytes = (filePath) => readFileSync(filePath);

test("published Markdown endpoints exist, exclude drafts, use LF, and omit em/en dashes", () => {
  const ftpMdPath = join("public", "notes", "security", "footprinting", "ftp.md");
  const welcomeMdPath = join("public", "notes", "welcome-to-field-notes.md");

  assert.ok(existsSync(ftpMdPath), "missing public/notes/security/footprinting/ftp.md");
  assert.ok(existsSync(welcomeMdPath), "missing public/notes/welcome-to-field-notes.md");

  for (const draftName of [
    "overthewire-bandit-workflow.md",
    "reliable-sensor-to-flutter-pipeline.md"
  ]) {
    assert.equal(
      existsSync(join("public", "notes", draftName)),
      false,
      `draft article must not be published at public/notes/${draftName}`
    );
  }

  for (const mdPath of [ftpMdPath, welcomeMdPath]) {
    const rawBytes = readBytes(mdPath);
    assert.equal(rawBytes.includes(13), false, `${mdPath} contains CR bytes`);
    const text = read(mdPath);
    assert.equal(text.includes("\u2014"), false, `${mdPath} contains an em dash`);
    assert.equal(text.includes("\u2013"), false, `${mdPath} contains an en dash`);
  }
});

test("ftp.md includes complete core text, tables, pop-up outputs, diagrams, attribution, and canonical URL", () => {
  const ftpMd = read(join("public", "notes", "security", "footprinting", "ftp.md"));

  const requiredTokens = [
    "# FTP and vsFTPd Footprinting",
    "Ahmed Ibrahim Asl (ASL)",
    "https://eng-asl.com/notes/security/footprinting/ftp/",
    "https://eng-asl.com/notes/security/footprinting/ftp.md",
    "## Extended Technical Reference and Full Outputs",
    "listen=NO",
    "secure_chroot_dir=/var/run/vsftpd/empty",
    "verify error:num=18",
    "appointments.xlsx",
    "Service Info: OS: Unix",
    "54230",
    "Use of PORT cmds: on",
    "Downloaded: 15 files",
    "master.inlanefreight.htb",
    "https://nmap.org/book/nse.html",
    "Hack The Box"
  ];

  for (const token of requiredTokens) {
    assert.ok(ftpMd.includes(token), `ftp.md missing expected content: ${token}`);
  }
});

test("llms.txt and llms-full.txt index published notes, projects, publications, and exclude drafts", () => {
  const llmsTxt = read(join("public", "llms.txt"));
  const llmsFull = read(join("public", "llms-full.txt"));

  assert.equal(llmsTxt.includes("\u2014"), false, "llms.txt contains an em dash");
  assert.equal(llmsTxt.includes("\u2013"), false, "llms.txt contains an en dash");

  for (const token of [
    "https://eng-asl.com/notes/security/footprinting/ftp/",
    "https://eng-asl.com/notes/security/footprinting/ftp.md",
    "https://eng-asl.com/notes/welcome-to-field-notes/",
    "https://eng-asl.com/notes/welcome-to-field-notes.md",
    "https://eng-asl.com/llms-full.txt",
    "Biovety International",
    "Scientific Reports 15 (1), 39011"
  ]) {
    assert.ok(llmsTxt.includes(token), `llms.txt missing token: ${token}`);
  }

  assert.equal(
    llmsFull.includes("A draft structure for turning every Bandit level"),
    false,
    "llms-full.txt leaked a draft post"
  );
  assert.ok(llmsFull.includes("verify error:num=18"), "llms-full.txt missing full FTP content");
});

test("robots.js explicitly distinguishes search and user retrieval bots while keeping internal previews disallowed", () => {
  const robotsSource = read(join("app", "robots.js"));
  for (const token of [
    "Googlebot",
    "Bingbot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot",
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
