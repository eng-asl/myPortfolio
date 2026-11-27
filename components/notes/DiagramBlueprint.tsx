"use client";

import React from "react";
import type { DiagramPlaceholderKind } from "@/types/security-notes";
import styles from "./SecurityNotes.module.css";

interface DiagramBlueprintProps {
  kind: DiagramPlaceholderKind;
  alt: string;
}

export function DiagramBlueprint({ kind, alt }: DiagramBlueprintProps) {
  if (kind === "chroot-sandbox") {
    return (
      <svg
        viewBox="0 0 640 430"
        className={styles.blueprintSvg}
        role="img"
        aria-label={alt}
      >
        <defs>
          <pattern id="bp-grid-chroot" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1c2129" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="640" height="430" rx="6" fill="#0B0D11" />
        <rect x="0" y="0" width="640" height="430" rx="6" fill="url(#bp-grid-chroot)" />

        <g>
          <rect
            x="176"
            y="18"
            width="288"
            height="68"
            rx="8"
            fill="#12161C"
            stroke="#5A6474"
            strokeWidth="1.5"
          />
          <text
            x="320"
            y="45"
            textAnchor="middle"
            fill="#F4F5F7"
            fontSize="18"
            fontWeight="700"
            fontFamily="var(--asl-font), sans-serif"
          >
            FTP Client
          </text>
          <text
            x="320"
            y="69"
            textAnchor="middle"
            fill="#B4BBC5"
            fontSize="14"
            fontFamily="var(--asl-font), sans-serif"
          >
            Incoming commands
          </text>
        </g>

        <line x1="320" y1="88" x2="320" y2="122" stroke="#E6E8EB" strokeWidth="2.2" />
        <polyline
          points="311,112 320,124 329,112"
          fill="none"
          stroke="#E6E8EB"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <rect
          x="26"
          y="132"
          width="588"
          height="252"
          rx="12"
          fill="#12161C"
          stroke="#5A6474"
          strokeWidth="1.5"
        />
        <text
          x="50"
          y="165"
          fill="#F4F5F7"
          fontSize="17"
          fontWeight="700"
          fontFamily="var(--asl-font), sans-serif"
        >
          Linux Server
        </text>
        <text
          x="590"
          y="165"
          textAnchor="end"
          fill="#D9A441"
          fontSize="11"
          fontFamily="var(--asl-mono), monospace"
        >
          LEAST PRIVILEGE
        </text>

        <rect
          x="50"
          y="186"
          width="256"
          height="174"
          rx="10"
          fill="#0E1B16"
          stroke="#5FA37A"
          strokeWidth="1.8"
          strokeDasharray="6 5"
        />
        <text
          x="178"
          y="214"
          textAnchor="middle"
          fill="#5FA37A"
          fontSize="16"
          fontWeight="700"
          fontFamily="var(--asl-font), sans-serif"
        >
          Sandbox
        </text>
        <rect
          x="68"
          y="228"
          width="220"
          height="52"
          rx="6"
          fill="#12281D"
          stroke="#5FA37A"
          strokeWidth="1.4"
        />
        <text
          x="178"
          y="260"
          textAnchor="middle"
          fill="#E6E8EB"
          fontSize="15"
          fontWeight="600"
          fontFamily="var(--asl-font), sans-serif"
        >
          vsFTPd process
        </text>
        <text
          x="178"
          y="306"
          textAnchor="middle"
          fill="#E6E8EB"
          fontSize="14"
          fontFamily="var(--asl-font), sans-serif"
        >
          Empty directory
        </text>
        <text
          x="178"
          y="330"
          textAnchor="middle"
          fill="#929CAB"
          fontSize="12.5"
          fontFamily="var(--asl-mono), monospace"
        >
          /var/run/vsftpd/empty
        </text>

        <line
          x1="312"
          y1="274"
          x2="386"
          y2="274"
          stroke="#C4553D"
          strokeWidth="2.2"
          strokeDasharray="5 5"
        />
        <circle cx="349" cy="274" r="18" fill="#C4553D" stroke="#0B0D11" strokeWidth="2.5" />
        <line x1="341" y1="266" x2="357" y2="282" stroke="#F4F5F7" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="357" y1="266" x2="341" y2="282" stroke="#F4F5F7" strokeWidth="2.8" strokeLinecap="round" />

        <rect
          x="392"
          y="186"
          width="198"
          height="174"
          rx="10"
          fill="#171B22"
          stroke="#5A6474"
          strokeWidth="1.5"
        />
        <text
          x="491"
          y="216"
          textAnchor="middle"
          fill="#F4F5F7"
          fontSize="16"
          fontWeight="700"
          fontFamily="var(--asl-font), sans-serif"
        >
          System files
        </text>

        <rect x="412" y="232" width="158" height="32" rx="5" fill="#1C2129" stroke="#39424F" />
        <text x="491" y="253" textAnchor="middle" fill="#E6E8EB" fontSize="13.5" fontFamily="var(--asl-mono), monospace">
          /etc
        </text>

        <rect x="412" y="272" width="158" height="32" rx="5" fill="#1C2129" stroke="#39424F" />
        <text x="491" y="293" textAnchor="middle" fill="#E6E8EB" fontSize="13.5" fontFamily="var(--asl-mono), monospace">
          /home
        </text>

        <rect x="412" y="312" width="158" height="32" rx="5" fill="#1C2129" stroke="#39424F" />
        <text x="491" y="333" textAnchor="middle" fill="#E6E8EB" fontSize="13.5" fontFamily="var(--asl-mono), monospace">
          /var
        </text>

        <text
          x="28"
          y="412"
          fill="#B4BBC5"
          fontSize="12.5"
          fontFamily="var(--asl-font), sans-serif"
        >
          The isolated process has restricted filesystem access.
        </text>
      </svg>
    );
  }

  if (kind === "protocol-security") {
    return (
      <svg
        viewBox="0 0 640 310"
        className={styles.blueprintSvg}
        role="img"
        aria-label={alt}
      >
        <defs>
          <pattern id="bp-grid-proto" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1c2129" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="640" height="310" rx="6" fill="#0B0D11" />
        <rect x="0" y="0" width="640" height="310" rx="6" fill="url(#bp-grid-proto)" />

        <text x="24" y="34" fill="#D9A441" fontSize="11.5" fontFamily="var(--asl-mono), monospace">
          TRANSPORT SECURITY LAYERS
        </text>

        <g>
          <rect x="24" y="54" width="592" height="68" rx="6" fill="#12161C" stroke="#C4553D" strokeWidth="1.4" />
          <text x="44" y="83" fill="#F4F5F7" fontSize="16" fontWeight="700" fontFamily="var(--asl-font), sans-serif">
            FTP (TCP 21 / 20)
          </text>
          <text x="44" y="106" fill="#B4BBC5" fontSize="13" fontFamily="var(--asl-font), sans-serif">
            Plain text credentials and payloads (sniffable on wire)
          </text>
          <rect x="466" y="71" width="132" height="32" rx="4" fill="rgba(196, 85, 61, 0.16)" stroke="#C4553D" />
          <text x="532" y="92" textAnchor="middle" fill="#F4F5F7" fontSize="12" fontFamily="var(--asl-mono), monospace">
            CLEARTEXT
          </text>
        </g>

        <g>
          <rect x="24" y="136" width="592" height="68" rx="6" fill="#12161C" stroke="#D9A441" strokeWidth="1.4" />
          <text x="44" y="165" fill="#F4F5F7" fontSize="16" fontWeight="700" fontFamily="var(--asl-font), sans-serif">
            FTPS (vsFTPd ssl_enable=YES)
          </text>
          <text x="44" y="188" fill="#B4BBC5" fontSize="13" fontFamily="var(--asl-font), sans-serif">
            SSL/TLS wrapper using rsa_cert_file &amp; rsa_private_key_file
          </text>
          <rect x="466" y="153" width="132" height="32" rx="4" fill="rgba(217, 164, 65, 0.16)" stroke="#D9A441" />
          <text x="532" y="174" textAnchor="middle" fill="#F2D69B" fontSize="12" fontFamily="var(--asl-mono), monospace">
            SSL / TLS
          </text>
        </g>

        <g>
          <rect x="24" y="218" width="592" height="68" rx="6" fill="#12161C" stroke="#5FA37A" strokeWidth="1.4" />
          <text x="44" y="247" fill="#F4F5F7" fontSize="16" fontWeight="700" fontFamily="var(--asl-font), sans-serif">
            SFTP (SSH Subsystem)
          </text>
          <text x="44" y="270" fill="#B4BBC5" fontSize="13" fontFamily="var(--asl-font), sans-serif">
            Encrypted SSH tunnel (distinct protocol from FTP/vsFTPd)
          </text>
          <rect x="466" y="235" width="132" height="32" rx="4" fill="rgba(95, 163, 122, 0.16)" stroke="#5FA37A" />
          <text x="532" y="256" textAnchor="middle" fill="#E6E8EB" fontSize="12" fontFamily="var(--asl-mono), monospace">
            SSH TUNNEL
          </text>
        </g>
      </svg>
    );
  }

  if (kind === "anon-enum") {
    return (
      <svg
        viewBox="0 0 640 310"
        className={styles.blueprintSvg}
        role="img"
        aria-label={alt}
      >
        <defs>
          <pattern id="bp-grid-anon" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1c2129" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="640" height="310" rx="6" fill="#0B0D11" />
        <rect x="0" y="0" width="640" height="310" rx="6" fill="url(#bp-grid-anon)" />

        <text x="24" y="34" fill="#D9A441" fontSize="11.5" fontFamily="var(--asl-mono), monospace">
          ANONYMOUS FOOTPRINTING SEQUENCE
        </text>

        <rect x="24" y="54" width="176" height="86" rx="6" fill="#12161C" stroke="#5A6474" />
        <text x="38" y="80" fill="#D9A441" fontSize="11" fontFamily="var(--asl-mono), monospace">01 CONNECT</text>
        <text x="38" y="103" fill="#F4F5F7" fontSize="14" fontWeight="700" fontFamily="var(--asl-mono), monospace">ftp &lt;target&gt;</text>
        <text x="38" y="124" fill="#5FA37A" fontSize="12" fontFamily="var(--asl-mono), monospace">220 Banner</text>

        <line x1="202" y1="97" x2="230" y2="97" stroke="#8A93A1" strokeWidth="2" />
        <polyline points="223,91 231,97 223,103" fill="none" stroke="#8A93A1" strokeWidth="2" />

        <rect x="232" y="54" width="176" height="86" rx="6" fill="#12161C" stroke="#5FA37A" />
        <text x="246" y="80" fill="#D9A441" fontSize="11" fontFamily="var(--asl-mono), monospace">02 AUTH CHECK</text>
        <text x="246" y="103" fill="#F4F5F7" fontSize="14" fontWeight="700" fontFamily="var(--asl-mono), monospace">Name: anonymous</text>
        <text x="246" y="124" fill="#5FA37A" fontSize="12" fontFamily="var(--asl-mono), monospace">230 / 530</text>

        <line x1="410" y1="97" x2="438" y2="97" stroke="#8A93A1" strokeWidth="2" />
        <polyline points="431,91 439,97 431,103" fill="none" stroke="#8A93A1" strokeWidth="2" />

        <rect x="440" y="54" width="176" height="86" rx="6" fill="#12161C" stroke="#6E8BA8" />
        <text x="454" y="80" fill="#D9A441" fontSize="11" fontFamily="var(--asl-mono), monospace">03 LISTING</text>
        <text x="454" y="103" fill="#F4F5F7" fontSize="14" fontWeight="700" fontFamily="var(--asl-mono), monospace">ftp&gt; ls</text>
        <text x="454" y="124" fill="#6E8BA8" fontSize="12" fontFamily="var(--asl-mono), monospace">150 -&gt; 226 OK</text>

        <rect x="24" y="166" width="592" height="118" rx="6" fill="#12161C" stroke="#39424F" />
        <text x="42" y="194" fill="#F4F5F7" fontSize="14" fontWeight="700" fontFamily="var(--asl-font), sans-serif">
          Intelligence Gathered Without Downloading Files
        </text>
        <text x="42" y="220" fill="#B4BBC5" fontSize="13" fontFamily="var(--asl-font), sans-serif">
          - 220 banner identifies server software or custom target branding.
        </text>
        <text x="42" y="242" fill="#B4BBC5" fontSize="13" fontFamily="var(--asl-font), sans-serif">
          - Folder names (Clients/, Documents/, Employees/) map internal org layout.
        </text>
        <text x="42" y="264" fill="#B4BBC5" fontSize="13" fontFamily="var(--asl-font), sans-serif">
          - 200 PORT / PASV cues reveal active vs passive data socket negotiation.
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 640 280"
      className={styles.blueprintSvg}
      role="img"
      aria-label={alt}
    >
      <defs>
        <pattern id="bp-grid-diag" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1c2129" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="640" height="280" rx="6" fill="#0B0D11" />
      <rect x="0" y="0" width="640" height="280" rx="6" fill="url(#bp-grid-diag)" />

      <text x="24" y="34" fill="#D9A441" fontSize="11.5" fontFamily="var(--asl-mono), monospace">
        CLIENT VISIBILITY VS SERVER QUERY
      </text>

      <rect x="24" y="54" width="280" height="198" rx="6" fill="#12161C" stroke="#6E8BA8" />
      <text x="44" y="82" fill="#F4F5F7" fontSize="16" fontWeight="700" fontFamily="var(--asl-font), sans-serif">
        Local FTP Client
      </text>
      <text x="44" y="114" fill="#E8BC66" fontSize="13.5" fontFamily="var(--asl-mono), monospace">ftp&gt; status</text>
      <text x="44" y="135" fill="#B4BBC5" fontSize="12.5" fontFamily="var(--asl-font), sans-serif">Local mode, binary type, PORT state</text>
      <text x="44" y="168" fill="#E8BC66" fontSize="13.5" fontFamily="var(--asl-mono), monospace">ftp&gt; debug</text>
      <text x="44" y="189" fill="#B4BBC5" fontSize="12.5" fontFamily="var(--asl-font), sans-serif">Print raw client commands sent</text>
      <text x="44" y="222" fill="#E8BC66" fontSize="13.5" fontFamily="var(--asl-mono), monospace">ftp&gt; trace</text>
      <text x="44" y="242" fill="#B4BBC5" fontSize="12.5" fontFamily="var(--asl-font), sans-serif">Packet tracing (client visibility only)</text>

      <rect x="336" y="54" width="280" height="198" rx="6" fill="#12161C" stroke="#D9A441" />
      <text x="356" y="82" fill="#F4F5F7" fontSize="16" fontWeight="700" fontFamily="var(--asl-font), sans-serif">
        Remote FTP Server
      </text>
      <text x="356" y="114" fill="#5FA37A" fontSize="13.5" fontFamily="var(--asl-mono), monospace">ftp&gt; quote STAT</text>
      <text x="356" y="138" fill="#B4BBC5" fontSize="12.5" fontFamily="var(--asl-font), sans-serif">
        Sends protocol STAT over control channel
      </text>
      <rect x="356" y="158" width="240" height="72" rx="4" fill="#0B0D11" stroke="#262D37" />
      <text x="368" y="180" fill="#B4BBC5" fontSize="11.5" fontFamily="var(--asl-mono), monospace">Returns (server dependent):</text>
      <text x="368" y="199" fill="#E6E8EB" fontSize="11.5" fontFamily="var(--asl-mono), monospace">- Software &amp; session info</text>
      <text x="368" y="217" fill="#E6E8EB" fontSize="11.5" fontFamily="var(--asl-mono), monospace">- User, TLS &amp; transfer state</text>
    </svg>
  );
}
