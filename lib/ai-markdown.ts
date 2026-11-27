import type { Post } from "@/types/content";
import type { Publication, Project } from "@/types/portfolio";
import type {
  DiagramSlot,
  InspectorEntry,
  NoteContentBlock,
  NoteSubSection,
  SecurityFolderEntry,
  SecurityNoteEntry,
  TerminalBlockData
} from "@/types/security-notes";

export const SITE_ORIGIN = "https://eng-asl.com";
export const AUTHOR_NAME = "Ahmed Ibrahim Asl (ASL)";
export const AUTHOR_URL = `${SITE_ORIGIN}/about/`;

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[`*_~]/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function cleanDashes(text: string): string {
  return text.replace(/\u2014/g, " - ").replace(/\u2013/g, "-");
}

function escapeTableCell(value: string): string {
  return cleanDashes(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}

function formatTerminalBlock(terminal: TerminalBlockData): string[] {
  const out: string[] = [];
  if (terminal.title) {
    const labelSuffix = terminal.sourceLabel ? ` *(${cleanDashes(terminal.sourceLabel)})*` : "";
    out.push(`**${cleanDashes(terminal.title)}**${labelSuffix}`);
    out.push("");
  } else if (terminal.sourceLabel) {
    out.push(`*${cleanDashes(terminal.sourceLabel)}*`);
    out.push("");
  }

  const lines: string[] = [];
  for (const line of terminal.lines) {
    if (line.kind === "command") {
      lines.push(`${line.prompt || "$"} ${line.text}`);
    } else if (line.kind === "input") {
      lines.push(`${line.prompt || "Input:"} ${line.text}`);
    } else {
      lines.push(line.text);
    }
  }

  const fenceLang = terminal.environment === "LINUX" ? "bash" : "text";
  out.push(`\`\`\`${fenceLang}`);
  out.push(cleanDashes(lines.join("\n")));
  out.push("```");

  if (terminal.caption) {
    out.push("");
    out.push(`*${cleanDashes(terminal.caption)}*`);
  }

  return out;
}

function renderDiagramMarkdown(
  diagram: DiagramSlot,
  headingPrefix = "####"
): string[] {
  const out: string[] = [
    `${headingPrefix} Diagram: ${cleanDashes(diagram.title)}`,
    "",
    cleanDashes(diagram.summary),
    ""
  ];
  if (diagram.imageSrc) {
    out.push(`Illustration URL: ${SITE_ORIGIN}${diagram.imageSrc}`, "");
  }
  out.push(`Diagram description: ${cleanDashes(diagram.alt)}`);
  if (diagram.keyPoints.length > 0) {
    out.push("");
    for (const point of diagram.keyPoints) {
      out.push(`- ${cleanDashes(point)}`);
    }
  }
  out.push("");
  return out;
}

function renderInspectorMarkdown(
  entry: InspectorEntry,
  diagramsById: Record<string, DiagramSlot>,
  embeddedDiagramIds: Set<string>,
  headingPrefix = "####"
): string[] {
  const out: string[] = [`${headingPrefix} ${cleanDashes(entry.label)}`, ""];
  if (entry.sourceLabel) {
    out.push(`*Source: ${cleanDashes(entry.sourceLabel)}*`, "");
  }
  out.push(cleanDashes(entry.shortDefinition), "");

  if (entry.steps?.length) {
    entry.steps.forEach((step, idx) => {
      out.push(`${idx + 1}. ${cleanDashes(step)}`);
    });
    out.push("");
  }

  if (entry.details.length > 0) {
    for (const detail of entry.details) {
      out.push(`- ${cleanDashes(detail)}`);
    }
    out.push("");
  }

  if (entry.tables?.length) {
    for (const tbl of entry.tables) {
      if (tbl.caption) {
        out.push(`**${cleanDashes(tbl.caption)}**`, "");
      }
      out.push(`| ${tbl.columns.map(escapeTableCell).join(" | ")} |`);
      out.push(`| ${tbl.columns.map(() => "---").join(" | ")} |`);
      for (const row of tbl.rows) {
        out.push(`| ${row.map(escapeTableCell).join(" | ")} |`);
      }
      out.push("");
    }
  }

  if (entry.diagramId && diagramsById[entry.diagramId] && !embeddedDiagramIds.has(entry.diagramId)) {
    const diagram = diagramsById[entry.diagramId];
    embeddedDiagramIds.add(diagram.id);
    out.push(...renderDiagramMarkdown(diagram, `${headingPrefix}#`));
  }

  const terminals = [
    ...(entry.terminal ? [entry.terminal] : []),
    ...(entry.terminals ?? [])
  ];
  for (const term of terminals) {
    out.push(...formatTerminalBlock(term), "");
  }

  if (entry.securityNote) {
    out.push(`**Security Note:** ${cleanDashes(entry.securityNote)}`, "");
  }

  return out;
}

function serializeBlocks(
  blocks: NoteContentBlock[],
  note: SecurityNoteEntry,
  embeddedDiagramIds: Set<string>,
  renderedInspectorIds: Set<string>,
  overviewState: { rendered: boolean }
): string[] {
  const diagramsById = Object.fromEntries(note.diagrams.map((d) => [d.id, d]));
  const lines: string[] = [];

  const appendSubSection = (sub: NoteSubSection) => {
    lines.push(`### ${cleanDashes(sub.title)}`);
    lines.push("");
    if (sub.intro) {
      lines.push(cleanDashes(sub.intro));
      lines.push("");
    }
    lines.push(...serializeBlocks(sub.blocks, note, embeddedDiagramIds, renderedInspectorIds, overviewState));
  };

  for (const block of blocks) {
    switch (block.type) {
      case "paragraph":
        lines.push(cleanDashes(block.text));
        lines.push("");
        break;

      case "subheading": {
        const prefix = block.level === 4 ? "####" : "###";
        lines.push(`${prefix} ${cleanDashes(block.text)}`);
        lines.push("");
        break;
      }

      case "bullets":
        if (block.lead) {
          lines.push(cleanDashes(block.lead));
          lines.push("");
        }
        for (const item of block.items) {
          lines.push(`- ${cleanDashes(item)}`);
        }
        lines.push("");
        break;

      case "code-sample":
        lines.push("```text");
        lines.push(cleanDashes(block.lines.join("\n")));
        lines.push("```");
        if (block.caption) {
          lines.push("");
          lines.push(`*${cleanDashes(block.caption)}*`);
        }
        lines.push("");
        break;

      case "diagram-embed":
        for (const id of block.diagramIds) {
          const diagram = diagramsById[id];
          if (!diagram) continue;
          embeddedDiagramIds.add(diagram.id);
          lines.push(...renderDiagramMarkdown(diagram, "####"));
        }
        if (block.caption) {
          lines.push(`*${cleanDashes(block.caption)}*`);
          lines.push("");
        }
        break;

      case "context-links":
        for (const link of block.links) {
          if (link.href) {
            lines.push(`- Reference: [${cleanDashes(link.label)}](${link.href})`, "");
          } else if (link.overviewSheet && note.overviewSheetImage) {
            overviewState.rendered = true;
            lines.push(
              `#### Diagram: Complete FTP Overview Visual Sheet`,
              "",
              `Illustration URL: ${SITE_ORIGIN}${note.overviewSheetImage}`,
              "",
              "Combined visual summary of FTP Dual TCP Connections (Control TCP 21 and Data Channel), Active FTP (PORT), Passive FTP (PASV), authentication, cleartext transport, and anonymous access.",
              ""
            );
          } else if (link.inspectorId && note.inspectors[link.inspectorId]) {
            const target = note.inspectors[link.inspectorId];
            if (!renderedInspectorIds.has(target.id)) {
              renderedInspectorIds.add(target.id);
              lines.push(...renderInspectorMarkdown(target, diagramsById, embeddedDiagramIds, "####"));
            } else {
              lines.push(
                `- Extended reference (${cleanDashes(link.label)}): see [${cleanDashes(target.label)}](#${slugifyHeading(target.label)})`,
                ""
              );
            }
          } else if (link.diagramId && diagramsById[link.diagramId]) {
            const diagram = diagramsById[link.diagramId];
            if (!embeddedDiagramIds.has(diagram.id)) {
              embeddedDiagramIds.add(diagram.id);
              lines.push(...renderDiagramMarkdown(diagram, "####"));
            } else {
              lines.push(
                `- Diagram (${cleanDashes(link.label)}): see [${cleanDashes(diagram.title)}](#${slugifyHeading(diagram.title)})`,
                ""
              );
            }
          }
        }
        break;

      case "callout":
        lines.push(`> **${cleanDashes(block.title)}**`);
        for (const bodyLine of block.body) {
          lines.push(`> ${cleanDashes(bodyLine)}`);
        }
        if (block.bullets?.length) {
          for (const bullet of block.bullets) {
            lines.push(`> - ${cleanDashes(bullet)}`);
          }
        }
        lines.push("");
        break;

      case "terminal":
        lines.push(...formatTerminalBlock(block.terminal));
        lines.push("");
        break;

      case "settings-table":
        if (block.title) {
          lines.push(`**${cleanDashes(block.title)}**`);
          lines.push("");
        }
        lines.push("| Setting | Description |");
        lines.push("|---|---|");
        for (const row of block.rows) {
          lines.push(`| \`${escapeTableCell(row.setting)}\` | ${escapeTableCell(row.summary)} |`);
        }
        lines.push("");
        break;

      case "comparison-table":
        if (block.title) {
          lines.push(`**${cleanDashes(block.title)}**`);
          lines.push("");
        }
        lines.push(`| ${block.columns.map(escapeTableCell).join(" | ")} |`);
        lines.push(`| ${block.columns.map(() => "---").join(" | ")} |`);
        for (const row of block.rows) {
          lines.push(`| ${row.cells.map(escapeTableCell).join(" | ")} |`);
        }
        lines.push("");
        break;

      case "response-codes":
        if (block.title) {
          lines.push(`**${cleanDashes(block.title)}**`);
          lines.push("");
        }
        lines.push("| Code | Meaning |");
        lines.push("|---|---|");
        for (const codeRow of block.codes) {
          lines.push(
            `| \`${escapeTableCell(codeRow.code)}\` | ${escapeTableCell(codeRow.meaning)} |`
          );
        }
        lines.push("");
        break;

      case "risk-list":
        lines.push(`**${cleanDashes(block.title)}**`);
        lines.push("");
        for (const item of block.items) {
          lines.push(`- ${cleanDashes(item)}`);
        }
        if (block.footnote) {
          lines.push("");
          lines.push(cleanDashes(block.footnote));
        }
        lines.push("");
        break;

      case "term-chips":
        break;

      case "steps-grid":
        for (const card of block.cards) {
          lines.push(`- **${cleanDashes(card.title)}:** ${cleanDashes(card.body)}`);
        }
        lines.push("");
        break;

      case "sub-sections":
        for (const sub of block.sections) {
          appendSubSection(sub);
        }
        break;
    }
  }

  return lines;
}

export function renderSecurityNoteMarkdown(note: SecurityNoteEntry): string {
  const canonicalUrl = `${SITE_ORIGIN}/notes/security/${note.folderSlug}/${note.slug}/`;
  const markdownUrl = `${SITE_ORIGIN}/notes/security/${note.folderSlug}/${note.slug}.md`;
  const diagramsById = Object.fromEntries(note.diagrams.map((d) => [d.id, d]));
  const embeddedDiagramIds = new Set<string>();
  const renderedInspectorIds = new Set<string>();
  const overviewState = { rendered: false };

  const out: string[] = [
    `# ${cleanDashes(note.title)}`,
    "",
    `> ${cleanDashes(note.summary)}`,
    "",
    `- **Author:** [${AUTHOR_NAME}](${AUTHOR_URL})`,
    `- **Canonical URL:** ${canonicalUrl}`,
    `- **Markdown URL:** ${markdownUrl}`,
    `- **Category:** Security / ${cleanDashes(note.folderTitle)}`,
    `- **Published:** ${note.publishedAt}`,
    `- **Updated:** ${note.updatedAt}`,
    `- **Ports:** ${cleanDashes(note.ports)}`,
    `- **Daemon:** ${cleanDashes(note.daemon)}`,
    `- **Tags:** ${note.tags.map(cleanDashes).join(", ")}`,
    ""
  ];

  for (const part of note.parts) {
    out.push(`## ${cleanDashes(part.title)}`);
    out.push("");
    out.push(cleanDashes(part.intro));
    out.push("");
    out.push(
      ...serializeBlocks(part.blocks, note, embeddedDiagramIds, renderedInspectorIds, overviewState)
    );
  }

  const remainingInspectors = Object.values(note.inspectors).filter(
    (entry) => !renderedInspectorIds.has(entry.id)
  );
  const remainingDiagrams = note.diagrams.filter((d) => !embeddedDiagramIds.has(d.id));
  const includeOverviewSheet = Boolean(note.overviewSheetImage && !overviewState.rendered);

  if (remainingInspectors.length > 0 || remainingDiagrams.length > 0 || includeOverviewSheet) {
    out.push("## Additional Extended Reference");
    out.push("");
    for (const entry of remainingInspectors) {
      out.push(...renderInspectorMarkdown(entry, diagramsById, embeddedDiagramIds, "###"));
    }
    if (includeOverviewSheet) {
      out.push("### Complete Overview Visual Sheet", "");
      out.push(
        `Combined one-page FTP reference sheet at ${SITE_ORIGIN}${note.overviewSheetImage} summarizing Dual TCP Connections (Control TCP 21 and Data Channel), Active FTP (PORT), Passive FTP (PASV), and quick facts.`,
        ""
      );
    }
    for (const diagram of remainingDiagrams) {
      if (embeddedDiagramIds.has(diagram.id)) continue;
      out.push(...renderDiagramMarkdown(diagram, "###"));
    }
  }

  out.push("## References and Source Attribution");
  out.push("");
  out.push(`- Author: [${AUTHOR_NAME}](${AUTHOR_URL}) (${SITE_ORIGIN}/)`);
  out.push(`- Canonical article: ${canonicalUrl}`);
  out.push("- Security section index: https://eng-asl.com/notes/security/");
  if (note.authorAttributionNote) {
    out.push(`- ${cleanDashes(note.authorAttributionNote)}`);
  } else {
    out.push(
      "- Practical command examples reference an authorized Hack The Box (HTB Academy) lab host (`10.129.14.136`)."
    );
  }
  if (note.references?.length) {
    for (const refItem of note.references) {
      if (refItem.href) {
        out.push(
          `- [${cleanDashes(refItem.label)}](${refItem.href})${refItem.detail ? `: ${cleanDashes(refItem.detail)}` : ""}`
        );
      } else {
        out.push(
          `- ${cleanDashes(refItem.label)}${refItem.detail ? `: ${cleanDashes(refItem.detail)}` : ""}`
        );
      }
    }
  } else {
    out.push(
      "- Standard protocol & daemon documentation: RFC 959 (File Transfer Protocol), Linux `man vsftpd.conf`, OpenSSL `s_client`, and [Nmap Scripting Engine (NSE)](https://nmap.org/book/nse.html)."
    );
  }
  out.push("");

  return `${out.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

export function renderPostMarkdown(post: Post): string {
  const canonicalUrl = `${SITE_ORIGIN}/notes/${post.slug}/`;
  const markdownUrl = `${SITE_ORIGIN}/notes/${post.slug}.md`;

  const out: string[] = [
    `# ${cleanDashes(post.title)}`,
    "",
    `> ${cleanDashes(post.summary)}`,
    "",
    `- **Author:** [${AUTHOR_NAME}](${AUTHOR_URL})`,
    `- **Canonical URL:** ${canonicalUrl}`,
    `- **Markdown URL:** ${markdownUrl}`,
    `- **Category:** ${cleanDashes(post.category)}`,
    post.publishedAt ? `- **Published:** ${post.publishedAt}` : "",
    post.updatedAt ? `- **Updated:** ${post.updatedAt}` : "",
    post.difficulty ? `- **Difficulty:** ${cleanDashes(post.difficulty)}` : "",
    post.tags.length ? `- **Tags:** ${post.tags.map(cleanDashes).join(", ")}` : "",
    "",
    cleanDashes(post.content.trim()),
    ""
  ].filter((line, idx, arr) => !(line === "" && arr[idx - 1] === ""));

  return `${out.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

export interface LlmsContextInput {
  profile: {
    name: string;
    socials: Array<{ label: string; href: string }>;
  };
  securityFolders: SecurityFolderEntry[];
  posts: Post[];
  projectGroups: Array<{
    id: string;
    title: string;
    intro: string;
    projects: Project[];
  }>;
  publications: Publication[];
  toolCategories: ReadonlyArray<{ slug: string; title: string; intro: string }>;
  engineeringTools: Array<{ title: string; description: string; href: string }>;
}

export function renderLlmsTxt(input: LlmsContextInput): string {
  const {
    profile,
    securityFolders,
    posts,
    projectGroups,
    publications,
    toolCategories,
    engineeringTools
  } = input;

  const lines: string[] = [
    `# ${profile.name}`,
    "",
    "> Portfolio of Ahmed Ibrahim Asl, an Embedded Systems & IoT R&D Engineer, teaching assistant, and technical educator based in Egypt.",
    "",
    "## Core pages",
    "",
    `- [Home](${SITE_ORIGIN}/): Overview of Ahmed's embedded systems, IoT, robotics, research, teaching work, and free engineering tools.`,
    `- [Work](${SITE_ORIGIN}/work/): Embedded firmware, robotics, IoT telemetry, secure hardware, OTA management, Flutter, and interface projects.`,
    `- [About](${SITE_ORIGIN}/about/): Experience, university teaching, technical capabilities, publications, CV, and workshops.`,
    `- [Engineering notes](${SITE_ORIGIN}/notes/): Published engineering field notes, Security documentation, Linux and cybersecurity walkthroughs, and the Learn With Me series.`,
    `- [Tools](${SITE_ORIGIN}/tools/): Searchable electronics calculators and guided engineering workbenches.`,
    `- [Contact](${SITE_ORIGIN}/contact/): Email and professional profiles.`,
    "",
    "## Machine-readable documentation",
    "",
    `- [AI content index](${SITE_ORIGIN}/llms.txt): Concise structured index of public articles, Markdown endpoints, projects, publications, and engineering tools.`,
    `- [Full public documentation corpus](${SITE_ORIGIN}/llms-full.txt): Complete compiled Markdown text of published engineering notes.`,
    `- [XML Sitemap](${SITE_ORIGIN}/sitemap.xml): Canonical list of published pages.`,
    "",
    "## Notes and technical articles",
    "",
    `- [Security Field Notes](${SITE_ORIGIN}/notes/security/): Structured cybersecurity reconnaissance, hardening, and protocol notes.`
  ];

  for (const folder of securityFolders) {
    lines.push(
      `- [${cleanDashes(folder.title)} folder](${SITE_ORIGIN}/notes/security/${folder.slug}/): ${cleanDashes(folder.summary)}`
    );
    for (const note of folder.notes) {
      const htmlUrl = `${SITE_ORIGIN}/notes/security/${note.folderSlug}/${note.slug}/`;
      const mdUrl = `${SITE_ORIGIN}/notes/security/${note.folderSlug}/${note.slug}.md`;
      lines.push(
        `  - [${cleanDashes(note.title)}](${htmlUrl}) ([Markdown version](${mdUrl})): ${cleanDashes(note.summary)}`
      );
    }
  }

  for (const post of posts) {
    if (post.draft) continue;
    const htmlUrl = `${SITE_ORIGIN}/notes/${post.slug}/`;
    const mdUrl = `${SITE_ORIGIN}/notes/${post.slug}.md`;
    lines.push(
      `- [${cleanDashes(post.title)}](${htmlUrl}) ([Markdown version](${mdUrl})): ${cleanDashes(post.summary)}`
    );
  }

  lines.push("", "## Public projects", "");
  for (const group of projectGroups) {
    lines.push(
      `- [${cleanDashes(group.title)}](${SITE_ORIGIN}/work/${group.id}/): ${cleanDashes(group.intro)}`
    );
    for (const project of group.projects) {
      lines.push(
        `  - [${cleanDashes(project.title)}](${SITE_ORIGIN}/work/${group.id}/${project.slug}/): ${cleanDashes(project.description)}`
      );
    }
  }

  if (publications.length > 0) {
    lines.push("", "## Research publications", "");
    for (const pub of publications) {
      lines.push(
        `- [${cleanDashes(pub.title)}](${pub.href}): ${cleanDashes(pub.authors)}. ${cleanDashes(pub.venue)} (${pub.year}).`
      );
    }
  }

  lines.push(
    "",
    "## Free engineering tools",
    "",
    `- [Guided workbenches](${SITE_ORIGIN}/tools/category/workbenches/): Project generators, academic planning, control simulation, embedded code, security commands, and battery estimation.`,
    `- [Circuit design tools](${SITE_ORIGIN}/tools/category/circuit-design/): Interactive calculators for circuits, component values, timing, power supplies, and control logic.`,
    `- [Text and encoding tools](${SITE_ORIGIN}/tools/category/text-encoding/): ROT transformations plus ASCII and hexadecimal conversions with worked examples.`,
    `- [Unit conversion tools](${SITE_ORIGIN}/tools/category/conversions/): Temperature and capacitance converters with explicit units and assumptions.`,
    `- [Number-system tools](${SITE_ORIGIN}/tools/category/number-systems/): Binary, hexadecimal, complements, shifts, and multi-base conversion tools.`,
    `- [Physics and math tools](${SITE_ORIGIN}/tools/category/physics-math/): Motion, force, wavelength, frequency, percentages, roots, and logarithm calculators.`
  );

  for (const category of toolCategories) {
    if (["satellite", "rf-engineering"].includes(category.slug)) {
      lines.push(
        `- [${cleanDashes(category.title)}](${SITE_ORIGIN}/tools/category/${category.slug}/): ${cleanDashes(category.intro)}`
      );
    }
  }

  lines.push(
    `- [Gradify](${SITE_ORIGIN}/tools/gradify/): University GPA calculation and a Delta Engineering transcript and graduation planner.`,
    `- [Model Mission](${SITE_ORIGIN}/tools/ai-script-generator/): Guided computer vision project builder with YOLO26, YOLOE open-vocabulary detection, monocular depth, and U-Net segmentation examples.`,
    `- [Sensor Code Generator](${SITE_ORIGIN}/tools/sensor-code-generator/): Arduino, ESP-IDF, and PlatformIO code for sensors, I2C, SPI, UART, Bluetooth, Wi-Fi, ESP-NOW, and other embedded interfaces.`,
    `- [PID Simulator](${SITE_ORIGIN}/tools/pid-simulator/): Interactive proportional, integral, and derivative controller tuning.`,
    `- [Battery Life Estimator](${SITE_ORIGIN}/tools/battery-estimator/): ESP32 runtime and average-current estimates from active and sleep duty cycles.`,
    `- [Security Mission](${SITE_ORIGIN}/tools/security-command-builder/): Guided command builder for authorized security labs.`
  );

  for (const extraTool of engineeringTools) {
    if (
      ![
        "/tools/gradify",
        "/tools/ai-script-generator",
        "/tools/sensor-code-generator",
        "/tools/pid-simulator",
        "/tools/battery-estimator",
        "/tools/security-command-builder"
      ].includes(extraTool.href)
    ) {
      const normalized = extraTool.href.endsWith("/") ? extraTool.href : `${extraTool.href}/`;
      lines.push(`- [${cleanDashes(extraTool.title)}](${SITE_ORIGIN}${normalized}): ${cleanDashes(extraTool.description)}`);
    }
  }

  lines.push(
    "",
    "## Areas of work",
    "",
    "- Embedded firmware in C and C++ for ESP32, ESP8266, Arduino, and AVR systems.",
    "- IoT architecture, device connectivity, telemetry, networking, Linux, and Python.",
    "- Robotics, sensor integration, secure access systems, and remotely operated vehicles.",
    "- Flutter control interfaces, UI and UX design, and technical communication.",
    "- University teaching in satellite communication, acoustics, digital and logic circuits, measurement, and sensors.",
    "",
    "## Writing series",
    "",
    "- OverTheWire Bandit walkthroughs: Linux, SSH, files, permissions, processes, and networking.",
    "- Learn With Me: Linux, Python, Dart and Flutter, and Git.",
    "",
    "## Identity and references",
    ""
  );

  for (const social of profile.socials) {
    lines.push(`- [${cleanDashes(social.label)}](${social.href})`);
  }
  lines.push("");

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

export function renderLlmsFullTxt(input: {
  summaryTxt: string;
  securityNotesMarkdown: string[];
  postsMarkdown: string[];
}): string {
  const sections: string[] = [
    input.summaryTxt.trim(),
    "---",
    "# Complete Published Technical Notes",
    ...input.securityNotesMarkdown.map((doc) => doc.trim()),
    ...input.postsMarkdown.map((doc) => doc.trim())
  ];

  return `${sections.join("\n\n---\n\n")}\n`;
}
