export type TerminalLineKind = "command" | "input" | "response" | "output" | "comment";

export type SemanticTone = "ok" | "info" | "warn" | "alert";

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
  copyCommand?: string;
  lines: TerminalLine[];
}

export type DiagramPlaceholderKind =
  | "chroot-sandbox"
  | "protocol-security"
  | "anon-enum"
  | "diagnostics";

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

export interface InspectorEntry {
  id: string;
  label: string;
  category: InspectorCategory;
  shortDefinition: string;
  details: string[];
  securityNote?: string;
  terminal?: TerminalBlockData;
  diagramId?: string;
  relatedIds?: string[];
}

export interface SettingRow {
  setting: string;
  summary: string;
  riskLevel?: "safe" | "info" | "danger";
  inspectorId: string;
}

export interface InlineTermRef {
  label: string;
  inspectorId: string;
}

export interface ComparisonRow {
  cells: string[];
  inspectorId?: string;
}

export interface ResponseCodeRow {
  code: string;
  meaning: string;
  tone: "ok" | "info" | "alert";
  inspectorId: string;
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

export type NoteContentBlock =
  | {
      type: "paragraph";
      text: string;
      terms?: InlineTermRef[];
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
  indexLabel: string;
  shortTitle: string;
  title: string;
  intro: string;
  diagramIds: string[];
  blocks: NoteContentBlock[];
}

export interface QuickFactItem {
  label: string;
  value: string;
  inspectorId?: string;
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
}

export interface SecurityFolderEntry {
  slug: string;
  title: string;
  phaseCode: string;
  summary: string;
  notes: SecurityNoteEntry[];
}
