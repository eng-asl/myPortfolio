export type TerminalLineKind = "command" | "input" | "response" | "output" | "comment";

export type SemanticTone = "ok" | "info" | "warn" | "alert";

export type ExampleSourceLabel =
  | "Original lab output"
  | "Abbreviated output"
  | "Illustrative example"
  | "Reconstructed directory tree";

export interface TerminalLine {
  kind: TerminalLineKind;
  prompt?: string;
  code?: string;
  text: string;
  copyable?: boolean;
  statusTone?: SemanticTone;
}

export interface TerminalBlockData {
  id: string;
  title: string;
  environment: "LINUX" | "FTP CLIENT" | "CONFIG" | "BANNER";
  caption?: string;
  sourceLabel?: ExampleSourceLabel;
  copyCommand?: string;
  lines: TerminalLine[];
}

export type DiagramPlaceholderKind =
  | "chroot-sandbox"
  | "protocol-security"
  | "anon-enum"
  | "diagnostics"
  | "nmap-trace";

export interface DiagramSlot {
  id: string;
  figLabel: string;
  partId: string;
  subSectionId?: string;
  title: string;
  summary: string;
  keyPoints: string[];
  imageSrc?: string;
  swapPath: string;
  alt: string;
  placeholderKind?: DiagramPlaceholderKind;
  aspectRatio?: string;
  relatedInspectorIds?: string[];
}

export type InspectorCategory =
  | "Directive"
  | "Concept"
  | "Protocol"
  | "Command"
  | "Response Code"
  | "Risk";

export interface InspectorTable {
  caption?: string;
  columns: string[];
  rows: string[][];
}

export interface InspectorEntry {
  id: string;
  label: string;
  category: InspectorCategory;
  defaultTab?: "overview" | "security" | "terminal" | "diagram";
  shortDefinition: string;
  details: string[];
  steps?: string[];
  tables?: InspectorTable[];
  securityNote?: string;
  terminal?: TerminalBlockData;
  terminals?: TerminalBlockData[];
  sourceLabel?: ExampleSourceLabel;
  diagramId?: string;
  anchorSectionId?: string;
  relatedIds?: string[];
}

export interface SettingRow {
  setting: string;
  summary: string;
  riskLevel?: "safe" | "info" | "danger";
  inspectorId?: string;
  actionLabel?: string;
}

export interface InlineTermRef {
  label: string;
  inspectorId: string;
}

export interface ComparisonRow {
  cells: string[];
  inspectorId?: string;
  actionLabel?: string;
}

export interface ResponseCodeRow {
  code: string;
  meaning: string;
  tone: "ok" | "info" | "alert";
  inspectorId?: string;
}

export interface StepCardItem {
  code: string;
  title: string;
  body: string;
  inspectorId?: string;
}

export interface NoteSubSection {
  id: string;
  label: string;
  shortLabel: string;
  title: string;
  intro?: string;
  diagramIds?: string[];
  blocks: NoteContentBlock[];
}

export type NoteActionKind =
  | "inspect"
  | "view-diagram"
  | "view-large"
  | "view-example"
  | "view-output"
  | "setup-guide"
  | "reference";

export interface NoteContextLink {
  label: string;
  actionKind?: NoteActionKind;
  inspectorId?: string;
  diagramId?: string;
  overviewSheet?: boolean;
  href?: string;
}

export type NoteContentBlock =
  | {
      type: "paragraph";
      text: string;
      terms?: InlineTermRef[];
    }
  | {
      type: "subheading";
      id?: string;
      text: string;
      level?: 3 | 4;
    }
  | {
      type: "bullets";
      lead?: string;
      items: string[];
    }
  | {
      type: "code-sample";
      lines: string[];
      caption?: string;
    }
  | {
      type: "diagram-embed";
      diagramIds: string[];
      layout?: "single" | "pair";
      hideSummary?: boolean;
      disableZoom?: boolean;
      caption?: string;
    }
  | {
      type: "context-links";
      links: NoteContextLink[];
    }
  | {
      type: "callout";
      tone: SemanticTone;
      title: string;
      body: string[];
      bullets?: string[];
      inspectorIds?: string[];
    }
  | {
      type: "terminal";
      terminal: TerminalBlockData;
    }
  | {
      type: "settings-table";
      id: string;
      title?: string;
      rows: SettingRow[];
    }
  | {
      type: "comparison-table";
      id: string;
      title?: string;
      columns: string[];
      rows: ComparisonRow[];
    }
  | {
      type: "response-codes";
      id: string;
      title?: string;
      codes: ResponseCodeRow[];
    }
  | {
      type: "risk-list";
      title: string;
      items: string[];
      footnote?: string;
    }
  | {
      type: "term-chips";
      title?: string;
      chipIds: string[];
    }
  | {
      type: "steps-grid";
      cards: StepCardItem[];
    }
  | {
      type: "sub-sections";
      sections: NoteSubSection[];
    };

export interface NotePart {
  id: string;
  indexLabel?: string;
  shortTitle: string;
  title: string;
  intro: string;
  diagramIds: string[];
  blocks: NoteContentBlock[];
  tocSubheadings?: Array<{ id: string; title: string }>;
}

export interface QuickFactItem {
  label: string;
  value: string;
  inspectorId?: string;
}

export interface NoteReferenceLink {
  label: string;
  href?: string;
  detail?: string;
}

export interface SecurityNoteEntry {
  slug: string;
  folderSlug: string;
  folderTitle: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
  difficulty: string;
  readingTime: number;
  tags: string[];
  protocolBadge: string;
  ports: string;
  daemon: string;
  overviewSheetImage: string;
  quickFacts: QuickFactItem[];
  parts: NotePart[];
  diagrams: DiagramSlot[];
  inspectors: Record<string, InspectorEntry>;
  references?: NoteReferenceLink[];
  authorAttributionNote?: string;
}

export interface SecurityFolderEntry {
  slug: string;
  title: string;
  phaseCode?: string;
  summary: string;
  notes: SecurityNoteEntry[];
}
