import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const DEFAULT_HOST = "eng-asl.com";
export const DEFAULT_ORIGIN = "https://eng-asl.com";
export const DEFAULT_ENDPOINT = "https://api.indexnow.org/indexnow";
export const DEFAULT_KEY = "a94e7c31b8f24d6ea1c50f82e39d7b46";
export const MAX_URLS_PER_BATCH = 10000;

const DRAFT_NOTE_SLUGS = new Set([
  "overthewire-bandit-workflow",
  "reliable-sensor-to-flutter-pipeline"
]);

function normalizeOrigin(origin = DEFAULT_ORIGIN) {
  return String(origin).replace(/\/+$/, "");
}

function decodeXmlEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export function extractSitemapUrls(xmlString, origin = DEFAULT_ORIGIN) {
  if (!xmlString) return [];
  const normOrigin = normalizeOrigin(origin);
  const found = new Set();
  const matches = String(xmlString).matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi);
  for (const match of matches) {
    const raw = decodeXmlEntities(match[1]).trim();
    if (raw.startsWith(`${normOrigin}/`)) {
      found.add(raw);
    }
  }
  return [...found].sort();
}

export function isEligiblePublicUrl(url, origin = DEFAULT_ORIGIN, key = DEFAULT_KEY) {
  if (!url || typeof url !== "string") return false;
  const normOrigin = normalizeOrigin(origin);
  if (!url.startsWith(`${normOrigin}/`)) return false;

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
  if (`${parsed.protocol}//${parsed.host}` !== normOrigin) return false;

  const p = parsed.pathname;
  if (
    p === "/api" ||
    p.startsWith("/api/") ||
    p.startsWith("/work/ui-preview/") ||
    p.startsWith("/concepts/") ||
    p === "/writing" ||
    p.startsWith("/writing/") ||
    p.startsWith("/_next/") ||
    p.startsWith("/_not-found") ||
    p.startsWith("/__next") ||
    p === "/404" ||
    p === "/404.html" ||
    p.startsWith("/404/") ||
    p === "/index.txt" ||
    p === "/robots.txt" ||
    p === "/sitemap.xml" ||
    p === `/${key}.txt` ||
    p === "/.github" ||
    p.startsWith("/.github/")
  ) {
    return false;
  }

  for (const draftSlug of DRAFT_NOTE_SLUGS) {
    if (
      p === `/notes/${draftSlug}` ||
      p === `/notes/${draftSlug}/` ||
      p === `/notes/${draftSlug}.md`
    ) {
      return false;
    }
  }

  return true;
}

export function canonicalHtmlFingerprint(html) {
  const source = String(html || "");
  const title = (source.match(/<title\b[^>]*>[\s\S]*?<\/title>/i) || [""])[0];
  const description = (source.match(/<meta\b[^>]*name=["']description["'][^>]*>/i) || [""])[0];
  const canonical = (source.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i) || [""])[0];
  const altMarkdown = (source.match(/<link\b[^>]*type=["']text\/markdown["'][^>]*>/i) || [""])[0];
  const jsonLdBlocks = [...source.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi)]
    .map((m) => m[0])
    .join("\n");

  const mainMatch = source.match(/<main\b[^>]*>[\s\S]*?<\/main>/i);
  const bodyMatch = mainMatch || source.match(/<body\b[^>]*>[\s\S]*?<\/body>/i);
  let bodyContent = bodyMatch ? bodyMatch[0] : source;

  bodyContent = bodyContent
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/\s+class="[^"]*"/gi, "")
    .replace(/\s+class='[^']*'/gi, "")
    .replace(/\/_next\/static\/[^"'\s>]+/gi, "/_next/static/_")
    .replace(/\s+/g, " ")
    .trim();

  const composite = [title, description, canonical, altMarkdown, jsonLdBlocks, bodyContent]
    .map((part) => part.replace(/\s+/g, " ").trim())
    .join("\n");

  return createHash("sha256").update(composite, "utf8").digest("hex");
}

export function urlToPagesHtmlPath(url, origin = DEFAULT_ORIGIN) {
  const normOrigin = normalizeOrigin(origin);
  if (!url.startsWith(`${normOrigin}/`)) {
    throw new Error(`URL does not match expected origin ${normOrigin}: ${url}`);
  }
  const rel = url.slice(normOrigin.length).replace(/^\/+|\/+$/g, "");
  return rel ? `${rel}/index.html` : "index.html";
}

function runGit(cwd, args, { allowFail = false } = {}) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "buffer",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"]
    });
  } catch (error) {
    if (allowFail) return null;
    throw error;
  }
}

function gitRevExists(cwd, ref) {
  if (!ref || /^0+$/.test(ref)) return false;
  const out = runGit(cwd, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`], {
    allowFail: true
  });
  return Boolean(out && out.toString("utf8").trim());
}

function gitShowText(cwd, ref, filePath) {
  const posixPath = filePath.replace(/\\/g, "/");
  const buf = runGit(cwd, ["show", `${ref}:${posixPath}`], { allowFail: true });
  return buf ? buf.toString("utf8") : null;
}

function gitDiffNameStatus(cwd, baseRef, headRef) {
  const buf = runGit(cwd, ["diff", "--no-renames", "--name-status", "-z", baseRef, headRef], {
    allowFail: true
  });
  if (!buf) return [];
  const tokens = buf.toString("utf8").split("\0");
  const entries = [];
  for (let i = 0; i < tokens.length; i++) {
    const rawStatus = tokens[i];
    if (!rawStatus) continue;
    const status = rawStatus.trim();
    if (status.startsWith("R") || status.startsWith("C")) {
      const oldPath = tokens[i + 1];
      const newPath = tokens[i + 2];
      i += 2;
      if (oldPath) entries.push({ status: "D", filePath: oldPath.replace(/\\/g, "/") });
      if (newPath) entries.push({ status: "A", filePath: newPath.replace(/\\/g, "/") });
    } else {
      const filePath = tokens[i + 1];
      i += 1;
      if (filePath) entries.push({ status: status[0], filePath: filePath.replace(/\\/g, "/") });
    }
  }
  return entries;
}

function setChange(changeMap, url, change, origin, key) {
  if (!isEligiblePublicUrl(url, origin, key)) return;
  const current = changeMap.get(url);
  if (!current || (current === "updated" && (change === "added" || change === "removed"))) {
    changeMap.set(url, change);
  }
}

export function computePagesBranchChangedUrls({
  cwd = process.cwd(),
  baseRef = "HEAD~1",
  headRef = "HEAD",
  origin = DEFAULT_ORIGIN,
  key = DEFAULT_KEY
} = {}) {
  const normOrigin = normalizeOrigin(origin);
  if (!gitRevExists(cwd, headRef)) {
    throw new Error(`Invalid headRef for git repository: ${headRef}`);
  }

  const hasBase = gitRevExists(cwd, baseRef);
  const headSitemapXml = gitShowText(cwd, headRef, "sitemap.xml") || "";
  const baseSitemapXml = hasBase ? gitShowText(cwd, baseRef, "sitemap.xml") || "" : "";

  const headUrls = extractSitemapUrls(headSitemapXml, normOrigin).filter((u) =>
    isEligiblePublicUrl(u, normOrigin, key)
  );
  const baseUrls = extractSitemapUrls(baseSitemapXml, normOrigin).filter((u) =>
    isEligiblePublicUrl(u, normOrigin, key)
  );

  const headSet = new Set(headUrls);
  const baseSet = new Set(baseUrls);
  const changeMap = new Map();

  for (const url of headUrls) {
    if (!baseSet.has(url)) {
      setChange(changeMap, url, "added", normOrigin, key);
    }
  }
  for (const url of baseUrls) {
    if (!headSet.has(url)) {
      setChange(changeMap, url, "removed", normOrigin, key);
    }
  }

  const urlByHtmlPath = new Map();
  for (const url of headUrls) {
    urlByHtmlPath.set(urlToPagesHtmlPath(url, normOrigin), url);
  }

  let skippedUnchangedHtml = 0;

  if (hasBase) {
    const diffEntries = gitDiffNameStatus(cwd, baseRef, headRef);
    for (const { status, filePath } of diffEntries) {
      if (filePath.endsWith(".html") && status === "M") {
        const canonicalUrl = urlByHtmlPath.get(filePath);
        if (!canonicalUrl || changeMap.has(canonicalUrl)) continue;
        const baseHtml = gitShowText(cwd, baseRef, filePath);
        const headHtml = gitShowText(cwd, headRef, filePath);
        if (baseHtml === null || headHtml === null) continue;
        if (canonicalHtmlFingerprint(baseHtml) !== canonicalHtmlFingerprint(headHtml)) {
          setChange(changeMap, canonicalUrl, "updated", normOrigin, key);
        } else {
          skippedUnchangedHtml += 1;
        }
      } else if (
        filePath === "llms.txt" ||
        filePath === "llms-full.txt" ||
        /^notes\/.+\.md$/.test(filePath)
      ) {
        const docUrl = `${normOrigin}/${filePath}`;
        if (status === "A") {
          setChange(changeMap, docUrl, "added", normOrigin, key);
        } else if (status === "D") {
          setChange(changeMap, docUrl, "removed", normOrigin, key);
        } else if (status === "M") {
          const baseDoc = (gitShowText(cwd, baseRef, filePath) || "").replace(/\r\n?/g, "\n");
          const headDoc = (gitShowText(cwd, headRef, filePath) || "").replace(/\r\n?/g, "\n");
          if (baseDoc !== headDoc) {
            setChange(changeMap, docUrl, "updated", normOrigin, key);
          }
        }
      }
    }
  } else {
    const treeBuf = runGit(cwd, ["ls-tree", "-r", "--name-only", "-z", headRef], { allowFail: true });
    if (treeBuf) {
      for (const filePath of treeBuf.toString("utf8").split("\0")) {
        if (
          filePath === "llms.txt" ||
          filePath === "llms-full.txt" ||
          /^notes\/.+\.md$/.test(filePath)
        ) {
          setChange(changeMap, `${normOrigin}/${filePath}`, "added", normOrigin, key);
        }
      }
    }
  }

  const changed = [...changeMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([url, change]) => ({ url, change }));

  return { changed, skippedUnchangedHtml };
}

function isMarkdownDraft(markdownSource) {
  if (!markdownSource) return false;
  const fm = markdownSource.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return false;
  return /^\s*draft\s*:\s*true\s*$/im.test(fm[1]);
}

function getDiffTextForFile(cwd, baseRef, headRef, filePath) {
  const buf = runGit(cwd, ["diff", "-U0", baseRef, headRef, "--", filePath], { allowFail: true });
  return buf ? buf.toString("utf8") : "";
}

export function computeSourceChangedUrls({
  cwd = process.cwd(),
  baseRef = "HEAD~1",
  headRef = "HEAD",
  prevSitemapPath,
  currSitemapPath,
  origin = DEFAULT_ORIGIN,
  key = DEFAULT_KEY
} = {}) {
  const normOrigin = normalizeOrigin(origin);
  const changeMap = new Map();

  const resolvedCurrSitemap =
    currSitemapPath ||
    (existsSync(path.join(cwd, "out", "sitemap.xml"))
      ? path.join(cwd, "out", "sitemap.xml")
      : undefined);

  const currUrls =
    resolvedCurrSitemap && existsSync(resolvedCurrSitemap)
      ? extractSitemapUrls(readFileSync(resolvedCurrSitemap, "utf8"), normOrigin).filter((u) =>
          isEligiblePublicUrl(u, normOrigin, key)
        )
      : [];

  if (prevSitemapPath && existsSync(prevSitemapPath) && currUrls.length > 0) {
    const prevUrls = extractSitemapUrls(readFileSync(prevSitemapPath, "utf8"), normOrigin).filter((u) =>
      isEligiblePublicUrl(u, normOrigin, key)
    );
    const prevSet = new Set(prevUrls);
    const currSet = new Set(currUrls);
    for (const url of currUrls) {
      if (!prevSet.has(url)) setChange(changeMap, url, "added", normOrigin, key);
    }
    for (const url of prevUrls) {
      if (!currSet.has(url)) setChange(changeMap, url, "removed", normOrigin, key);
    }
  }

  if (!gitRevExists(cwd, headRef) || !gitRevExists(cwd, baseRef)) {
    return {
      changed: [...changeMap.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([url, change]) => ({ url, change })),
      skippedUnchangedHtml: 0
    };
  }

  const diffEntries = gitDiffNameStatus(cwd, baseRef, headRef);
  const addRel = (pathname, change = "updated") =>
    setChange(changeMap, `${normOrigin}${pathname}`, change, normOrigin, key);

  const noteHubUpdates = () => {
    addRel("/notes/", "updated");
    addRel("/", "updated");
    addRel("/ar/", "updated");
    addRel("/llms.txt", "updated");
    addRel("/llms-full.txt", "updated");
  };

  for (const { status, filePath } of diffEntries) {
    const securityNoteMatch = filePath.match(/^data\/notes\/security\/([^/]+)\/([^/]+)\.ts$/);
    if (securityNoteMatch && securityNoteMatch[2] !== "index") {
      const [, folder, slug] = securityNoteMatch;
      const noteChange = status === "D" ? "removed" : status === "A" ? "added" : "updated";
      addRel(`/notes/security/${folder}/${slug}/`, noteChange);
      addRel(`/notes/security/${folder}/${slug}.md`, noteChange);
      addRel(`/notes/security/${folder}/`, "updated");
      addRel("/notes/security/", "updated");
      noteHubUpdates();
      continue;
    }

    if (filePath === "data/notes/security/index.ts") {
      addRel("/notes/security/", "updated");
      noteHubUpdates();
      continue;
    }

    const writingMatch = filePath.match(/^content\/writing\/([^/]+)\.md$/);
    if (writingMatch) {
      const [, slug] = writingMatch;
      const headDraft =
        status === "D" ? true : isMarkdownDraft(gitShowText(cwd, headRef, filePath));
      const baseDraft =
        status === "A" ? true : isMarkdownDraft(gitShowText(cwd, baseRef, filePath));

      if (headDraft && baseDraft) continue;

      if (status === "D" || (headDraft && !baseDraft)) {
        addRel(`/notes/${slug}/`, "removed");
        addRel(`/notes/${slug}.md`, "removed");
      } else {
        const postChange = status === "A" || baseDraft ? "added" : "updated";
        addRel(`/notes/${slug}/`, postChange);
        addRel(`/notes/${slug}.md`, postChange);
      }
      noteHubUpdates();
      continue;
    }

    if (
      filePath === "data/portfolio.ts" ||
      /^data\/work-categories\.(js|ts)$/.test(filePath) ||
      filePath.startsWith("app/work/")
    ) {
      addRel("/work/", "updated");
      addRel("/ar/work/", "updated");
      addRel("/", "updated");
      addRel("/ar/", "updated");
      addRel("/llms.txt", "updated");

      if (filePath === "data/portfolio.ts" && currUrls.length > 0) {
        const diffText = getDiffTextForFile(cwd, baseRef, headRef, filePath);
        for (const url of currUrls) {
          const m = url.match(/\/work\/[^/]+\/([^/]+)\/$/);
          if (m && diffText.includes(m[1])) {
            setChange(changeMap, url, "updated", normOrigin, key);
          }
        }
      }
      continue;
    }

    if (filePath === "data/publications.json") {
      addRel("/work/", "updated");
      addRel("/about/", "updated");
      addRel("/ar/work/", "updated");
      addRel("/ar/about/", "updated");
      addRel("/llms.txt", "updated");
      continue;
    }

    if (
      /^data\/(tools|tool-categories|satellite-course|rf-calculators|gradify-sections)\.(js|ts)$/.test(
        filePath
      ) ||
      filePath.startsWith("app/tools/")
    ) {
      addRel("/tools/", "updated");
      addRel("/ar/tools/", "updated");
      addRel("/llms.txt", "updated");

      const appToolMatch = filePath.match(/^app\/tools\/([^/]+)\//);
      if (
        appToolMatch &&
        !appToolMatch[1].startsWith("[") &&
        appToolMatch[1] !== "category" &&
        appToolMatch[1] !== "satellite" &&
        appToolMatch[1] !== "rf" &&
        appToolMatch[1] !== "gradify"
      ) {
        const toolChange = status === "D" ? "removed" : status === "A" ? "added" : "updated";
        addRel(`/tools/${appToolMatch[1]}/`, toolChange);
      }

      if (filePath.startsWith("data/") && currUrls.length > 0) {
        const diffText = getDiffTextForFile(cwd, baseRef, headRef, filePath);
        for (const url of currUrls) {
          const m = url.match(/\/tools\/(?:(?:satellite|rf|gradify)\/)?([^/]+)\/$/);
          if (m && diffText.includes(m[1])) {
            setChange(changeMap, url, "updated", normOrigin, key);
          }
        }
      }
      continue;
    }

    const publicDocMatch = filePath.match(/^public\/(notes\/.+\.md|llms\.txt|llms-full\.txt)$/);
    if (publicDocMatch) {
      const docChange = status === "D" ? "removed" : status === "A" ? "added" : "updated";
      addRel(`/${publicDocMatch[1]}`, docChange);
    }
  }

  const changed = [...changeMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([url, change]) => ({ url, change }));

  return { changed, skippedUnchangedHtml: 0 };
}

export function buildIndexNowPayload({
  host = DEFAULT_HOST,
  key = DEFAULT_KEY,
  keyLocation,
  urls
}) {
  const cleanHost = String(host || "").trim();
  const cleanKey = String(key || "").trim();
  if (!cleanHost) throw new Error("IndexNow host is required.");
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(cleanKey)) {
    throw new Error(`Invalid IndexNow key format: ${cleanKey}`);
  }

  const uniqueUrls = [...new Set((urls || []).map((u) => String(u).trim()).filter(Boolean))];
  if (uniqueUrls.length === 0) {
    throw new Error("urlList must contain at least one URL.");
  }
  if (uniqueUrls.length > MAX_URLS_PER_BATCH) {
    throw new Error(`urlList exceeds maximum batch size (${MAX_URLS_PER_BATCH}).`);
  }

  for (const url of uniqueUrls) {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error(`Unsupported URL protocol for IndexNow: ${url}`);
    }
    if (parsed.hostname !== cleanHost) {
      throw new Error(`URL host "${parsed.hostname}" does not match declared host "${cleanHost}": ${url}`);
    }
  }

  const resolvedKeyLocation = keyLocation || `https://${cleanHost}/${cleanKey}.txt`;
  return {
    host: cleanHost,
    key: cleanKey,
    keyLocation: resolvedKeyLocation,
    urlList: uniqueUrls
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyKeyFile(keyLocation, key, retries = 5, delayMs = 5000) {
  let lastDetail = "unknown error";
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(keyLocation, {
        method: "GET",
        headers: { "User-Agent": "eng-asl-indexnow-notifier/1.0" }
      });
      const text = (await res.text()).trim();
      if (res.status === 200 && text === key) {
        console.log(`Verified IndexNow key file (${res.status} OK): ${keyLocation}`);
        return true;
      }
      lastDetail = `HTTP ${res.status}, body=${JSON.stringify(text.slice(0, 80))}`;
    } catch (error) {
      lastDetail = error instanceof Error ? error.message : String(error);
    }
    if (attempt < retries) {
      console.warn(
        `Key verification attempt ${attempt}/${retries} failed (${lastDetail}); retrying in ${delayMs}ms...`
      );
      await sleep(delayMs);
    }
  }
  throw new Error(`IndexNow key verification failed at ${keyLocation}: ${lastDetail}`);
}

async function checkSingleUrlStatus(url) {
  const req = async (method) =>
    fetch(url, {
      method,
      redirect: "follow",
      headers: { "User-Agent": "eng-asl-indexnow-notifier/1.0" }
    });

  let res = await req("HEAD");
  if (res.status === 405 || res.status === 501) {
    res = await req("GET");
  }
  if (res.status >= 500) {
    await sleep(2000);
    res = await req("HEAD");
    if (res.status === 405 || res.status === 501) {
      res = await req("GET");
    }
  }
  return res.status;
}

async function verifyTargetUrls(entries) {
  const verified = [];
  for (const entry of entries) {
    try {
      const status = await checkSingleUrlStatus(entry.url);
      if (entry.change === "removed") {
        if (status === 404 || status === 410) {
          console.log(`Preflight [${entry.change}] ${status} ${entry.url}`);
          verified.push(entry);
        } else {
          console.warn(
            `Skipping removed URL preflight mismatch (expected 404/410, got ${status}): ${entry.url}`
          );
        }
      } else if (status === 200) {
        console.log(`Preflight [${entry.change}] ${status} ${entry.url}`);
        verified.push(entry);
      } else {
        console.warn(`Skipping URL with non-200 status (${status}): ${entry.url}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`Skipping URL due to network error (${msg}): ${entry.url}`);
    }
  }
  if (verified.length === 0) {
    throw new Error("Aborting IndexNow submission: zero changed URLs passed live preflight checks.");
  }
  return verified;
}

async function submitIndexNowBatch({ endpoint, payload }) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "eng-asl-indexnow-notifier/1.0"
    },
    body: JSON.stringify(payload)
  });

  const bodyText = await res.text();
  const headerSnapshot = {};
  for (const name of ["content-type", "date", "server", "retry-after", "x-cache"]) {
    const val = res.headers.get(name);
    if (val) headerSnapshot[name] = val;
  }

  console.log(`IndexNow POST ${endpoint} -> HTTP ${res.status}`);
  console.log("Response headers:", JSON.stringify(headerSnapshot));
  console.log("Response body:", bodyText ? bodyText : "(empty response body)");
  console.log(`Submitted ${payload.urlList.length} URL(s):`);
  for (const submittedUrl of payload.urlList) {
    console.log(`  - ${submittedUrl}`);
  }

  if (res.status === 200 || res.status === 202) {
    console.log(
      `IndexNow accepted submission (HTTP ${res.status}). Receipt confirms crawl notification only and is not proof of indexing.`
    );
    return { status: res.status, headers: headerSnapshot, body: bodyText };
  }

  throw new Error(`IndexNow submission failed with HTTP ${res.status}: ${bodyText}`);
}

function parseCliArgs(argv) {
  const opts = {
    mode: "pages-branch",
    baseRef: "HEAD~1",
    headRef: "HEAD",
    prevSitemapPath: undefined,
    currSitemapPath: undefined,
    urls: undefined,
    dryRun: false,
    skipPreflight: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--mode") opts.mode = argv[++i];
    else if (arg === "--base-ref") opts.baseRef = argv[++i];
    else if (arg === "--head-ref") opts.headRef = argv[++i];
    else if (arg === "--prev-sitemap") opts.prevSitemapPath = argv[++i];
    else if (arg === "--sitemap") opts.currSitemapPath = argv[++i];
    else if (arg === "--urls") opts.urls = argv[++i];
    else if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--skip-preflight") opts.skipPreflight = true;
    else throw new Error(`Unknown CLI flag: ${arg}`);
  }

  return opts;
}

async function runCli() {
  const opts = parseCliArgs(process.argv.slice(2));
  const host = process.env.INDEXNOW_HOST || DEFAULT_HOST;
  const origin = `https://${host}`;
  const key = process.env.INDEXNOW_KEY || DEFAULT_KEY;
  const keyLocation = process.env.INDEXNOW_KEY_LOCATION || `${origin}/${key}.txt`;
  const endpoint = process.env.INDEXNOW_ENDPOINT || DEFAULT_ENDPOINT;

  let detected;
  if (opts.urls) {
    const explicit = opts.urls
      .split(",")
      .map((u) => u.trim())
      .filter((u) => isEligiblePublicUrl(u, origin, key));
    detected = {
      changed: [...new Set(explicit)].map((url) => ({ url, change: "explicit" })),
      skippedUnchangedHtml: 0
    };
  } else if (opts.mode === "source") {
    detected = computeSourceChangedUrls({
      cwd: process.cwd(),
      baseRef: opts.baseRef,
      headRef: opts.headRef,
      prevSitemapPath: opts.prevSitemapPath,
      currSitemapPath: opts.currSitemapPath,
      origin,
      key
    });
  } else if (opts.mode === "pages-branch") {
    detected = computePagesBranchChangedUrls({
      cwd: process.cwd(),
      baseRef: opts.baseRef,
      headRef: opts.headRef,
      origin,
      key
    });
  } else {
    throw new Error(`Unsupported --mode "${opts.mode}". Expected "pages-branch" or "source".`);
  }

  if (detected.skippedUnchangedHtml > 0) {
    console.log(
      `Skipped ${detected.skippedUnchangedHtml} unmodified HTML page(s) whose canonical content fingerprint did not change.`
    );
  }

  if (detected.changed.length === 0) {
    console.log("No changed canonical public URLs detected; skipping IndexNow submission.");
    return;
  }

  console.log(`Detected ${detected.changed.length} changed canonical URL(s):`);
  for (const item of detected.changed) {
    console.log(`  [${item.change}] ${item.url}`);
  }

  if (opts.dryRun) {
    const payload = buildIndexNowPayload({
      host,
      key,
      keyLocation,
      urls: detected.changed.map((item) => item.url)
    });
    console.log("Dry run enabled; IndexNow payload preview:");
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  let finalEntries = detected.changed;
  if (!opts.skipPreflight) {
    await verifyKeyFile(keyLocation, key);
    finalEntries = await verifyTargetUrls(detected.changed);
  }

  for (let i = 0; i < finalEntries.length; i += MAX_URLS_PER_BATCH) {
    const batch = finalEntries.slice(i, i + MAX_URLS_PER_BATCH);
    const payload = buildIndexNowPayload({
      host,
      key,
      keyLocation,
      urls: batch.map((item) => item.url)
    });
    await submitIndexNowBatch({ endpoint, payload });
  }
}

const isMain =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exit(1);
  });
}
