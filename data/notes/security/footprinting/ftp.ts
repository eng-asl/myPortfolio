import type { SecurityNoteEntry } from "@/types/security-notes";

export const ftpNote: SecurityNoteEntry = {
  slug: "ftp",
  folderSlug: "footprinting",
  folderTitle: "Footprinting",
  title: "FTP and vsFTPd Footprinting",
  summary:
    "How FTP works at the protocol level, how vsFTPd is configured and hardened on Linux, and how to enumerate, test, and inspect FTP services safely.",
  publishedAt: "2026-11-27",
  updatedAt: "2026-11-27",
  difficulty: "Core Service",
  readingTime: 14,
  tags: ["Security", "Footprinting", "FTP", "vsFTPd", "Linux", "Enumeration"],
  protocolBadge: "TCP/IP Application Layer",
  ports: "TCP 21 (Control), TCP 20 / PASV (Data)",
  daemon: "vsFTPd (/etc/vsftpd.conf)",
  overviewSheetImage: "/media/notes/security/footprinting/ftp/ftp-overview-full.jpg",
  quickFacts: [
    {
      label: "Protocol Role",
      value: "Upload, download, list, organize, and delete files across hosts.",
      inspectorId: "ftp-protocol"
    },
    {
      label: "Authentication",
      value: "Local Linux accounts via PAM (/etc/pam.d/vsftpd) or anonymous access.",
      inspectorId: "pam_service_name"
    },
    {
      label: "Transport Security",
      value: "Standard FTP is plain text; FTPS adds SSL/TLS protection.",
      inspectorId: "ftp-ftps-sftp"
    },
    {
      label: "Enumeration Surface",
      value: "220 banners, anonymous login, write checks, NSE scripts, and TLS certs.",
      inspectorId: "nmap-ftp-full-scan"
    }
  ],
  diagrams: [
    {
      id: "ftp-two-channels",
      figLabel: "Two Channels",
      partId: "overview",
      title: "Control and Data Connections",
      summary:
        "FTP keeps commands on TCP port 21 and opens a separate TCP connection for directory listings and file payloads.",
      keyPoints: [
        "The Control Channel on TCP port 21 carries commands such as USER, PASS, LIST, STOR, RETR, PORT, and PASV along with numeric status codes.",
        "The Data Channel opens a separate TCP connection whenever files or directory listings are transferred.",
        "Both connections become bidirectional after setup, and transfers can resume when both ends support restart markers."
      ],
      imageSrc: "/media/notes/security/footprinting/ftp/ftp-two-channels.png",
      swapPath: "public/media/notes/security/footprinting/ftp/ftp-two-channels.png",
      alt: "Diagram showing Client and FTP Server connected by Control Channel on TCP port 21 and a separate Data Channel with example commands USER, PASS, LIST, STOR, RETR, PORT, PASV.",
      aspectRatio: "1000 / 224",
      relatedInspectorIds: ["ftp-protocol", "connect_from_port_20"]
    },
    {
      id: "ftp-active-mode",
      figLabel: "Active FTP",
      partId: "overview",
      title: "Active FTP (PORT)",
      summary:
        "The client sends a PORT command over TCP 21, and the server initiates the data connection back from port 20.",
      keyPoints: [
        "1. Client initiates the control connection to server TCP port 21.",
        "2. Client sends PORT (for example port 51001) over the control channel.",
        "3. Server opens the data connection from source port 20 to the client port.",
        "Client firewalls or NAT routers often block incoming connections from the server."
      ],
      imageSrc: "/media/notes/security/footprinting/ftp/ftp-active-mode.png",
      swapPath: "public/media/notes/security/footprinting/ftp/ftp-active-mode.png",
      alt: "Active FTP flow diagram showing client port 51000 connecting to server port 21, PORT command, and server port 20 initiating the data connection back to client port 51001.",
      aspectRatio: "498 / 310",
      relatedInspectorIds: ["active-ftp", "connect_from_port_20"]
    },
    {
      id: "ftp-passive-mode",
      figLabel: "Passive FTP",
      partId: "overview",
      title: "Passive FTP (PASV)",
      summary:
        "The client sends PASV, receives a listening port from the server, and initiates both TCP connections outbound.",
      keyPoints: [
        "1. Client initiates the control connection to server TCP port 21.",
        "2. Client sends PASV over the control channel.",
        "3. Server responds with an available ephemeral port (for example 52000).",
        "4. Client connects outbound to server port 52000, avoiding most client firewall blocks."
      ],
      imageSrc: "/media/notes/security/footprinting/ftp/ftp-passive-mode.png",
      swapPath: "public/media/notes/security/footprinting/ftp/ftp-passive-mode.png",
      alt: "Passive FTP flow diagram showing client connecting to port 21, sending PASV, receiving port 52000, and client port 51002 initiating the data connection to server port 52000.",
      aspectRatio: "505 / 310",
      relatedInspectorIds: ["passive-ftp", "code-200"]
    },
    {
      id: "ftp-quick-facts",
      figLabel: "Overview Sheet Slice",
      partId: "setup",
      title: "FTP Capabilities and Security Summary",
      summary:
        "Quick reference comparing core FTP file operations, standard authentication, plain-text transport, and anonymous access.",
      keyPoints: [
        "FTP defines the network protocol; a daemon such as vsFTPd implements it on the host.",
        "Standard FTP transmits credentials and data in plain text unless FTPS is enabled.",
        "Configuration defaults live in /etc/vsftpd.conf while full options are documented in man vsftpd.conf."
      ],
      imageSrc: "/media/notes/security/footprinting/ftp/ftp-quick-facts.png",
      swapPath: "public/media/notes/security/footprinting/ftp/ftp-quick-facts.png",
      alt: "Summary cards for FTP capabilities, username/password authentication, cleartext security, and anonymous FTP.",
      aspectRatio: "1000 / 74",
      relatedInspectorIds: ["vsftpd", "daemon-concept", "vsftpd-conf"]
    },
    {
      id: "ftp-chroot-sandbox",
      figLabel: "Chroot Sandbox",
      partId: "config",
      subSectionId: "auth-access",
      title: "Pre-Login Sandbox Isolation (secure_chroot_dir)",
      summary:
        "Unprivileged pre-authentication vsFTPd handlers run inside /var/run/vsftpd/empty, separated from /etc, /home, and /var.",
      keyPoints: [
        "Incoming FTP commands arrive before a user logs in.",
        "vsFTPd confines pre-login worker processes inside /var/run/vsftpd/empty as their apparent root directory.",
        "If an isolated process is compromised, this sandbox limits access to system files.",
        "This directory is not used for sharing, uploading, or downloading files."
      ],
      placeholderKind: "chroot-sandbox",
      swapPath: "public/media/notes/security/footprinting/ftp/ftp-chroot-sandbox.png",
      alt: "Diagram showing FTP Client incoming commands entering a Linux Server where the vsFTPd process is isolated inside an empty Sandbox directory at /var/run/vsftpd/empty, separated from /etc, /home, and /var.",
      relatedInspectorIds: ["secure_chroot_dir", "least-privilege"]
    },
    {
      id: "ftp-protocol-security",
      figLabel: "Transport Modes",
      partId: "config",
      subSectionId: "encryption",
      title: "FTP vs FTPS vs SFTP Transport Security",
      summary:
        "Standard FTP sends credentials and data in plain text, FTPS adds SSL/TLS to FTP, and SFTP runs inside an encrypted SSH channel.",
      keyPoints: [
        "FTP sends usernames, passwords, and file contents unencrypted over the wire.",
        "FTPS adds TLS support via ssl_enable=YES, rsa_cert_file, and rsa_private_key_file.",
        "SFTP is the SSH File Transfer Protocol running over SSH, separate from vsFTPd."
      ],
      placeholderKind: "protocol-security",
      swapPath: "public/media/notes/security/footprinting/ftp/ftp-protocol-security.png",
      alt: "Comparison schematic contrasting plain text FTP, SSL/TLS-encrypted FTPS, and SSH-encrypted SFTP.",
      relatedInspectorIds: ["ftp-ftps-sftp", "ssl_enable"]
    },
    {
      id: "ftp-anon-enum",
      figLabel: "Anonymous Sequence",
      partId: "enumeration",
      title: "Anonymous Banner and Enumeration Flow",
      summary:
        "Typical reconnaissance flow from receiving the 220 welcome banner through anonymous login (230) and directory listing (150 to 226).",
      keyPoints: [
        "A 220 greeting often reveals the server software, version, or custom organization labels.",
        "A 230 response to anonymous login allows directory listing without personal credentials.",
        "Code 150 opens the Data Channel for ls output and code 226 confirms transfer completion."
      ],
      placeholderKind: "anon-enum",
      swapPath: "public/media/notes/security/footprinting/ftp/ftp-anon-enum.png",
      alt: "Sequence diagram illustrating TCP 21 connection, 220 banner, anonymous login 230, and ls directory listing 150 to 226.",
      relatedInspectorIds: ["code-220", "code-230", "code-150", "code-226", "code-530"]
    },
    {
      id: "ftp-diagnostics",
      figLabel: "Client vs Server",
      partId: "diagnostics",
      title: "Local Client Diagnostics vs Protocol STAT",
      summary:
        "Distinguishes local FTP client diagnostics (status, debug, trace) from server-queried status via quote STAT.",
      keyPoints: [
        "status, debug, and trace inspect client settings and outbound commands locally.",
        "quote STAT sends an FTP protocol STAT command over the control channel to query the server.",
        "debug and trace increase client-side visibility without necessarily causing extra server output."
      ],
      placeholderKind: "diagnostics",
      swapPath: "public/media/notes/security/footprinting/ftp/ftp-diagnostics.png",
      alt: "Diagram separating local FTP client visibility commands (status, debug, trace) from remote server query command (quote STAT).",
      relatedInspectorIds: ["cmd-status", "cmd-stat", "cmd-debug", "cmd-trace"]
    },
    {
      id: "ftp-nmap-trace",
      figLabel: "Nmap Trace",
      partId: "nmap-footprinting",
      title: "Nmap Script Trace Client-Server Connections",
      summary:
        "NSE scripts open separate local ephemeral source ports toward target port 21 and log each control-channel packet when --script-trace is enabled.",
      keyPoints: [
        "Example NSE trace shows attacker source port 54228 connecting to target FTP port 21.",
        "Different NSE scripts open distinct local source ports to keep script probes independent.",
        "--script-trace exposes exact commands sent and raw server banners returned."
      ],
      placeholderKind: "nmap-trace",
      swapPath: "public/media/notes/security/footprinting/ftp/ftp-nmap-trace.png",
      alt: "Client-server diagram showing Nmap scanner 10.10.14.4 using ephemeral local ports 54228 and 54230 to query target FTP server 10.129.14.136 on port 21.",
      relatedInspectorIds: ["nmap-script-trace-full", "nmap-ftp-full-scan"]
    }
  ],
  parts: [
    {
      id: "overview",
      shortTitle: "How FTP Works",
      title: "How FTP Works",
      intro:
        "FTP (File Transfer Protocol) is one of the oldest Internet protocols and runs at the application layer of the TCP/IP stack alongside HTTP and POP. Unlike single-connection protocols, FTP separates control signaling and data transfer across two TCP sockets.",
      diagramIds: ["ftp-two-channels", "ftp-active-mode", "ftp-passive-mode"],
      blocks: [
        {
          type: "paragraph",
          text: "The Control Channel stays open on TCP port 21 to send commands such as `USER`, `PASS`, `LIST`, `STOR`, `RETR`, `PORT`, and `PASV` and receive three-digit status codes. Whenever you request a directory listing or transfer a file, FTP opens a separate Data Channel. Both connections work in both directions once established, and interrupted transfers can resume if both client and server support restart markers."
        },
        {
          type: "diagram-embed",
          diagramIds: ["ftp-two-channels"],
          layout: "single"
        },
        {
          type: "subheading",
          text: "Active and Passive FTP",
          level: 3
        },
        {
          type: "paragraph",
          text: "FTP supports two modes for establishing the Data Channel, depending on which side opens the second TCP socket. In Active FTP (`PORT`), the client tells the server which client port to connect back to, and the server initiates the data socket from port 20. Client-side firewalls and NAT gateways often block that inbound connection. In Passive FTP (`PASV`), the server opens a high ephemeral port (such as `52000`) and lets the client initiate both control and data connections outbound."
        },
        {
          type: "diagram-embed",
          diagramIds: ["ftp-active-mode", "ftp-passive-mode"],
          layout: "pair",
          caption:
            "Arrows indicate which side initiates the TCP connection, not the direction of file transfer."
        },
        {
          type: "context-links",
          links: [
            { label: "How does dual-channel FTP work?", inspectorId: "ftp-protocol" },
            { label: "Active vs Passive firewall behavior", inspectorId: "active-ftp" },
            { label: "FTP vs FTPS vs SFTP", inspectorId: "ftp-ftps-sftp" }
          ]
        }
      ]
    },
    {
      id: "setup",
      shortTitle: "vsFTPd Setup",
      title: "Installing and Configuring vsFTPd",
      intro:
        "FTP defines the communication rules, while server software implements the protocol on an operating system. On Linux, vsFTPd (Very Secure FTP Daemon) is one of the most common FTP servers.",
      diagramIds: ["ftp-quick-facts"],
      blocks: [
        {
          type: "paragraph",
          text: "A daemon is a background program that stays resident or starts on demand to provide a system service. Install vsFTPd on Debian or Ubuntu systems with `apt`:"
        },
        {
          type: "terminal",
          terminal: {
            id: "term-install-vsftpd",
            title: "Install vsFTPd",
            environment: "LINUX",
            copyCommand: "sudo apt install vsftpd",
            lines: [
              { kind: "command", prompt: "$", text: "sudo apt install vsftpd", copyable: true }
            ]
          }
        },
        {
          type: "paragraph",
          text: "The main configuration file lives at `/etc/vsftpd.conf`. It governs daemon networking, permissions, authentication rules, banners, logging, and TLS support. Because the default file leaves out many optional settings, filter out comments to inspect what is currently active, and consult the built-in manual page for every available directive."
        },
        {
          type: "terminal",
          terminal: {
            id: "term-read-vsftpd-conf",
            title: "Inspect active directives and manual",
            environment: "LINUX",
            copyCommand: 'cat /etc/vsftpd.conf | grep -v "#"',
            lines: [
              {
                kind: "command",
                prompt: "$",
                text: 'cat /etc/vsftpd.conf | grep -v "#"',
                copyable: true
              },
              {
                kind: "command",
                prompt: "$",
                text: "man vsftpd.conf",
                copyable: true
              }
            ]
          }
        },
        {
          type: "context-links",
          links: [
            { label: "View FTP summary diagram", diagramId: "ftp-quick-facts" },
            { label: "Extended configuration details", inspectorId: "vsftpd-conf" }
          ]
        }
      ]
    },
    {
      id: "config",
      shortTitle: "vsFTPd Configuration",
      title: "vsFTPd Configuration Settings",
      intro:
        "Every option below is set in `/etc/vsftpd.conf`. Settings are grouped by function so you can see how each affects network exposure, filesystem boundaries, logging, and encryption.",
      diagramIds: ["ftp-chroot-sandbox", "ftp-protocol-security"],
      blocks: [
        {
          type: "subheading",
          text: "Network and Connection Settings",
          level: 3
        },
        {
          type: "settings-table",
          id: "tbl-network-settings",
          rows: [
            {
              setting: "listen=NO",
              summary:
                "Runs vsFTPd in on-demand mode via a superserver such as inetd when listen_ipv6 is also NO; if YES, runs standalone for IPv4.",
              riskLevel: "info",
              inspectorId: "listen"
            },
            {
              setting: "listen_ipv6=YES",
              summary:
                "Allows vsFTPd to run independently and listen for incoming connections on an IPv6 socket.",
              riskLevel: "safe",
              inspectorId: "listen_ipv6"
            },
            {
              setting: "connect_from_port_20=YES",
              summary:
                "Uses server TCP port 20 as the source port when opening Active FTP Data Connections.",
              riskLevel: "info",
              inspectorId: "connect_from_port_20"
            }
          ]
        },
        {
          type: "paragraph",
          text: "The `listen` directive controls how vsFTPd runs. In standalone mode, vsFTPd runs continuously and waits for connections itself. In on-demand mode, another service such as `inetd` listens on TCP port 21 and spawns vsFTPd only when a client connects, saving memory on systems where FTP is rarely used. When `listen=NO` and `listen_ipv6=YES`, vsFTPd still runs independently via its IPv6 socket."
        },
        {
          type: "paragraph",
          text: "From a penetration testing perspective, running vsFTPd on demand does not hide FTP from port scanning. TCP port 21 still reports as open because `inetd` or `systemd` is bound to the listening socket. On-demand activation exists for resource management, not stealth."
        },
        {
          type: "subheading",
          text: "Authentication and Access Control",
          level: 3
        },
        {
          type: "settings-table",
          id: "tbl-auth-settings",
          rows: [
            {
              setting: "anonymous_enable=NO",
              summary:
                "Disables anonymous logins so clients must authenticate with a valid account.",
              riskLevel: "safe",
              inspectorId: "anonymous_enable_no"
            },
            {
              setting: "local_enable=YES",
              summary:
                "Permits existing Linux system accounts to log in to the FTP service.",
              riskLevel: "info",
              inspectorId: "local_enable"
            },
            {
              setting: "pam_service_name=vsftpd",
              summary:
                "Selects the PAM authentication profile located at /etc/pam.d/vsftpd.",
              riskLevel: "info",
              inspectorId: "pam_service_name"
            },
            {
              setting: "secure_chroot_dir=/var/run/vsftpd/empty",
              summary:
                "Empty restricted directory used to isolate pre-login vsFTPd processes from system files.",
              riskLevel: "safe",
              inspectorId: "secure_chroot_dir"
            }
          ]
        },
        {
          type: "paragraph",
          text: "PAM stands for Pluggable Authentication Modules, the Linux authentication framework shared by FTP, SSH, and `sudo`. Its policy file for vsFTPd usually sits at `/etc/pam.d/vsftpd` and governs checks such as verifying local passwords and honoring denied user lists."
        },
        {
          type: "paragraph",
          text: "The `secure_chroot_dir` directive defines an empty, restricted directory where vsFTPd isolates processes that handle incoming commands before a client authenticates. Making that empty folder the process root follows the Principle of Least Privilege: if an attacker exploits a pre-login bug, the isolated worker cannot traverse into `/etc`, `/home`, or `/var`. This directory is never used for sharing, uploading, or downloading files."
        },
        {
          type: "diagram-embed",
          diagramIds: ["ftp-chroot-sandbox"],
          layout: "single"
        },
        {
          type: "subheading",
          text: "Ownership and Access Control",
          level: 3
        },
        {
          type: "settings-table",
          id: "tbl-ownership-settings",
          rows: [
            {
              setting: "chown_uploads=YES",
              summary:
                "Changes ownership of files uploaded through anonymous sessions to a chosen account.",
              riskLevel: "info",
              inspectorId: "chown_uploads"
            },
            {
              setting: "chown_username=username",
              summary:
                "Specifies which Linux user receives ownership of anonymously uploaded files.",
              riskLevel: "info",
              inspectorId: "chown_username"
            },
            {
              setting: "local_enable=YES",
              summary:
                "Allows existing Linux system users to authenticate to FTP.",
              riskLevel: "info",
              inspectorId: "local_enable"
            },
            {
              setting: "chroot_local_user=YES",
              summary:
                "Restricts local FTP users to their configured root, normally their Linux home directory.",
              riskLevel: "safe",
              inspectorId: "chroot_local_user"
            },
            {
              setting: "chroot_list_enable=YES",
              summary:
                "Enables a user exception or confinement list whose meaning flips with chroot_local_user.",
              riskLevel: "info",
              inspectorId: "chroot_list_enable"
            }
          ]
        },
        {
          type: "paragraph",
          text: "The `chroot_list_enable` and `chroot_local_user` directives work together using `/etc/vsftpd.chroot_list` by default. When `chroot_local_user=YES`, all local users are confined to their home directories except users listed in `/etc/vsftpd.chroot_list`, who act as exceptions and can browse outside their home folders. When `chroot_local_user=NO`, local users are not restricted by default, and only accounts listed inside `/etc/vsftpd.chroot_list` are confined."
        },
        {
          type: "context-links",
          links: [
            { label: "How do chroot_local_user and chroot_list_enable interact?", inspectorId: "chroot_list_enable" }
          ]
        },
        {
          type: "subheading",
          text: "Information Disclosure and Directory Listing",
          level: 3
        },
        {
          type: "settings-table",
          id: "tbl-disclosure-settings",
          rows: [
            {
              setting: "hide_ids=YES",
              summary:
                "Displays file owner and group columns as ftp instead of real Linux usernames or UIDs.",
              riskLevel: "safe",
              inspectorId: "hide_ids"
            },
            {
              setting: "ls_recurse_enable=YES",
              summary:
                "Allows recursive directory listings via LIST -R so clients can traverse subdirectories in one command.",
              riskLevel: "info",
              inspectorId: "ls_recurse_enable"
            }
          ]
        },
        {
          type: "subheading",
          text: "Understanding hide_ids",
          level: 4
        },
        {
          type: "paragraph",
          text: "Normally, FTP directory listings display the numeric or named owner and group of every stored file. With `hide_ids=YES`, vsFTPd masks those identifiers cleanly without changing real file ownership or Linux filesystem permissions:"
        },
        {
          type: "code-sample",
          lines: [
            "-rw-rw-r-- 1 1002 1002 Calendar.pptx   # Default listing exposes UID/username",
            "-rw-rw-r-- 1 ftp  ftp  Calendar.pptx   # With hide_ids=YES enabled"
          ],
          caption:
            "hide_ids=YES changes only what FTP directory listings display to clients; on-disk permissions remain unchanged."
        },
        {
          type: "paragraph",
          text: "During penetration testing, exposed usernames or UID mappings from an FTP listing can reveal real local accounts that may also be valid on other services such as SSH. Separately, automated defenses like `Fail2ban` can reduce repeated brute-force login attempts by watching authentication logs and temporarily blocking offending client IP addresses when configured properly."
        },
        {
          type: "context-links",
          links: [
            { label: "Security implications of hide_ids", inspectorId: "hide_ids" }
          ]
        },
        {
          type: "subheading",
          text: "Messages, Time, and Logging",
          level: 3
        },
        {
          type: "settings-table",
          id: "tbl-messages-settings",
          rows: [
            {
              setting: "dirmessage_enable=YES",
              summary:
                "Displays a directory notice when a user changes into a configured folder.",
              riskLevel: "info",
              inspectorId: "dirmessage_enable"
            },
            {
              setting: "message_file=.message",
              summary:
                "Names the file inside a directory containing the entry message text.",
              riskLevel: "info",
              inspectorId: "message_file"
            },
            {
              setting: "ftpd_banner=Welcome to FTP Server",
              summary:
                "Defines the welcome banner sent with response 220 directly inside vsftpd.conf.",
              riskLevel: "info",
              inspectorId: "ftpd_banner"
            },
            {
              setting: "banner_file=/etc/ftp_banner.txt",
              summary:
                "Loads the 220 welcome greeting from an external file and takes priority over ftpd_banner.",
              riskLevel: "info",
              inspectorId: "banner_file"
            },
            {
              setting: "use_localtime=YES",
              summary:
                "Uses the server local timezone for directory listing timestamps instead of GMT.",
              riskLevel: "safe",
              inspectorId: "use_localtime"
            },
            {
              setting: "xferlog_enable=YES",
              summary:
                "Logs file uploads and downloads for auditing and troubleshooting.",
              riskLevel: "safe",
              inspectorId: "xferlog_enable"
            }
          ]
        },
        {
          type: "paragraph",
          text: "Both `ftpd_banner` and `banner_file` control the `220` greeting returned on initial connection (`220 Welcome to FTP Server`), but if both directives are set, `banner_file` overrides `ftpd_banner`."
        },
        {
          type: "subheading",
          text: "Encryption and Security",
          level: 3
        },
        {
          type: "settings-table",
          id: "tbl-encryption-settings",
          rows: [
            {
              setting: "ssl_enable=NO",
              summary:
                "Disables SSL/TLS transport encryption. Set to YES to support encrypted FTPS sessions.",
              riskLevel: "danger",
              inspectorId: "ssl_enable"
            },
            {
              setting: "rsa_cert_file=/etc/ssl/certs/ssl-cert-snakeoil.pem",
              summary:
                "Path to the X.509 server TLS certificate used during FTPS handshakes.",
              riskLevel: "info",
              inspectorId: "rsa_cert_file"
            },
            {
              setting: "rsa_private_key_file=/etc/ssl/private/ssl-cert-snakeoil.key",
              summary:
                "Path to the private key paired with the server TLS certificate.",
              riskLevel: "info",
              inspectorId: "rsa_private_key_file"
            }
          ]
        },
        {
          type: "paragraph",
          text: "Standard FTP transmits usernames, passwords, directory listings, and file payloads in plain text, making every session readable via passive network sniffing. Enabling `ssl_enable=YES` adds FTPS support, though additional directives are required to force every client to use encryption rather than leaving TLS optional."
        },
        {
          type: "comparison-table",
          id: "tbl-protocol-security",
          title: "Protocol Security Comparison",
          columns: ["Protocol", "Security Mechanism", "Footprinting Note"],
          rows: [
            {
              cells: [
                "FTP",
                "Plain text",
                "Credentials and transferred data can be captured directly on the wire."
              ],
              inspectorId: "ftp-ftps-sftp"
            },
            {
              cells: [
                "FTPS",
                "SSL/TLS encryption",
                "Wraps FTP in TLS when ssl_enable=YES; server certificates can reveal org details."
              ],
              inspectorId: "ssl_enable"
            },
            {
              cells: [
                "SFTP",
                "SSH encryption",
                "Subsystem of SSH (usually port 22), separate from vsFTPd."
              ],
              inspectorId: "ftp-ftps-sftp"
            }
          ]
        },
        {
          type: "context-links",
          links: [
            { label: "View transport diagram", diagramId: "ftp-protocol-security" },
            { label: "Security implications of optional TLS", inspectorId: "ssl_enable" }
          ]
        }
      ]
    },
    {
      id: "users",
      shortTitle: "FTP Users",
      title: "FTP Users and Access Control (/etc/ftpusers)",
      intro:
        "Even when local_enable=YES lets system users log in via FTP, `/etc/ftpusers` defines an explicit denylist enforced during PAM authentication.",
      diagramIds: [],
      blocks: [
        {
          type: "terminal",
          terminal: {
            id: "term-etc-ftpusers",
            title: "Read /etc/ftpusers denylist",
            environment: "LINUX",
            copyCommand: "cat /etc/ftpusers",
            lines: [
              { kind: "command", prompt: "$", text: "cat /etc/ftpusers", copyable: true },
              { kind: "output", text: "guest\njohn\nkevin" }
            ]
          }
        },
        {
          type: "paragraph",
          text: "Users listed in `/etc/ftpusers` cannot authenticate to the FTP service even if they have valid Linux system accounts and passwords. Administrators use this denylist to protect privileged or sensitive accounts such as `root` or service identities from unnecessary FTP exposure."
        },
        {
          type: "context-links",
          links: [
            { label: "How /etc/ftpusers and PAM interact", inspectorId: "etc-ftpusers" }
          ]
        }
      ]
    },
    {
      id: "anonymous",
      shortTitle: "Anonymous & Risks",
      title: "Dangerous Settings and Anonymous Access",
      intro:
        "Anonymous FTP lets clients connect without a personal username or password. It is occasionally used in internal networks for simple file distribution, but permissive settings create serious exposure.",
      diagramIds: ["ftp-anon-enum"],
      blocks: [
        {
          type: "settings-table",
          id: "tbl-dangerous-settings",
          rows: [
            {
              setting: "anonymous_enable=YES",
              summary: "Allows clients to authenticate as the anonymous account.",
              riskLevel: "danger",
              inspectorId: "anonymous_enable_yes"
            },
            {
              setting: "no_anon_password=YES",
              summary: "Logs anonymous sessions in immediately without checking a password.",
              riskLevel: "danger",
              inspectorId: "no_anon_password"
            },
            {
              setting: "anon_root=/home/username/ftp",
              summary: "Sets the directory exposed as root to anonymous sessions.",
              riskLevel: "info",
              inspectorId: "anon_root"
            },
            {
              setting: "write_enable=YES",
              summary: "Enables FTP commands that alter files or folders on the server.",
              riskLevel: "danger",
              inspectorId: "write_enable"
            },
            {
              setting: "anon_upload_enable=YES",
              summary: "Lets anonymous clients upload files when OS permissions also permit.",
              riskLevel: "danger",
              inspectorId: "anon_upload_enable"
            },
            {
              setting: "anon_mkdir_write_enable=YES",
              summary: "Lets anonymous clients create directories when OS permissions also permit.",
              riskLevel: "danger",
              inspectorId: "anon_mkdir_write_enable"
            }
          ]
        },
        {
          type: "bullets",
          lead: "When enabled loosely, anonymous and write directives create several risks:",
          items: [
            "Unauthorized read access to sensitive documents or configuration files.",
            "Information disclosure through exposed folder trees and filenames.",
            "Uploading unwanted or malicious payloads onto the server.",
            "Creating unauthorized directories and abusing server disk capacity."
          ]
        },
        {
          type: "paragraph",
          text: "Anonymous write operations require both `write_enable=YES` in `/etc/vsftpd.conf` and matching write permissions on the underlying Linux directory."
        }
      ]
    },
    {
      id: "enumeration",
      shortTitle: "Anonymous Enumeration",
      title: "Anonymous Login and Server Enumeration",
      intro:
        "During authorized testing in lab environments (all IP examples here reference the HTB lab host `10.129.14.136`), connecting with the standard `ftp` client reveals the banner, checks anonymous access, and lists exposed paths.",
      diagramIds: ["ftp-anon-enum"],
      blocks: [
        {
          type: "diagram-embed",
          diagramIds: ["ftp-anon-enum"],
          layout: "single"
        },
        {
          type: "terminal",
          terminal: {
            id: "term-ftp-anon-connect",
            title: "Connect as anonymous user",
            environment: "FTP CLIENT",
            copyCommand: "ftp 10.129.14.136",
            lines: [
              { kind: "command", prompt: "$", text: "ftp 10.129.14.136", copyable: true },
              { kind: "output", text: "Connected to 10.129.14.136." },
              {
                kind: "response",
                text: '220 "Welcome to the HTB Academy vsFTP service."',
                statusTone: "ok"
              },
              { kind: "input", prompt: "Name:", text: "anonymous" },
              { kind: "response", text: "230 Login successful.", statusTone: "ok" },
              {
                kind: "output",
                text: "Remote system type is UNIX.\nUsing binary mode to transfer files."
              }
            ]
          }
        },
        {
          type: "paragraph",
          text: "Upon TCP connection, the server sends response code `220` with its welcome banner. That banner frequently reveals FTP server software, versions, or custom organization labels. Once logged in with `230`, listing the root directory provides useful intelligence even before downloading any file:"
        },
        {
          type: "terminal",
          terminal: {
            id: "term-ftp-ls",
            title: "List exposed directories",
            environment: "FTP CLIENT",
            copyCommand: "ls",
            lines: [
              { kind: "command", prompt: "ftp>", text: "ls", copyable: true },
              {
                kind: "response",
                text: "200 PORT command successful. Consider using PASV.",
                statusTone: "ok"
              },
              {
                kind: "response",
                text: "150 Here comes the directory listing.",
                statusTone: "info"
              },
              {
                kind: "output",
                text: "Calender.pptx\nClients/\nDocuments/\nEmployees/\nImportant Notes.txt"
              },
              { kind: "response", text: "226 Directory send OK.", statusTone: "ok" }
            ]
          }
        },
        {
          type: "paragraph",
          text: "Even if individual file downloads fail or are restricted, folder names such as `Clients/`, `Documents/`, and `Employees/` reveal internal organizational structure and likely naming patterns."
        },
        {
          type: "subheading",
          text: "Common FTP Response Codes",
          level: 3
        },
        {
          type: "comparison-table",
          id: "tbl-response-codes",
          columns: ["Code", "Meaning"],
          rows: [
            { cells: ["220", "Service ready for a new user."], inspectorId: "code-220" },
            { cells: ["230", "Login successful."], inspectorId: "code-230" },
            { cells: ["200", "Command successful."], inspectorId: "code-200" },
            { cells: ["150", "Preparing to open the Data Connection."], inspectorId: "code-150" },
            { cells: ["226", "Data transfer completed successfully."], inspectorId: "code-226" },
            { cells: ["530", "User not logged in."], inspectorId: "code-530" }
          ]
        }
      ]
    },
    {
      id: "diagnostics",
      shortTitle: "Debugging FTP",
      title: "Debugging FTP Communication",
      intro:
        "When transfers stall across firewalls or protocol behavior is unclear, client-side diagnostics show the exact FTP commands being issued on the wire.",
      diagramIds: ["ftp-diagnostics"],
      blocks: [
        {
          type: "comparison-table",
          id: "tbl-diagnostics-summary",
          columns: ["Command", "Description"],
          rows: [
            {
              cells: ["status", "Displays the current local FTP client settings and connection state."],
              inspectorId: "cmd-status"
            },
            {
              cells: [
                "quote STAT",
                "Sends the raw STAT protocol command to request status information from the server."
              ],
              inspectorId: "cmd-stat"
            },
            {
              cells: ["debug", "Prints the raw FTP protocol commands sent by the client."],
              inspectorId: "cmd-debug"
            },
            {
              cells: ["trace", "Enables packet tracing when supported by the FTP client."],
              inspectorId: "cmd-trace"
            }
          ]
        },
        {
          type: "paragraph",
          text: "Note the distinction between `status` and `STAT`: `status` checks local client state (transfer mode, type, verbosity, `PORT` usage), while `STAT` (`ftp> quote STAT`) asks the remote FTP server for server-side session and software details."
        },
        {
          type: "terminal",
          terminal: {
            id: "term-debug-trace-session",
            title: "Enable debug and trace during ls",
            environment: "FTP CLIENT",
            copyCommand: "debug\ntrace\nls",
            lines: [
              { kind: "command", prompt: "ftp>", text: "debug", copyable: true },
              { kind: "command", prompt: "ftp>", text: "trace", copyable: true },
              { kind: "command", prompt: "ftp>", text: "ls", copyable: true },
              { kind: "output", text: "---> PORT 10,10,14,4,188,195" },
              {
                kind: "response",
                text: "200 PORT command successful. Consider using PASV.",
                statusTone: "ok"
              },
              { kind: "output", text: "---> LIST" },
              {
                kind: "response",
                text: "150 Here comes the directory listing.",
                statusTone: "info"
              },
              { kind: "response", text: "226 Directory send OK.", statusTone: "ok" }
            ]
          }
        },
        {
          type: "paragraph",
          text: "In the debug trace above, the client sends `PORT` to open an Active FTP data socket before sending `LIST` to request the directory contents. Remember that `debug` and `trace` increase client-side visibility; they do not force the server to disclose additional information."
        },
        {
          type: "context-links",
          links: [
            { label: "View detailed output", inspectorId: "ftp-debug-detailed-output" },
            { label: "View client vs server diagram", diagramId: "ftp-diagnostics" }
          ]
        }
      ]
    },
    {
      id: "recursive-listing",
      shortTitle: "Recursive Listing",
      title: "Recursive Directory Listing",
      intro:
        "Standard `ls` inspects only the active working directory. When `ls_recurse_enable=YES` is configured on the server, you can enumerate accessible subfolders in a single request.",
      diagramIds: [],
      blocks: [
        {
          type: "paragraph",
          text: "Running `ftp> ls -R` maps nested folders and filenames recursively without manually `cd`-ing into every directory. This quickly reveals project structures, client folders, and template files."
        },
        {
          type: "terminal",
          terminal: {
            id: "term-ftp-ls-r",
            title: "Recursive FTP listing",
            environment: "FTP CLIENT",
            copyCommand: "ls -R",
            lines: [{ kind: "command", prompt: "ftp>", text: "ls -R", copyable: true }]
          }
        },
        {
          type: "context-links",
          links: [{ label: "View directory structure", inspectorId: "ftp-recursive-tree" }]
        }
      ]
    },
    {
      id: "file-transfers",
      shortTitle: "Downloading & Uploading",
      title: "Downloading and Uploading Files",
      intro:
        "Once directory enumeration highlights files of interest, the `get`, `wget`, and `put` commands verify what can be read from or written to the FTP server within an authorized test scope.",
      diagramIds: [],
      blocks: [
        {
          type: "subheading",
          text: "Downloading Files",
          level: 3
        },
        {
          type: "paragraph",
          text: "The `get` command downloads a single file from the server to your current working directory. Escape spaces in filenames (such as `Important\\ Notes.txt`) so the client parses one filename:"
        },
        {
          type: "terminal",
          terminal: {
            id: "term-ftp-get",
            title: "Download a single file",
            environment: "FTP CLIENT",
            copyCommand: "get Important\\ Notes.txt",
            lines: [
              {
                kind: "command",
                prompt: "ftp>",
                text: "get Important\\ Notes.txt",
                copyable: true
              },
              {
                kind: "response",
                text: "150 Opening BINARY mode data connection.",
                statusTone: "info"
              },
              { kind: "response", text: "226 Transfer complete.", statusTone: "ok" },
              { kind: "output", text: "41 bytes received." }
            ]
          }
        },
        {
          type: "paragraph",
          text: "Retrieved files often contain internal procedures, partial configuration data, usernames, or organizational context useful during authorized enumeration."
        },
        {
          type: "subheading",
          text: "Downloading All Accessible Files",
          level: 3
        },
        {
          type: "paragraph",
          text: "Instead of fetching files one by one, `wget` can mirror all accessible FTP files and subdirectories into a local directory named after the target host:"
        },
        {
          type: "terminal",
          terminal: {
            id: "term-wget-mirror",
            title: "Mirror accessible FTP files with wget",
            environment: "LINUX",
            copyCommand: "wget -m --no-passive ftp://anonymous:anonymous@10.129.14.136",
            lines: [
              {
                kind: "command",
                prompt: "$",
                text: "wget -m --no-passive ftp://anonymous:anonymous@10.129.14.136",
                copyable: true
              },
              { kind: "command", prompt: "$", text: "tree .", copyable: true }
            ]
          }
        },
        {
          type: "comparison-table",
          id: "tbl-wget-options",
          columns: ["Option", "Description"],
          rows: [
            { cells: ["-m", "Enables recursive mirroring of files and directories."] },
            { cells: ["--no-passive", "Uses Active FTP instead of Passive FTP when transferring."] }
          ]
        },
        {
          type: "paragraph",
          text: "After mirroring, run `tree .` inside the created host directory to inspect the offline hierarchy cleanly. Keep in mind that bulk downloading creates significant network traffic and logs that can trigger monitoring systems, so use this technique only in authorized engagements and within the agreed scope."
        },
        {
          type: "context-links",
          links: [{ label: "View download example", inspectorId: "ftp-wget-mirror" }]
        },
        {
          type: "subheading",
          text: "Uploading Files",
          level: 3
        },
        {
          type: "paragraph",
          text: "The `put` command sends a local file to the FTP server by translating the request into the `STOR` protocol command. To verify write permissions safely, create a harmless empty test file first:"
        },
        {
          type: "terminal",
          terminal: {
            id: "term-ftp-put",
            title: "Test write access with a harmless file",
            environment: "FTP CLIENT",
            copyCommand: "touch testupload.txt",
            lines: [
              { kind: "command", prompt: "$", text: "touch testupload.txt", copyable: true },
              { kind: "command", prompt: "ftp>", text: "put testupload.txt", copyable: true },
              { kind: "output", text: "---> STOR testupload.txt" },
              { kind: "response", text: "150 Ok to send data.", statusTone: "info" },
              { kind: "response", text: "226 Transfer complete.", statusTone: "ok" },
              { kind: "command", prompt: "ftp>", text: "ls", copyable: true }
            ]
          }
        },
        {
          type: "subheading",
          text: "Security Implications",
          level: 3
        },
        {
          type: "paragraph",
          text: "A successful `STOR` confirms write access in the current directory. FTP write permissions become especially dangerous when the FTP directory is shared with or synchronized to another service, such as a web application root. Depending on the surrounding application setup and other weaknesses, writable FTP storage can lead to:"
        },
        {
          type: "bullets",
          items: [
            "Unauthorized file modification.",
            "Exposure of sensitive information.",
            "Local File Inclusion (LFI).",
            "FTP log poisoning.",
            "Remote Code Execution (RCE).",
            "Privilege escalation."
          ]
        },
        {
          type: "paragraph",
          text: "FTP upload permission on its own does not mean uploaded files will execute automatically. Reaching code execution requires additional vulnerabilities, loose filesystem permissions, or an insecure integration between FTP and a downstream service."
        },
        {
          type: "context-links",
          links: [{ label: "Security implications checklist", inspectorId: "ftp-upload-risks" }]
        }
      ]
    },
    {
      id: "nmap-footprinting",
      shortTitle: "Nmap Footprinting",
      title: "Footprinting the FTP Service with Nmap",
      intro:
        "Network scanners locate FTP services on both standard port 21 and nonstandard ports, fingerprint versions, and run targeted NSE checks automatically.",
      diagramIds: ["ftp-nmap-trace"],
      blocks: [
        {
          type: "subheading",
          text: "Nmap FTP Scripts",
          level: 3
        },
        {
          type: "paragraph",
          text: "The Nmap Scripting Engine (NSE) ships scripts in `/usr/share/nmap/scripts/` tailored to FTP inspection. Update the script database and locate installed FTP scripts before running scans:"
        },
        {
          type: "terminal",
          terminal: {
            id: "term-nmap-find-scripts",
            title: "Update NSE index and locate FTP scripts",
            environment: "LINUX",
            copyCommand: 'find / -type f -name "ftp*" 2>/dev/null | grep scripts',
            lines: [
              { kind: "command", prompt: "$", text: "sudo nmap --script-updatedb", copyable: true },
              {
                kind: "command",
                prompt: "$",
                text: 'find / -type f -name "ftp*" 2>/dev/null | grep scripts',
                copyable: true
              }
            ]
          }
        },
        {
          type: "comparison-table",
          id: "tbl-nmap-scripts",
          columns: ["Script", "Purpose"],
          rows: [
            { cells: ["ftp-anon", "Checks whether anonymous FTP access is allowed."] },
            { cells: ["ftp-syst", "Collects FTP system and server status information."] },
            { cells: ["ftp-bounce", "Checks for FTP bounce behavior across third-party hosts."] },
            {
              cells: [
                "ftp-brute",
                "Tests FTP authentication against supplied wordlists in authorized tests."
              ]
            },
            { cells: ["ftp-vsftpd-backdoor", "Checks for a known vsFTPd backdoor vulnerability."] },
            { cells: ["ftp-proftpd-backdoor", "Checks for a known ProFTPD backdoor vulnerability."] },
            { cells: ["ftp-vuln-cve2010-4221", "Checks for a specific ProFTPD vulnerability."] },
            { cells: ["ftp-libopie", "Checks for a known libopie-related vulnerability."] }
          ]
        },
        {
          type: "paragraph",
          text: "Having an exploit or backdoor check script in `/usr/share/nmap/scripts/` does not imply a host is vulnerable. Use NSE scripts to verify conditions responsibly and inspect raw responses."
        },
        {
          type: "context-links",
          links: [
            {
              label: "Nmap NSE documentation",
              href: "https://nmap.org/book/nse.html"
            }
          ]
        },
        {
          type: "subheading",
          text: "FTP Enumeration Using Nmap",
          level: 3
        },
        {
          type: "paragraph",
          text: "Run an aggressive version and default-script scan against TCP port 21 on `10.129.14.136`:"
        },
        {
          type: "terminal",
          terminal: {
            id: "term-nmap-ftp-scan",
            title: "Scan TCP port 21 with version and default scripts",
            environment: "LINUX",
            copyCommand: "sudo nmap -sV -p21 -sC -A 10.129.14.136",
            lines: [
              {
                kind: "command",
                prompt: "$",
                text: "sudo nmap -sV -p21 -sC -A 10.129.14.136",
                copyable: true
              },
              {
                kind: "output",
                text: "PORT   STATE SERVICE VERSION\n21/tcp open  ftp     vsftpd 2.0.8 or later\n| ftp-anon: Anonymous FTP login allowed (FTP code 230)\n| ftp-syst:\n|   FTP server status:\n|     Logged in as ftp\n|     TYPE: ASCII\n|     Session timeout is 300 seconds\n|     Control connection is plain text\n|     Data connections will be plain text\n|_    vsFTPd 3.0.3"
              }
            ]
          }
        },
        {
          type: "comparison-table",
          id: "tbl-nmap-flags",
          columns: ["Option", "Description"],
          rows: [
            { cells: ["-p21", "Scans TCP port 21."] },
            { cells: ["-sV", "Probes open ports to detect service and version info."] },
            { cells: ["-sC", "Runs the default NSE script set."] },
            {
              cells: [
                "-A",
                "Enables OS detection, version detection, default scripts, and traceroute."
              ]
            }
          ]
        },
        {
          type: "paragraph",
          text: "Because `-A` already enables version detection and default NSE scripts, `-sV` and `-sC` are redundant when `-A` is passed. From the resulting scan output, the `ftp-anon` script verifies anonymous authentication and can list exposed directories, while `ftp-syst` sends protocol `SYST` and `STAT` queries to report:"
        },
        {
          type: "bullets",
          items: [
            "Whether port 21 is open and reachable.",
            "FTP server software and version string (vsFTPd 3.0.3).",
            "Whether anonymous login succeeds (code 230).",
            "Accessible files, subdirectories, and potentially writable paths.",
            "Configured session idle timeout (300 seconds).",
            "Plain-text vs TLS encryption state for control and data channels.",
            "General server status lines reported by STAT."
          ]
        },
        {
          type: "context-links",
          links: [{ label: "View full scan results", inspectorId: "nmap-ftp-full-scan" }]
        },
        {
          type: "subheading",
          text: "Nmap Script Trace",
          level: 3
        },
        {
          type: "paragraph",
          text: "Adding `--script-trace` prints the underlying network traffic generated by NSE scripts so you can see exactly which commands are sent, which local and remote ports are used, how sockets open, and what raw server banners come back:"
        },
        {
          type: "terminal",
          terminal: {
            id: "term-nmap-script-trace",
            title: "Observe NSE traffic with --script-trace",
            environment: "LINUX",
            copyCommand: "sudo nmap -sV -p21 -sC -A 10.129.14.136 --script-trace",
            lines: [
              {
                kind: "command",
                prompt: "$",
                text: "sudo nmap -sV -p21 -sC -A 10.129.14.136 --script-trace",
                copyable: true
              },
              {
                kind: "output",
                text: "NSE: TCP 10.10.14.4:54228 > 10.129.14.136:21 | CONNECT\nNSE: TCP 10.10.14.4:54228 < 10.129.14.136:21 | 220 Welcome to HTB-Academy FTP service."
              }
            ]
          }
        },
        {
          type: "paragraph",
          text: "In the snippet above, `10.10.14.4:54228` is Nmap's local ephemeral source port connecting to target port `21`. Different NSE scripts may open separate TCP connections using different local source ports."
        },
        {
          type: "diagram-embed",
          diagramIds: ["ftp-nmap-trace"],
          layout: "single"
        },
        {
          type: "context-links",
          links: [{ label: "View network trace", inspectorId: "nmap-script-trace-full" }]
        }
      ]
    },
    {
      id: "manual-and-tls",
      shortTitle: "Manual & TLS",
      title: "Manual Interaction and FTP over TLS",
      intro:
        "You can inspect banners or issue raw protocol commands without an FTP client using Netcat or Telnet, and upgrade control connections to TLS with OpenSSL when FTPS is configured.",
      diagramIds: [],
      blocks: [
        {
          type: "subheading",
          text: "Manual FTP Service Interaction",
          level: 3
        },
        {
          type: "paragraph",
          text: "Both Netcat and Telnet open a raw TCP connection to port 21 so you can grab the `220` greeting and send manual protocol commands such as `USER`, `PASS`, `SYST`, or `STAT`. Because neither tool establishes separate FTP Data Channels automatically, they cannot transfer files conveniently like a dedicated FTP client:"
        },
        {
          type: "terminal",
          terminal: {
            id: "term-nc-telnet",
            title: "Connect manually with Netcat or Telnet",
            environment: "LINUX",
            copyCommand: "nc -nv 10.129.14.136 21",
            lines: [
              { kind: "command", prompt: "$", text: "nc -nv 10.129.14.136 21", copyable: true },
              { kind: "command", prompt: "$", text: "telnet 10.129.14.136 21", copyable: true }
            ]
          }
        },
        {
          type: "context-links",
          links: [{ label: "View example session", inspectorId: "ftp-manual-nc-telnet" }]
        },
        {
          type: "subheading",
          text: "FTP over TLS and Certificate Inspection",
          level: 3
        },
        {
          type: "paragraph",
          text: "When the FTP server supports TLS (`ssl_enable=YES`), OpenSSL can start a standard FTP control connection and negotiate an encrypted upgrade via `-starttls ftp`:"
        },
        {
          type: "terminal",
          terminal: {
            id: "term-openssl-starttls",
            title: "Upgrade to TLS and inspect certificate",
            environment: "LINUX",
            copyCommand: "openssl s_client -connect 10.129.14.136:21 -starttls ftp",
            lines: [
              {
                kind: "command",
                prompt: "$",
                text: "openssl s_client -connect 10.129.14.136:21 -starttls ftp",
                copyable: true
              }
            ]
          }
        },
        {
          type: "comparison-table",
          id: "tbl-cert-fields",
          title: "Example Certificate Information",
          columns: ["Field", "Example"],
          rows: [
            { cells: ["Country", "US"] },
            { cells: ["State", "California"] },
            { cells: ["Locality", "Sacramento"] },
            { cells: ["Organization", "Inlanefreight"] },
            { cells: ["Organizational Unit", "Dev"] },
            { cells: ["Common Name", "master.inlanefreight.htb"] },
            { cells: ["Email Address", "admin@inlanefreight.htb"] },
            { cells: ["Certificate Type", "Self-signed"] }
          ]
        },
        {
          type: "paragraph",
          text: "Subject and issuer details in an FTPS certificate often disclose internal hostnames, organization or team names, email addresses, and geographic context during footprinting. Always cross-check these fields rather than treating them as verified truth, especially when the certificate is self-signed."
        },
        {
          type: "context-links",
          links: [{ label: "Inspect certificate", inspectorId: "ftp-tls-certificate" }]
        }
      ]
    }
  ],
  inspectors: {
    "ftp-protocol": {
      id: "ftp-protocol",
      label: "FTP Dual-Channel Model",
      category: "Protocol",
      shortDefinition:
        "Application-layer protocol using two separate TCP connections: a Control Channel on port 21 and a Data Channel for file transfers and directory listings.",
      details: [
        "FTP sits at the TCP/IP application layer alongside HTTP and POP.",
        "Control Channel (TCP port 21) carries USER, PASS, LIST, STOR, RETR, PORT, PASV, and status codes.",
        "Data Channel uses a second TCP socket for directory output and files; both sockets are bidirectional after establishment."
      ],
      diagramId: "ftp-two-channels",
      relatedIds: ["active-ftp", "passive-ftp", "vsftpd"]
    },
    "active-ftp": {
      id: "active-ftp",
      label: "Active FTP (PORT)",
      category: "Concept",
      shortDefinition:
        "Mode where the client opens TCP 21, sends PORT with a listening port (for example 51001), and the server connects back from port 20.",
      details: [
        "1. Client initiates control socket to server TCP 21.",
        "2. Client sends PORT command telling the server which client port to connect to.",
        "3. Server opens the Data Connection from port 20 to the client port."
      ],
      securityNote:
        "Client firewalls or NAT routers frequently drop incoming server-initiated data connections in Active mode.",
      diagramId: "ftp-active-mode",
      relatedIds: ["passive-ftp", "connect_from_port_20"]
    },
    "passive-ftp": {
      id: "passive-ftp",
      label: "Passive FTP (PASV)",
      category: "Concept",
      shortDefinition:
        "Mode where the server advertises a listening data port (for example 52000) in response to PASV so the client initiates both TCP connections.",
      details: [
        "1. Client opens control socket to server TCP 21.",
        "2. Client sends PASV command.",
        "3. Server replies with its listening data port.",
        "4. Client opens the outbound data socket to that server port."
      ],
      securityNote:
        "Works reliably through client firewalls and NAT because both sockets originate from the client.",
      diagramId: "ftp-passive-mode",
      relatedIds: ["active-ftp", "code-200"]
    },
    vsftpd: {
      id: "vsftpd",
      label: "vsFTPd Daemon",
      category: "Concept",
      shortDefinition:
        "Very Secure FTP Daemon: a widely used Linux FTP server implementing privilege separation, chroot isolation, and optional TLS.",
      details: [
        "Installed via sudo apt install vsftpd on Debian and Ubuntu hosts.",
        "Controlled primarily from /etc/vsftpd.conf."
      ],
      terminal: {
        id: "insp-term-vsftpd",
        title: "Install vsFTPd",
        environment: "LINUX",
        copyCommand: "sudo apt install vsftpd",
        lines: [{ kind: "command", prompt: "$", text: "sudo apt install vsftpd", copyable: true }]
      },
      diagramId: "ftp-quick-facts",
      relatedIds: ["daemon-concept", "vsftpd-conf"]
    },
    "daemon-concept": {
      id: "daemon-concept",
      label: "Daemon",
      category: "Concept",
      shortDefinition:
        "A background program that runs continuously or on demand to provide a system or network service.",
      details: [
        "Daemons bind sockets (such as TCP 21) or are spawned by a superserver like inetd when connections arrive."
      ],
      relatedIds: ["vsftpd", "listen"]
    },
    "vsftpd-conf": {
      id: "vsftpd-conf",
      label: "/etc/vsftpd.conf",
      category: "Directive",
      shortDefinition:
        "Primary configuration file controlling vsFTPd networking, access control, banners, chroot sandboxes, logging, and TLS.",
      details: [
        "Filter comments with cat /etc/vsftpd.conf | grep -v \"#\" to read active directives quickly.",
        "Run man vsftpd.conf to inspect all available directives and defaults not shown in the sample config."
      ],
      terminal: {
        id: "insp-term-conf",
        title: "Inspect active config and man page",
        environment: "LINUX",
        copyCommand: 'cat /etc/vsftpd.conf | grep -v "#"',
        lines: [
          {
            kind: "command",
            prompt: "$",
            text: 'cat /etc/vsftpd.conf | grep -v "#"',
            copyable: true
          },
          { kind: "command", prompt: "$", text: "man vsftpd.conf", copyable: true }
        ]
      },
      relatedIds: ["vsftpd", "listen", "anonymous_enable_no"]
    },
    listen: {
      id: "listen",
      label: "listen=NO",
      category: "Directive",
      shortDefinition:
        "Controls whether vsFTPd runs standalone for IPv4 or relies on a superserver like inetd for on-demand startup.",
      details: [
        "Standalone mode (listen=YES) keeps vsFTPd listening directly on IPv4.",
        "If both listen and listen_ipv6 are NO, inetd listens and starts vsFTPd when requested to save system resources.",
        "If listen=NO and listen_ipv6=YES, vsFTPd still runs independently on an IPv6 socket."
      ],
      securityNote:
        "Running vsFTPd on demand does not hide the service from port scanning. Port 21 still shows as open because the superserver listens for connections; this option manages resources, not stealth.",
      relatedIds: ["listen_ipv6", "daemon-concept"]
    },
    listen_ipv6: {
      id: "listen_ipv6",
      label: "listen_ipv6=YES",
      category: "Directive",
      shortDefinition:
        "Enables standalone IPv6 socket listening for vsFTPd (often handling dual-stack IPv4 connections as well).",
      details: [
        "Allows vsFTPd to operate independently even when listen=NO.",
        "Normally mutually exclusive with listen=YES in standalone configurations."
      ],
      relatedIds: ["listen", "connect_from_port_20"]
    },
    connect_from_port_20: {
      id: "connect_from_port_20",
      label: "connect_from_port_20=YES",
      category: "Directive",
      shortDefinition:
        "Binds Active FTP outgoing data connections on the server to source port 20.",
      details: [
        "Matches traditional Active FTP firewall expectations where control uses TCP 21 and data originates from TCP 20."
      ],
      diagramId: "ftp-active-mode",
      relatedIds: ["active-ftp", "listen"]
    },
    anonymous_enable_no: {
      id: "anonymous_enable_no",
      label: "anonymous_enable=NO",
      category: "Directive",
      shortDefinition:
        "Disables anonymous FTP access so every client must authenticate with an authorized user account.",
      details: [
        "Recommended default unless public anonymous file distribution is intentionally needed."
      ],
      relatedIds: ["local_enable", "anonymous_enable_yes"]
    },
    local_enable: {
      id: "local_enable",
      label: "local_enable=YES",
      category: "Directive",
      shortDefinition:
        "Allows existing Linux system user accounts to log in to the FTP service.",
      details: [
        "Enforced alongside PAM rules (/etc/pam.d/vsftpd) and /etc/ftpusers denylists."
      ],
      securityNote:
        "Combining local_enable=YES with unencrypted FTP allows network sniffers to capture real system credentials; pair with TLS and strict chroot confinement.",
      relatedIds: ["pam_service_name", "etc-ftpusers", "chroot_local_user"]
    },
    pam_service_name: {
      id: "pam_service_name",
      label: "pam_service_name=vsftpd",
      category: "Directive",
      shortDefinition:
        "Sets the PAM (Pluggable Authentication Modules) service profile at /etc/pam.d/vsftpd.",
      details: [
        "PAM is Linux's central authentication mechanism used by FTP, SSH, and sudo.",
        "Rules inside /etc/pam.d/vsftpd validate credentials and check denylist files such as /etc/ftpusers."
      ],
      relatedIds: ["local_enable", "etc-ftpusers"]
    },
    secure_chroot_dir: {
      id: "secure_chroot_dir",
      label: "secure_chroot_dir=/var/run/vsftpd/empty",
      category: "Directive",
      shortDefinition:
        "Defines an empty, restricted sandbox directory used as apparent root for unprivileged pre-login vsFTPd processes.",
      details: [
        "Pre-login command handlers do not require direct access to system files.",
        "Placing them in an empty root directory prevents access to /etc, /home, and /var if a pre-auth bug is exploited.",
        "This directory is not used for sharing, uploading, or downloading files."
      ],
      securityNote:
        "Applies the Principle of Least Privilege to minimize blast radius during pre-authentication command parsing.",
      diagramId: "ftp-chroot-sandbox",
      relatedIds: ["least-privilege", "pam_service_name"]
    },
    "least-privilege": {
      id: "least-privilege",
      label: "Principle of Least Privilege",
      category: "Concept",
      shortDefinition:
        "Security principle requiring each process or account to have only the minimum permissions necessary for its job.",
      details: [
        "In vsFTPd, pre-login worker processes are confined inside an empty directory (/var/run/vsftpd/empty) with no system file visibility."
      ],
      diagramId: "ftp-chroot-sandbox",
      relatedIds: ["secure_chroot_dir", "etc-ftpusers"]
    },
    chown_uploads: {
      id: "chown_uploads",
      label: "chown_uploads=YES",
      category: "Directive",
      shortDefinition:
        "Reassigns file ownership of anonymously uploaded files to a nominated Linux user.",
      details: [
        "Works alongside chown_username to keep uploaded artifacts owned by a safe dedicated local account instead of a generic FTP identity."
      ],
      relatedIds: ["chown_username", "anon_upload_enable"]
    },
    chown_username: {
      id: "chown_username",
      label: "chown_username=username",
      category: "Directive",
      shortDefinition:
        "Names the Linux account that becomes the owner of files uploaded by anonymous users when chown_uploads=YES.",
      details: [
        "Avoid naming privileged accounts here; combine with non-executable permissions on upload directories."
      ],
      relatedIds: ["chown_uploads"]
    },
    chroot_local_user: {
      id: "chroot_local_user",
      label: "chroot_local_user=YES",
      category: "Directive",
      shortDefinition:
        "Confines authenticated local Linux users to their FTP root (normally their home directory).",
      details: [
        "Prevents authenticated users from browsing unrelated host paths such as /etc or other home directories unless listed as exceptions when chroot_list_enable=YES."
      ],
      securityNote:
        "Note vsFTPd's strict writeable-chroot checks (allow_writeable_chroot) and verify how chroot_list_enable changes exception behavior.",
      relatedIds: ["chroot_list_enable", "local_enable"]
    },
    chroot_list_enable: {
      id: "chroot_list_enable",
      label: "chroot_list_enable & chroot_local_user",
      category: "Directive",
      shortDefinition:
        "Activates /etc/vsftpd.chroot_list, whose meaning reverses depending on whether chroot_local_user is YES or NO.",
      details: [
        "When chroot_local_user=YES: everyone is jailed by default, and accounts in /etc/vsftpd.chroot_list are exceptions allowed outside.",
        "When chroot_local_user=NO: accounts are unrestricted by default, and ONLY accounts listed in /etc/vsftpd.chroot_list are jailed."
      ],
      securityNote:
        "Reversing YES/NO accidentally during configuration can leave local FTP accounts able to read system files outside their home directory.",
      relatedIds: ["chroot_local_user", "etc-ftpusers"]
    },
    hide_ids: {
      id: "hide_ids",
      label: "hide_ids=YES",
      category: "Directive",
      defaultTab: "security",
      shortDefinition:
        "Masks user and group owner fields in FTP listings as ftp without changing on-disk permissions.",
      details: [
        "Default output: -rw-rw-r-- 1 1002 1002 Calendar.pptx",
        "With hide_ids=YES: -rw-rw-r-- 1 ftp ftp Calendar.pptx",
        "Hides ownership metadata only in protocol responses; Linux file permissions and UIDs on disk stay untouched."
      ],
      securityNote:
        "Real usernames exposed in directory listings help attackers build valid username lists for SSH or other services. Pair account hiding with Fail2ban to block repeated login attempts automatically from logs.",
      relatedIds: ["ls_recurse_enable", "local_enable"]
    },
    ls_recurse_enable: {
      id: "ls_recurse_enable",
      label: "ls_recurse_enable=YES",
      category: "Directive",
      shortDefinition:
        "Permits clients to run recursive directory listings using LIST -R (ftp> ls -R).",
      details: [
        "Often disabled by default on large public FTP sites to prevent excessive server I/O or full tree mapping in one command."
      ],
      securityNote:
        "When enabled on internal or poorly restricted servers, attackers can map every accessible nested folder immediately.",
      relatedIds: ["ftp-recursive-tree", "hide_ids"]
    },
    dirmessage_enable: {
      id: "dirmessage_enable",
      label: "dirmessage_enable=YES",
      category: "Directive",
      shortDefinition:
        "Displays a directory welcome message when a user navigates into a folder containing message_file.",
      details: ["Typically reads .message inside each directory."],
      relatedIds: ["message_file", "ftpd_banner"]
    },
    message_file: {
      id: "message_file",
      label: "message_file=.message",
      category: "Directive",
      shortDefinition:
        "Specifies the hidden notice filename displayed when dirmessage_enable=YES.",
      details: ["Default filename is .message."],
      relatedIds: ["dirmessage_enable"]
    },
    ftpd_banner: {
      id: "ftpd_banner",
      label: "ftpd_banner",
      category: "Directive",
      shortDefinition:
        "Sets an inline greeting string sent with response 220 when clients connect.",
      details: [
        "Replaced automatically by banner_file when both are defined in /etc/vsftpd.conf."
      ],
      securityNote:
        "Replacing default software banners reduces trivial version fingerprinting, though custom banners may still leak company names.",
      terminal: {
        id: "insp-term-banner",
        title: "220 Banner Example",
        environment: "BANNER",
        lines: [{ kind: "response", text: "220 Welcome to FTP Server", statusTone: "ok" }]
      },
      relatedIds: ["banner_file", "code-220"]
    },
    banner_file: {
      id: "banner_file",
      label: "banner_file=/etc/ftp_banner.txt",
      category: "Directive",
      shortDefinition:
        "Loads the welcome greeting from an external file and takes precedence over ftpd_banner.",
      details: ["Useful for multi-line legal warnings or organization notices."],
      relatedIds: ["ftpd_banner", "code-220"]
    },
    use_localtime: {
      id: "use_localtime",
      label: "use_localtime=YES",
      category: "Directive",
      shortDefinition:
        "Reports directory timestamps using the server's local timezone rather than GMT.",
      details: ["Makes it easier to align transfer timestamps with system logs."],
      relatedIds: ["xferlog_enable"]
    },
    xferlog_enable: {
      id: "xferlog_enable",
      label: "xferlog_enable=YES",
      category: "Directive",
      shortDefinition:
        "Enables audit logging of file uploads and downloads.",
      details: ["Helps defenders track accessed files, upload activity, and client IPs."],
      relatedIds: ["use_localtime"]
    },
    ssl_enable: {
      id: "ssl_enable",
      label: "ssl_enable & Optional TLS",
      category: "Directive",
      defaultTab: "security",
      shortDefinition:
        "Controls whether FTPS TLS encryption is supported on vsFTPd (disabled when NO).",
      details: [
        "Uses rsa_cert_file and rsa_private_key_file to present the server's TLS identity.",
        "Standard FTP transmits usernames, passwords, and file contents in cleartext."
      ],
      securityNote:
        "Setting ssl_enable=YES adds TLS support, but does NOT automatically force all clients to encrypt. Additional directives (such as force_local_logins_ssl and force_local_data_ssl) are needed to block plain-text fallback.",
      diagramId: "ftp-protocol-security",
      relatedIds: ["rsa_cert_file", "rsa_private_key_file", "ftp-tls-certificate"]
    },
    rsa_cert_file: {
      id: "rsa_cert_file",
      label: "rsa_cert_file",
      category: "Directive",
      shortDefinition:
        "Path to the X.509 certificate used by vsFTPd for TLS connections.",
      details: ["Defaults to /etc/ssl/certs/ssl-cert-snakeoil.pem on Debian/Ubuntu."],
      diagramId: "ftp-protocol-security",
      relatedIds: ["ssl_enable", "rsa_private_key_file"]
    },
    rsa_private_key_file: {
      id: "rsa_private_key_file",
      label: "rsa_private_key_file",
      category: "Directive",
      shortDefinition:
        "Path to the private key paired with rsa_cert_file for FTPS.",
      details: ["Keep permissions locked to root (e.g. 600) in /etc/ssl/private/."],
      diagramId: "ftp-protocol-security",
      relatedIds: ["ssl_enable", "rsa_cert_file"]
    },
    "ftp-ftps-sftp": {
      id: "ftp-ftps-sftp",
      label: "FTP vs FTPS vs SFTP",
      category: "Protocol",
      shortDefinition:
        "FTP runs in plain text, FTPS adds SSL/TLS over FTP, and SFTP tunnels file transfers inside SSH.",
      details: [
        "FTP: Clear text control and data channels.",
        "FTPS: FTP upgraded with SSL/TLS.",
        "SFTP: Distinct SSH File Transfer Protocol running over SSH."
      ],
      diagramId: "ftp-protocol-security",
      relatedIds: ["ssl_enable", "ftp-protocol"]
    },
    "etc-ftpusers": {
      id: "etc-ftpusers",
      label: "/etc/ftpusers Denylist",
      category: "Concept",
      shortDefinition:
        "Denylist of usernames explicitly blocked from FTP login even when they hold valid Linux accounts and passwords.",
      details: [
        "Checked by PAM rules configured in /etc/pam.d/vsftpd.",
        "Commonly blocks root, guest, and named accounts that should not expose passwords over FTP."
      ],
      terminal: {
        id: "insp-term-ftpusers",
        title: "Read /etc/ftpusers",
        environment: "LINUX",
        copyCommand: "cat /etc/ftpusers",
        lines: [
          { kind: "command", prompt: "$", text: "cat /etc/ftpusers", copyable: true },
          { kind: "output", text: "guest\njohn\nkevin" }
        ]
      },
      relatedIds: ["pam_service_name", "local_enable"]
    },
    anonymous_enable_yes: {
      id: "anonymous_enable_yes",
      label: "anonymous_enable=YES",
      category: "Risk",
      shortDefinition: "Allows clients to authenticate as the anonymous user.",
      details: ["Always check whether anonymous access exposes sensitive directories during footprinting."],
      relatedIds: ["no_anon_password", "anon_root", "code-230"]
    },
    no_anon_password: {
      id: "no_anon_password",
      label: "no_anon_password=YES",
      category: "Risk",
      shortDefinition: "Skips password prompts for anonymous FTP logins.",
      details: ["Users enter Name: anonymous and connect directly with 230 Login successful."],
      relatedIds: ["anonymous_enable_yes", "code-230"]
    },
    anon_root: {
      id: "anon_root",
      label: "anon_root=/home/username/ftp",
      category: "Directive",
      shortDefinition: "Sets the Linux filesystem directory served to anonymous logins.",
      details: ["All anonymous listings and file paths resolve under this directory."],
      relatedIds: ["anonymous_enable_yes", "anon_upload_enable"]
    },
    write_enable: {
      id: "write_enable",
      label: "write_enable=YES",
      category: "Risk",
      shortDefinition:
        "Enables filesystem-modifying FTP commands such as STOR, DELE, MKD, and RMD.",
      details: ["Required alongside anon_upload_enable and Linux OS write permissions."],
      relatedIds: ["anon_upload_enable", "anon_mkdir_write_enable"]
    },
    anon_upload_enable: {
      id: "anon_upload_enable",
      label: "anon_upload_enable=YES",
      category: "Risk",
      shortDefinition: "Allows anonymous users to upload files if OS permissions permit.",
      details: ["Requires write_enable=YES and filesystem write permissions on the destination folder."],
      relatedIds: ["write_enable", "ftp-upload-risks"]
    },
    anon_mkdir_write_enable: {
      id: "anon_mkdir_write_enable",
      label: "anon_mkdir_write_enable=YES",
      category: "Risk",
      shortDefinition: "Allows anonymous users to create directories when write permissions exist.",
      details: ["Requires write_enable=YES and Linux filesystem write permissions."],
      relatedIds: ["write_enable", "anon_upload_enable"]
    },
    "code-220": {
      id: "code-220",
      label: "220 Service Ready",
      category: "Response Code",
      shortDefinition: "220: Service ready for a new user.",
      details: [
        "Sent immediately after opening TCP port 21 and carries the welcome banner.",
        "Often discloses FTP server software, version strings, or custom organization labels."
      ],
      diagramId: "ftp-anon-enum",
      relatedIds: ["ftpd_banner", "banner_file", "code-230"]
    },
    "code-230": {
      id: "code-230",
      label: "230 Login Successful",
      category: "Response Code",
      shortDefinition: "230: User logged in; session authenticated.",
      details: ["Issued after valid credentials or permitted anonymous login."],
      diagramId: "ftp-anon-enum",
      relatedIds: ["code-220", "code-530"]
    },
    "code-200": {
      id: "code-200",
      label: "200 Command Successful",
      category: "Response Code",
      shortDefinition: "200: Requested control command accepted.",
      details: ["Commonly returned after PORT negotiation before opening a Data Channel."],
      diagramId: "ftp-anon-enum",
      relatedIds: ["active-ftp", "passive-ftp"]
    },
    "code-150": {
      id: "code-150",
      label: "150 Opening Data Connection",
      category: "Response Code",
      shortDefinition: "150: File status okay; about to open the Data Connection.",
      details: ["Precedes directory listings (LIST) and file transfers (RETR / STOR)."],
      diagramId: "ftp-anon-enum",
      relatedIds: ["code-226", "ftp-protocol"]
    },
    "code-226": {
      id: "code-226",
      label: "226 Transfer Completed",
      category: "Response Code",
      shortDefinition: "226: Closing Data Connection; transfer finished cleanly.",
      details: ["Confirms directory output or file bytes finished sending over the data socket."],
      diagramId: "ftp-anon-enum",
      relatedIds: ["code-150"]
    },
    "code-530": {
      id: "code-530",
      label: "530 Not Logged In",
      category: "Response Code",
      shortDefinition: "530: User not logged in or authentication rejected.",
      details: [
        "Returned when passwords fail, anonymous login is disabled, or the account is blocked in /etc/ftpusers."
      ],
      relatedIds: ["code-230", "etc-ftpusers", "anonymous_enable_no"]
    },
    "cmd-status": {
      id: "cmd-status",
      label: "ftp> status",
      category: "Command",
      shortDefinition: "Displays local FTP client settings and connection parameters.",
      details: [
        "Reports local client flags such as stream mode, binary transfer type, verbosity, debug state, and PORT command usage.",
        "Does not transmit a protocol request to the remote FTP server."
      ],
      terminal: {
        id: "insp-term-status",
        title: "Local ftp> status output",
        environment: "FTP CLIENT",
        copyCommand: "status",
        lines: [
          { kind: "command", prompt: "ftp>", text: "status", copyable: true },
          {
            kind: "output",
            text: "Connected to 10.129.14.136.\nNo proxy connection.\nConnecting using address family: any.\nMode: stream; Type: binary;\nForm: non-print; Structure: file\nVerbose: on\nDebugging: off\nUse of PORT cmds: on"
          }
        ]
      },
      diagramId: "ftp-diagnostics",
      relatedIds: ["cmd-stat", "cmd-debug", "cmd-trace"]
    },
    "cmd-stat": {
      id: "cmd-stat",
      label: "quote STAT",
      category: "Command",
      shortDefinition: "Sends the FTP protocol STAT command directly to request server status information.",
      details: [
        "Depending on server implementation, replies may list server software, active session settings, connected user, encryption state, and timeouts."
      ],
      terminal: {
        id: "insp-term-stat",
        title: "Send raw STAT command",
        environment: "FTP CLIENT",
        copyCommand: "quote STAT",
        lines: [
          { kind: "command", prompt: "ftp>", text: "quote STAT", copyable: true },
          { kind: "output", text: "---> STAT" },
          { kind: "response", text: "211 FTP server status:", statusTone: "info" },
          {
            kind: "output",
            text: "     Connected to 10.10.14.4\n     Logged in as ftp\n     TYPE: ASCII\n     No session bandwidth limit\n     Session timeout in seconds is 300\n     Control connection is plain text\n     Data connections will be plain text\n     At session startup, client count was 1\n     vsFTPd 3.0.3 - secure, fast, stable"
          },
          { kind: "response", text: "211 End of status", statusTone: "ok" }
        ]
      },
      diagramId: "ftp-diagnostics",
      relatedIds: ["cmd-status", "ftp-debug-detailed-output"]
    },
    "cmd-debug": {
      id: "cmd-debug",
      label: "ftp> debug",
      category: "Command",
      shortDefinition: "Toggles debugging output to display raw FTP protocol commands sent by the client.",
      details: [
        "Shows outgoing commands prefixed by ---> such as PORT and LIST.",
        "Improves client-side visibility; does not make the server reveal extra data."
      ],
      diagramId: "ftp-diagnostics",
      relatedIds: ["cmd-trace", "ftp-debug-detailed-output"]
    },
    "cmd-trace": {
      id: "cmd-trace",
      label: "ftp> trace",
      category: "Command",
      shortDefinition: "Toggles packet tracing in FTP clients that support the command.",
      details: [
        "Useful alongside debug for observing connection flow and Active/Passive mode behavior."
      ],
      diagramId: "ftp-diagnostics",
      relatedIds: ["cmd-debug", "ftp-debug-detailed-output"]
    },
    "ftp-debug-detailed-output": {
      id: "ftp-debug-detailed-output",
      label: "Complete Debug, Trace, Status & STAT Output",
      category: "Command",
      defaultTab: "terminal",
      shortDefinition:
        "Complete client session showing local status, server STAT response, debug command tracing, and Active PORT negotiation.",
      details: [
        "debug prints outgoing client protocol commands (---> PORT, ---> LIST).",
        "quote STAT retrieves server software and session state over the control socket."
      ],
      terminal: {
        id: "insp-term-debug-full",
        title: "Full debug, trace, status, and STAT session",
        environment: "FTP CLIENT",
        copyCommand: "debug\ntrace\nls",
        lines: [
          { kind: "command", prompt: "ftp>", text: "status", copyable: true },
          {
            kind: "output",
            text: "Connected to 10.129.14.136.\nMode: stream; Type: binary; Verbose: on; Debugging: off; Use of PORT cmds: on"
          },
          { kind: "command", prompt: "ftp>", text: "debug", copyable: true },
          { kind: "output", text: "Debugging on (debug=1)." },
          { kind: "command", prompt: "ftp>", text: "trace", copyable: true },
          { kind: "output", text: "Packet tracing on." },
          { kind: "command", prompt: "ftp>", text: "ls", copyable: true },
          { kind: "output", text: "---> PORT 10,10,14,4,188,195" },
          {
            kind: "response",
            text: "200 PORT command successful. Consider using PASV.",
            statusTone: "ok"
          },
          { kind: "output", text: "---> LIST" },
          { kind: "response", text: "150 Here comes the directory listing.", statusTone: "info" },
          {
            kind: "output",
            text: "Calendar.pptx\nClients\nDocuments\nEmployees\nImportant Notes.txt"
          },
          { kind: "response", text: "226 Directory send OK.", statusTone: "ok" }
        ]
      },
      diagramId: "ftp-diagnostics",
      relatedIds: ["cmd-status", "cmd-stat", "cmd-debug"]
    },
    "ftp-recursive-tree": {
      id: "ftp-recursive-tree",
      label: "Recursive Directory Structure (ls -R)",
      category: "Command",
      defaultTab: "terminal",
      shortDefinition:
        "Full FTP Root hierarchy revealed by ftp> ls -R when ls_recurse_enable=YES is enabled on the server.",
      details: [
        "Exposes nested client workspaces, contracts, appointment sheets, templates, and internal notes without entering each subfolder manually."
      ],
      terminal: {
        id: "insp-term-tree-full",
        title: "Full directory structure and ls -R output",
        environment: "FTP CLIENT",
        copyCommand: "ls -R",
        lines: [
          { kind: "command", prompt: "ftp>", text: "ls -R", copyable: true },
          { kind: "response", text: "200 PORT command successful. Consider using PASV.", statusTone: "ok" },
          { kind: "response", text: "150 Here comes the directory listing.", statusTone: "info" },
          {
            kind: "output",
            text: "FTP Root\n├── Calendar.pptx\n├── Clients\n│   ├── HackTheBox\n│   │   ├── appointments.xlsx\n│   │   ├── contract.docx\n│   │   ├── contract.pdf\n│   │   └── meetings.txt\n│   └── Inlanefreight\n│       ├── appointments.xlsx\n│       ├── contract.docx\n│       ├── meetings.txt\n│       └── proposal.pptx\n├── Documents\n│   ├── appointments-template.xlsx\n│   ├── contract-template.docx\n│   └── contract-template.pdf\n├── Employees\n└── Important Notes.txt"
          },
          { kind: "response", text: "226 Directory send OK.", statusTone: "ok" }
        ]
      },
      relatedIds: ["ls_recurse_enable", "ftp-wget-mirror"]
    },
    "ftp-wget-mirror": {
      id: "ftp-wget-mirror",
      label: "Mirroring Accessible Files with Wget",
      category: "Command",
      defaultTab: "terminal",
      shortDefinition:
        "Example wget mirror output and local tree inspection showing how accessible files are downloaded cleanly in Active mode.",
      details: [
        "-m turns on mirroring (recursion + timestamp checks).",
        "--no-passive forces Active FTP instead of PASV.",
        "Files are saved inside a folder named after the target host (10.129.14.136/)."
      ],
      securityNote:
        "Bulk downloads can generate substantial traffic and server log entries. Always keep mirroring strictly inside authorized scopes.",
      terminal: {
        id: "insp-term-wget-full",
        title: "wget mirror and tree output",
        environment: "LINUX",
        copyCommand: "wget -m --no-passive ftp://anonymous:anonymous@10.129.14.136",
        lines: [
          {
            kind: "command",
            prompt: "$",
            text: "wget -m --no-passive ftp://anonymous:anonymous@10.129.14.136",
            copyable: true
          },
          {
            kind: "output",
            text: "--2026-11-27 08:00:00--  ftp://anonymous:*password*@10.129.14.136/\n           => '10.129.14.136/.listing'\nConnecting to 10.129.14.136:21... connected.\nLogging in as anonymous ... Logged in!\n==> SYST ... done.    ==> PWD ... done.\n==> TYPE I ... done.  ==> CWD not needed.\n==> PORT ... done.    ==> LIST ... done.\n10.129.14.136/.listing              [ <=> ]     1.02K  --.-KB/s    in 0.01s\n...\nFINISHED --2026-11-27 08:00:02--\nTotal wall clock time: 2.1s\nDownloaded: 15 files, 480K in 0.4s"
          },
          { kind: "command", prompt: "$", text: "tree 10.129.14.136", copyable: true },
          {
            kind: "output",
            text: "10.129.14.136\n├── Calendar.pptx\n├── Clients\n│   ├── HackTheBox\n│   └── Inlanefreight\n├── Documents\n└── Important Notes.txt"
          }
        ]
      },
      relatedIds: ["ftp-recursive-tree", "ftp-upload-risks"]
    },
    "ftp-upload-risks": {
      id: "ftp-upload-risks",
      label: "Security Implications of Writable FTP",
      category: "Risk",
      defaultTab: "security",
      shortDefinition:
        "Why writable FTP folders paired with web roots or downstream services introduce severe risks, and what preconditions apply.",
      details: [
        "FTP put issues the STOR protocol command.",
        "Writable folders matter most when shared with a web application, scheduled import job, or included template path."
      ],
      securityNote:
        "Key condition: upload permission alone does not let uploaded payloads execute. Reaching Local File Inclusion (LFI), FTP log poisoning, Remote Code Execution (RCE), or privilege escalation requires an insecure integration, vulnerable parser, or overly broad filesystem permissions.",
      relatedIds: ["write_enable", "anon_upload_enable"]
    },
    "nmap-ftp-full-scan": {
      id: "nmap-ftp-full-scan",
      label: "Full Nmap FTP Scan Output",
      category: "Command",
      defaultTab: "terminal",
      shortDefinition:
        "Complete Nmap scan result against port 21 combining service version fingerprinting, ftp-anon listing, and ftp-syst server status.",
      details: [
        "Confirms open port, daemon version (vsFTPd 3.0.3), anonymous login status (230), directory listing, and encryption state."
      ],
      terminal: {
        id: "insp-term-nmap-full",
        title: "sudo nmap -sV -p21 -sC -A 10.129.14.136",
        environment: "LINUX",
        copyCommand: "sudo nmap -sV -p21 -sC -A 10.129.14.136",
        lines: [
          {
            kind: "command",
            prompt: "$",
            text: "sudo nmap -sV -p21 -sC -A 10.129.14.136",
            copyable: true
          },
          {
            kind: "output",
            text: "Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for 10.129.14.136\nHost is up (0.045s latency).\n\nPORT   STATE SERVICE VERSION\n21/tcp open  ftp     vsftpd 2.0.8 or later\n| ftp-anon: Anonymous FTP login allowed (FTP code 230)\n|_-rw-r--r--   1 ftp      ftp          41 Jul 20  2022 Important Notes.txt\n| ftp-syst:\n|   STAT:\n| FTP server status:\n|      Connected to 10.10.14.4\n|      Logged in as ftp\n|      TYPE: ASCII\n|      No session bandwidth limit\n|      Session timeout in seconds is 300\n|      Control connection is plain text\n|      Data connections will be plain text\n|      At session startup, client count was 3\n|      vsFTPd 3.0.3 - secure, fast, stable\n|_End of status\nService Info: OS: Unix"
          }
        ]
      },
      relatedIds: ["nmap-script-trace-full", "code-230"]
    },
    "nmap-script-trace-full": {
      id: "nmap-script-trace-full",
      label: "Full Nmap --script-trace NSOCK Log",
      category: "Command",
      defaultTab: "terminal",
      shortDefinition:
        "Low-level NSOCK / NSE packet trace showing exact TCP handshakes, source ports, commands sent, and banner responses.",
      details: [
        "Shows NSE opening distinct local ephemeral source ports (such as 54228 and 54230) against target port 21.",
        "Useful when debugging script failures, unexpected rate limits, or firewall resets."
      ],
      terminal: {
        id: "insp-term-nmap-trace-full",
        title: "NSOCK / NSE trace excerpt",
        environment: "LINUX",
        copyCommand: "sudo nmap -sV -p21 -sC -A 10.129.14.136 --script-trace",
        lines: [
          {
            kind: "command",
            prompt: "$",
            text: "sudo nmap -sV -p21 -sC -A 10.129.14.136 --script-trace",
            copyable: true
          },
          {
            kind: "output",
            text: "NSE: TCP 10.10.14.4:54228 > 10.129.14.136:21 | CONNECT\nNSE: TCP 10.10.14.4:54228 < 10.129.14.136:21 | 220 Welcome to HTB-Academy FTP service.\nNSE: TCP 10.10.14.4:54228 > 10.129.14.136:21 | USER anonymous\nNSE: TCP 10.10.14.4:54228 < 10.129.14.136:21 | 230 Login successful.\nNSE: TCP 10.10.14.4:54228 > 10.129.14.136:21 | PASV\nNSE: TCP 10.10.14.4:54228 > 10.129.14.136:21 | LIST\nNSE: TCP 10.10.14.4:54228 > 10.129.14.136:21 | CLOSE\nNSE: TCP 10.10.14.4:54230 > 10.129.14.136:21 | CONNECT\nNSE: TCP 10.10.14.4:54230 < 10.129.14.136:21 | 220 Welcome to HTB-Academy FTP service.\nNSE: TCP 10.10.14.4:54230 > 10.129.14.136:21 | USER anonymous\nNSE: TCP 10.10.14.4:54230 > 10.129.14.136:21 | SYST\nNSE: TCP 10.10.14.4:54230 < 10.129.14.136:21 | 215 UNIX Type: L8\nNSE: TCP 10.10.14.4:54230 > 10.129.14.136:21 | STAT"
          }
        ]
      },
      diagramId: "ftp-nmap-trace",
      relatedIds: ["nmap-ftp-full-scan"]
    },
    "ftp-manual-nc-telnet": {
      id: "ftp-manual-nc-telnet",
      label: "Manual Netcat & Telnet Control Session",
      category: "Command",
      defaultTab: "terminal",
      shortDefinition:
        "Example raw TCP interaction over port 21 to inspect the welcome banner and issue manual FTP control commands.",
      details: [
        "Useful for quick banner grabbing and verifying USER/PASS/STAT behavior when a full FTP client is unavailable.",
        "Cannot handle multi-socket file transfers cleanly without opening secondary data connections manually."
      ],
      terminal: {
        id: "insp-term-manual-nc",
        title: "Manual nc session on port 21",
        environment: "LINUX",
        copyCommand: "nc -nv 10.129.14.136 21",
        lines: [
          { kind: "command", prompt: "$", text: "nc -nv 10.129.14.136 21", copyable: true },
          { kind: "output", text: "Connection to 10.129.14.136 21 port [tcp/ftp] succeeded!" },
          { kind: "response", text: "220 Welcome to HTB-Academy FTP service.", statusTone: "ok" },
          { kind: "input", prompt: ">", text: "USER anonymous" },
          { kind: "response", text: "331 Please specify the password.", statusTone: "info" },
          { kind: "input", prompt: ">", text: "PASS anonymous" },
          { kind: "response", text: "230 Login successful.", statusTone: "ok" },
          { kind: "input", prompt: ">", text: "QUIT" },
          { kind: "response", text: "221 Goodbye.", statusTone: "ok" }
        ]
      },
      relatedIds: ["code-220", "code-230"]
    },
    "ftp-tls-certificate": {
      id: "ftp-tls-certificate",
      label: "OpenSSL STARTTLS Certificate Chain",
      category: "Protocol",
      defaultTab: "terminal",
      shortDefinition:
        "Full openssl s_client -starttls ftp session inspecting the TLS handshake and self-signed server certificate metadata.",
      details: [
        "Starts over plain FTP on port 21 and sends AUTH TLS via -starttls ftp.",
        "Extracts Subject and Issuer organization names, internal DNS hostnames, email addresses, and trust status."
      ],
      securityNote:
        "Anyone can populate Subject fields when generating a self-signed certificate. Verify extracted hostnames (such as master.inlanefreight.htb) against DNS or scope records before trusting them.",
      terminal: {
        id: "insp-term-openssl-full",
        title: "openssl s_client -connect 10.129.14.136:21 -starttls ftp",
        environment: "LINUX",
        copyCommand: "openssl s_client -connect 10.129.14.136:21 -starttls ftp",
        lines: [
          {
            kind: "command",
            prompt: "$",
            text: "openssl s_client -connect 10.129.14.136:21 -starttls ftp",
            copyable: true
          },
          {
            kind: "output",
            text: "CONNECTED(00000003)\ndepth=0 C = US, ST = California, L = Sacramento, O = Inlanefreight, OU = Dev, CN = master.inlanefreight.htb, emailAddress = admin@inlanefreight.htb\nverify error:num=18:self-signed certificate\nverify return:1\n---\nCertificate chain\n 0 s:C = US, ST = California, L = Sacramento, O = Inlanefreight, OU = Dev, CN = master.inlanefreight.htb, emailAddress = admin@inlanefreight.htb\n   i:C = US, ST = California, L = Sacramento, O = Inlanefreight, OU = Dev, CN = master.inlanefreight.htb, emailAddress = admin@inlanefreight.htb\n---\nServer certificate\n-----BEGIN CERTIFICATE-----\n... (certificate PEM truncated for readability) ...\n-----END CERTIFICATE---\nsubject=C = US, ST = California, L = Sacramento, O = Inlanefreight, OU = Dev, CN = master.inlanefreight.htb, emailAddress = admin@inlanefreight.htb\n---\nSSL-Session:\n    Protocol  : TLSv1.3\n    Cipher    : TLS_AES_256_GCM_SHA384\n    Verify return code: 18 (self-signed certificate)\n---\n220 Welcome to HTB-Academy FTP service."
          }
        ]
      },
      diagramId: "ftp-protocol-security",
      relatedIds: ["ssl_enable", "rsa_cert_file", "rsa_private_key_file"]
    }
  }
};
