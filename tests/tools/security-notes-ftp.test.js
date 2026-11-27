import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const read = (filePath) => readFileSync(filePath, "utf8");

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

test("security note data, Markdown generator, shared article pages, and components contain zero em dashes or en dashes", () => {
  const filesToCheck = [
    "types/security-notes.ts",
    "lib/ai-markdown.ts",
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

test("FTP field notes implement all 12 revised Stage 2 sections and preserve unique technical inventory", () => {
  const ftpSource = read("data/notes/security/footprinting/ftp.ts");

  for (const partId of [
    'id: "how-ftp-works"',
    'id: "active-and-passive-ftp"',
    'id: "vsftpd"',
    'id: "vsftpd-configuration"',
    'id: "ftp-users"',
    'id: "anonymous-access"',
    'id: "anonymous-enumeration"',
    'id: "debugging-ftp"',
    'id: "recursive-listing"',
    'id: "file-transfers"',
    'id: "nmap-footprinting"',
    'id: "manual-and-tls"'
  ]) {
    assert.ok(ftpSource.includes(partId), `missing revised section ${partId}`);
  }

  const requiredTokens = [
    "listen=NO",
    "listen_ipv6=YES",
    "connect_from_port_20=YES",
    "anonymous_enable=NO",
    "local_enable=YES",
    "pam_service_name=vsftpd",
    "secure_chroot_dir=/var/run/vsftpd/empty",
    "/etc/pam.d/vsftpd",
    "chown_uploads=YES",
    "chown_username=username",
    "chroot_local_user=YES",
    "chroot_list_enable=YES",
    "/etc/vsftpd.chroot_list",
    "hide_ids=YES",
    "ls_recurse_enable=YES",
    "Fail2ban",
    "dirmessage_enable=YES",
    "message_file=.message",
    "ftpd_banner=Welcome to FTP Server",
    "banner_file=/etc/ftp_banner.txt",
    "use_localtime=YES",
    "xferlog_enable=YES",
    "ssl_enable=NO",
    "rsa_cert_file",
    "rsa_private_key_file",
    "/etc/ssl/certs/ssl-cert-snakeoil.pem",
    "/etc/ssl/private/ssl-cert-snakeoil.key",
    "force_local_logins_ssl",
    "force_local_data_ssl",
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
    "ls -R",
    "appointments.xlsx",
    "wget -m --no-passive ftp://anonymous:anonymous@10.129.14.136",
    "STOR testupload.txt",
    "Local File Inclusion (LFI)",
    "Remote Code Execution (RCE)",
    "ftp-anon",
    "ftp-syst",
    "ftp-bounce",
    "ftp-brute",
    "ftp-vsftpd-backdoor",
    "ftp-proftpd-backdoor",
    "ftp-vuln-cve2010-4221",
    "ftp-libopie",
    "sudo nmap -sV -sC -p21 10.129.14.136",
    "sudo nmap -sV -p21 -sC -A 10.129.14.136",
    "--script-updatedb",
    "--script-trace",
    "54228",
    "54230",
    "nc -nv 10.129.14.136 21",
    "telnet 10.129.14.136 21",
    "openssl s_client -connect 10.129.14.136:21 -starttls ftp",
    "master.inlanefreight.htb",
    "https://datatracker.ietf.org/doc/html/rfc959",
    "https://security.appspot.com/vsftpd/vsftpd_conf.html",
    "https://nmap.org/book/nse.html"
  ];

  for (const token of requiredTokens) {
    assert.ok(ftpSource.includes(token), `missing expected FTP note content: ${token}`);
  }

  for (const correctionPhrase of [
    "depending on configuration",
    "not a complete security boundary",
    "when the authentication policy enforces this denylist",
    "separate protocols",
    "separate configuration concerns",
    "rebuilds Nmap's local script database index rather than downloading"
  ]) {
    assert.ok(
      ftpSource.includes(correctionPhrase),
      `missing technical accuracy qualification: ${correctionPhrase}`
    );
  }
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

test("Shared Stage 2 Notes architecture supports sticky TOC, focus-managed pop-ups, and clean overflow-x clip", () => {
  const floating = read("components/notes/FloatingNoteWindow.tsx");
  assert.match(floating, /role="region"/);
  assert.doesNotMatch(floating, /role="dialog"/);
  assert.match(floating, /useNoteDraggable/);
  assert.match(floating, /key === "Escape"/);
  assert.match(floating, /preventScroll: true/);
  assert.equal(floating.includes("floatingRelated"), false, "nested pop-up links must be avoided");

  const diagramPlate = read("components/notes/DiagramPlate.tsx");
  assert.match(diagramPlate, />View Large</);
  assert.equal(diagramPlate.includes("View larger"), false);

  const toc = read("components/notes/NoteTableOfContents.tsx");
  assert.match(toc, /IntersectionObserver/);
  assert.match(toc, /aria-current/);
  assert.match(toc, /mobile-toc-bar/);

  const workspace = read("components/notes/SecurityNoteWorkspace.tsx");
  assert.match(workspace, /NoteTableOfContents/);
  assert.match(workspace, /vertical-note-article/);
  assert.match(workspace, /lastTriggerRef/);

  const globalsCss = read("app/globals.css");
  assert.match(globalsCss, /overflow-x:\s*clip/);
  assert.equal(/html\s*\{[^}]*overflow-x:\s*hidden/.test(globalsCss), false);
});
