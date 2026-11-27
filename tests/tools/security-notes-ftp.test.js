import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const read = (path) => readFileSync(path, "utf8");

test("hierarchical Security -> Footprinting -> FTP routes exist and configure static export", () => {
  const indexRoute = "app/notes/security/page.tsx";
  const folderRoute = "app/notes/security/[folder]/page.tsx";
  const slugRoute = "app/notes/security/[folder]/[slug]/page.tsx";

  for (const file of [indexRoute, folderRoute, slugRoute]) {
    assert.ok(existsSync(file), `missing route file: ${file}`);
  }

  for (const dynamicRoute of [folderRoute, slugRoute]) {
    const src = read(dynamicRoute);
    assert.match(src, /export function generateStaticParams\(\)/);
    assert.match(src, /export const dynamicParams = false/);
  }
});

test("security note data, shared article pages, and components contain zero em dashes or en dashes", () => {
  const filesToCheck = [
    "types/security-notes.ts",
    "data/notes/security/index.ts",
    "data/notes/security/footprinting/ftp.ts",
    "app/notes/security/page.tsx",
    "app/notes/security/[folder]/page.tsx",
    "app/notes/security/[folder]/[slug]/page.tsx",
    "app/notes/[slug]/page.tsx",
    "app/writing/[slug]/page.tsx",
    ...readdirSync("components/notes").map((name) => join("components/notes", name))
  ];

  for (const file of filesToCheck) {
    const content = read(file);
    assert.equal(content.includes("\u2014"), false, `${file} contains an em dash`);
    assert.equal(content.includes("\u2013"), false, `${file} contains an en dash`);
  }
});

test("FTP field notes preserve core explanations and include all extended technical sections", () => {
  const ftpSource = read("data/notes/security/footprinting/ftp.ts");

  for (const partId of [
    'id: "overview"',
    'id: "setup"',
    'id: "config"',
    'id: "users"',
    'id: "anonymous"',
    'id: "enumeration"',
    'id: "diagnostics"',
    'id: "recursive-listing"',
    'id: "file-transfers"',
    'id: "nmap-footprinting"',
    'id: "manual-and-tls"'
  ]) {
    assert.ok(ftpSource.includes(partId), `missing section ${partId}`);
  }

  const requiredTokens = [
    "listen=NO",
    "listen_ipv6=YES",
    "connect_from_port_20=YES",
    "anonymous_enable=NO",
    "local_enable=YES",
    "pam_service_name=vsftpd",
    "secure_chroot_dir=/var/run/vsftpd/empty",
    "Pluggable Authentication Modules",
    "/etc/pam.d/vsftpd",
    "dirmessage_enable=YES",
    "message_file=.message",
    "ftpd_banner=Welcome to FTP Server",
    "banner_file=/etc/ftp_banner.txt",
    "use_localtime=YES",
    "xferlog_enable=YES",
    "ssl_enable=NO",
    "rsa_cert_file=/etc/ssl/certs/ssl-cert-snakeoil.pem",
    "rsa_private_key_file=/etc/ssl/private/ssl-cert-snakeoil.key",
    "anonymous_enable=YES",
    "no_anon_password=YES",
    "anon_root=/home/username/ftp",
    "write_enable=YES",
    "anon_upload_enable=YES",
    "anon_mkdir_write_enable=YES",
    "/etc/ftpusers",
    "220",
    "230",
    "200",
    "150",
    "226",
    "530",
    "quote STAT",
    "debug",
    "trace",
    "client-side visibility",
    "chown_uploads=YES",
    "chown_username=username",
    "chroot_local_user=YES",
    "chroot_list_enable=YES",
    "/etc/vsftpd.chroot_list",
    "hide_ids=YES",
    "ls_recurse_enable=YES",
    "Fail2ban",
    "ls -R",
    "wget -m --no-passive ftp://anonymous:anonymous@10.129.14.136",
    "STOR testupload.txt",
    "Local File Inclusion (LFI)",
    "Remote Code Execution (RCE)",
    "ftp-vsftpd-backdoor",
    "ftp-vuln-cve2010-4221",
    "sudo nmap -sV -p21 -sC -A 10.129.14.136",
    "--script-trace",
    "54228",
    "nc -nv 10.129.14.136 21",
    "telnet 10.129.14.136 21",
    "openssl s_client -connect 10.129.14.136:21 -starttls ftp",
    "master.inlanefreight.htb",
    "https://nmap.org/book/nse.html"
  ];

  for (const token of requiredTokens) {
    assert.ok(ftpSource.includes(token), `missing expected FTP note content: ${token}`);
  }

  assert.equal(ftpSource.includes("See another version"), false, "duplicate prompt artifact found");
  assert.equal(
    ftpSource.includes("The original configuration settings have been preserved"),
    false,
    "meta prompt commentary found"
  );
});

test("every raster image referenced in FTP note exists under public/", () => {
  const ftpSource = read("data/notes/security/footprinting/ftp.ts");
  const matches = [
    ...ftpSource.matchAll(/(?:imageSrc|overviewSheetImage):\s*"([^"]+)"/g)
  ].map((m) => m[1]);

  assert.ok(matches.length >= 4, "expected at least 4 raster diagram assets");
  for (const relUrl of matches) {
    const diskPath = join("public", relUrl.replace(/^\//, ""));
    assert.ok(existsSync(diskPath), `missing image file on disk: ${diskPath}`);
  }
});

test("FloatingNoteWindow is non-modal, draggable, and closes on Escape", () => {
  const source = read("components/notes/FloatingNoteWindow.tsx");
  assert.match(source, /role="region"/);
  assert.doesNotMatch(source, /role="dialog"/);
  assert.match(source, /useNoteDraggable/);
  assert.match(source, /key === "Escape"/);
});

test("NoteTerminal renders copy controls and FTP status codes, and workspace uses continuous vertical article layout", () => {
  const terminal = read("components/notes/NoteTerminal.tsx");
  assert.match(terminal, /clipboard\.writeText/);
  assert.match(terminal, /termStatusCode/);

  const workspace = read("components/notes/SecurityNoteWorkspace.tsx");
  assert.doesNotMatch(workspace, /layout-mode-split|layout-mode-board|quickFactsStrip|heroCard/);
  assert.match(workspace, /vertical-note-article/);
  assert.match(workspace, /article-jump-nav/);
  assert.match(workspace, /open-full-sheet-btn/);
  assert.match(workspace, /toggle-quick-ref-btn/);
  assert.match(workspace, /case "diagram-embed"/);
  assert.match(workspace, /case "context-links"/);
});

test("markdown loaders normalize CRLF line endings and index pages strip post bodies from client props", () => {
  for (const loader of ["lib/content.ts", "lib/library.ts", "lib/prompts.ts"]) {
    assert.match(
      read(loader),
      /\.replace\(\/\\r\\n\?\/g,\s*"\\n"\)/,
      `${loader} must normalize CRLF to LF before serialization`
    );
  }

  for (const page of [
    "app/notes/page.tsx",
    "app/writing/page.tsx",
    "app/notes/topics/[topic]/page.tsx"
  ]) {
    assert.match(
      read(page),
      /toPostSummary/,
      `${page} must strip raw markdown body via toPostSummary before rendering WritingIndex`
    );
  }
});
