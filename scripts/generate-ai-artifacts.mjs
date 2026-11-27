import { register } from "node:module";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

register("./ts-loader.mjs", pathToFileURL(path.join(process.cwd(), "scripts", "ts-loader.mjs")));

const [
  { getAllSecurityFolders, getAllSecurityNotes },
  { getAllPosts },
  { profile, projects, publications },
  { groupWork },
  { toolCategories },
  { engineeringTools },
  {
    renderLlmsFullTxt,
    renderLlmsTxt,
    renderPostMarkdown,
    renderSecurityNoteMarkdown
  }
] = await Promise.all([
  import("@/data/notes/security"),
  import("@/lib/content"),
  import("@/data/portfolio"),
  import("@/data/work-categories.js"),
  import("@/data/tool-categories.js"),
  import("@/data/tools.js"),
  import("@/lib/ai-markdown")
]);

function writeUtf8Lf(filePath, content) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const normalized = content.replace(/\r\n?/g, "\n");
  writeFileSync(filePath, normalized, "utf8");
}

const publicNotesDir = path.join(process.cwd(), "public", "notes");
rmSync(publicNotesDir, { recursive: true, force: true });

const securityFolders = getAllSecurityFolders();
const securityNotes = getAllSecurityNotes();
const publishedPosts = getAllPosts({ includeDrafts: false });

const securityDocs = [];
for (const note of securityNotes) {
  const md = renderSecurityNoteMarkdown(note);
  securityDocs.push(md);
  const outPath = path.join(publicNotesDir, "security", note.folderSlug, `${note.slug}.md`);
  writeUtf8Lf(outPath, md);
}

const postDocs = [];
for (const post of publishedPosts) {
  if (post.draft) continue;
  const md = renderPostMarkdown(post);
  postDocs.push(md);
  const outPath = path.join(publicNotesDir, `${post.slug}.md`);
  writeUtf8Lf(outPath, md);
}

const llmsTxt = renderLlmsTxt({
  profile,
  securityFolders,
  posts: publishedPosts,
  projectGroups: groupWork(projects),
  publications,
  toolCategories,
  engineeringTools
});

const llmsFullTxt = renderLlmsFullTxt({
  summaryTxt: llmsTxt,
  securityNotesMarkdown: securityDocs,
  postsMarkdown: postDocs
});

writeUtf8Lf(path.join(process.cwd(), "public", "llms.txt"), llmsTxt);
writeUtf8Lf(path.join(process.cwd(), "public", "llms-full.txt"), llmsFullTxt);

console.log(
  `Generated ${securityDocs.length} security .md file(s), ${postDocs.length} note .md file(s), llms.txt, and llms-full.txt.`
);
