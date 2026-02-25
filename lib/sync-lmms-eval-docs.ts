import fs from "fs/promises";
import path from "path";

const GITHUB_REPO = "EvolvingLMMs-Lab/lmms-eval";
const DOCS_PATH = "docs";
const CONTENT_DIR = path.join(process.cwd(), "content", "docs");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GitHubFile {
  name: string;
  path: string;
  download_url: string;
  type: "file" | "dir";
}

interface GitHubTag {
  name: string;
}

interface DocMetadata {
  title: string;
  description: string;
  slug: string;
}

interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  tag: string; // original tag string, e.g. "v0.6.1"
}

interface VersionEntry {
  slug: string; // directory name: "latest", "v0.6.1", etc.
  ref: string; // git ref: "main", "v0.6.1", etc.
  label: string; // display label: "Latest", "v0.6.1", etc.
}

// ---------------------------------------------------------------------------
// GitHub API helpers
// ---------------------------------------------------------------------------

function makeHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch all tags from GitHub with pagination.
 */
async function fetchTags(token?: string): Promise<string[]> {
  const tags: string[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/tags?per_page=${perPage}&page=${page}`;
    const response = await fetch(url, { headers: makeHeaders(token) });

    if (!response.ok) {
      throw new Error(
        `GitHub API error fetching tags: ${response.status} ${response.statusText}`,
      );
    }

    const batch: GitHubTag[] = await response.json();
    if (batch.length === 0) break;

    for (const t of batch) {
      tags.push(t.name);
    }

    if (batch.length < perPage) break;
    page++;
  }

  return tags;
}

// ---------------------------------------------------------------------------
// Version parsing & selection
// ---------------------------------------------------------------------------

/**
 * Parse a tag string into a structured version.
 * Returns null for tags that contain .dev or .post suffixes.
 */
function parseVersion(tag: string): ParsedVersion | null {
  // Skip .dev and .post releases
  if (/\.(dev|post)\d*$/i.test(tag)) {
    return null;
  }

  // Match vMAJOR.MINOR or vMAJOR.MINOR.PATCH
  const match = tag.match(/^v(\d+)\.(\d+)(?:\.(\d+))?$/);
  if (!match) return null;

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: match[3] !== undefined ? parseInt(match[3], 10) : 0,
    tag,
  };
}

/**
 * From a list of tags, return all valid semver releases (excluding .dev/.post).
 * Returns versions sorted descending (newest first).
 */
function selectVersions(tags: string[]): ParsedVersion[] {
  const parsed: ParsedVersion[] = [];

  for (const tag of tags) {
    const v = parseVersion(tag);
    if (v) parsed.push(v);
  }

  // Sort descending by major, minor, patch
  parsed.sort((a, b) => {
    if (a.major !== b.major) return b.major - a.major;
    if (a.minor !== b.minor) return b.minor - a.minor;
    return b.patch - a.patch;
  });

  return parsed;
}

// ---------------------------------------------------------------------------
// File fetching
// ---------------------------------------------------------------------------

/**
 * Fetch the list of entries in a GitHub directory at a specific git ref.
 */
async function fetchGitHubFiles(
  token?: string,
  ref?: string,
  subPath?: string,
): Promise<GitHubFile[]> {
  const dirPath = subPath ? `${DOCS_PATH}/${subPath}` : DOCS_PATH;
  let url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${dirPath}`;
  if (ref) {
    url += `?ref=${encodeURIComponent(ref)}`;
  }

  const response = await fetch(url, { headers: makeHeaders(token) });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Download raw file content from GitHub.
 */
async function downloadFile(url: string, token?: string): Promise<string> {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status}`);
  }

  return response.text();
}

// ---------------------------------------------------------------------------
// Content processing (reused from original script)
// ---------------------------------------------------------------------------

/**
 * Extract title from filename.
 */
function extractTitle(filename: string): string {
  if (filename.toLowerCase() === "readme.md") {
    return "Index";
  }

  return filename
    .replace(/\.mdx?$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Escape YAML value - quote if contains special characters.
 */
function escapeYamlValue(value: string): string {
  const needsQuoting = /[:"'\[\]{}#&*!|>@`]|^\s|^\-/.test(value);

  if (needsQuoting) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }

  return value;
}

/**
 * Escape HTML-like tags in markdown content to prevent MDX parsing errors.
 */
function escapeHtmlTags(content: string): string {
  const lines = content.split("\n");
  let inCodeBlock = false;

  return lines
    .map((line) => {
      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        return line;
      }
      if (inCodeBlock) return line;

      // Convert angle-bracket URLs to proper markdown links
      let escapedLine = line.replace(/<(https?:\/\/[^>]+)>/g, "[$1]($1)");

      // Escape < followed by numbers (e.g., p<0.01)
      escapedLine = escapedLine.replace(/<(\d)/g, "\\<$1");

      // Escape <word> patterns but preserve real HTML tags
      escapedLine = escapedLine.replace(
        /<([a-z_][a-z0-9_-]*)>/gi,
        (match, tagName) => {
          const htmlTags = [
            "div",
            "span",
            "p",
            "a",
            "img",
            "ul",
            "ol",
            "li",
            "table",
            "tr",
            "td",
            "th",
            "br",
            "hr",
          ];
          if (htmlTags.includes(tagName.toLowerCase())) {
            if (["br", "hr", "img"].includes(tagName.toLowerCase())) {
              return `<${tagName} />`;
            }
            return match;
          }
          return `\\<${tagName}\\>`;
        },
      );

      return escapedLine;
    })
    .join("\n");
}

/**
 * Escape LaTeX math formulas to prevent MDX parsing errors.
 */
function escapeMathFormulas(content: string): string {
  const lines = content.split("\n");
  let inCodeBlock = false;

  return lines
    .map((line) => {
      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        return line;
      }
      if (inCodeBlock) return line;

      // Single-line block math ($$...$$)
      if (line.trim().startsWith("$$") && line.trim().endsWith("$$")) {
        const mathContent = line.trim().slice(2, -2);
        return "```\n" + mathContent + "\n```";
      }

      // Multi-line block math delimiters
      if (line.trim() === "$$") {
        return "```math";
      }

      // Inline math ($...$)
      return line.replace(/\$([^$\n]+)\$/g, "`$1`");
    })
    .join("\n");
}

/**
 * Add width and height attributes to images.
 */
function addImageDimensions(content: string): string {
  return content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" width="800" height="600" />',
  );
}

/**
 * Convert markdown to MDX with frontmatter.
 */
function convertToMDX(content: string, metadata: DocMetadata): string {
  let processedContent = escapeHtmlTags(content);
  processedContent = escapeMathFormulas(processedContent);
  processedContent = addImageDimensions(processedContent);

  const frontmatter = `---
title: ${escapeYamlValue(metadata.title)}
description: ""
---

`;

  return frontmatter + processedContent;
}

// ---------------------------------------------------------------------------
// Section configuration
// ---------------------------------------------------------------------------

/**
 * Hardcoded sidebar sections.
 *
 * Edit this list to reorganise the sidebar. Pages not listed in any section
 * are placed under the catch-all "Guides" section. Changelog files
 * (matching CHANGELOG_PATTERN) are always placed in the "Changelogs" folder.
 *
 * When the upstream repo organises docs into subfolders (e.g. docs/getting_started/),
 * the script auto-detects them and creates sections from the folder name,
 * so you won't need to list those pages here.
 */
interface SectionConfig {
  /** Display name shown as sidebar separator */
  name: string;
  /** Ordered list of page slugs in this section */
  pages: string[];
}

const SECTIONS: SectionConfig[] = [
  {
    name: "Getting Started",
    pages: ["index", "quickstart"],
  },
  {
    name: "Guides",
    pages: [
      "model_guide",
      "task_guide",
      "run_examples",
      "commands",
      "caching",
      "throughput_metrics",
    ],
  },
  {
    name: "References",
    pages: [
      "current_tasks",
      "mmmu-eval-discrepancy",
    ],
  },
];

/** Pattern for changelog files: lmms-eval-0.3, lmms-eval-0.4, etc. */
const CHANGELOG_PATTERN = /^lmms-eval-[\d.]+$/;

/** Upstream subfolders to skip (not synced as sections). */
const EXCLUDED_FOLDERS = new Set(["images", "i18n", ".github"]);

// ---------------------------------------------------------------------------
// Meta / manifest generation
// ---------------------------------------------------------------------------

/**
 * Convert a snake_case or kebab-case folder name to a display title.
 * e.g. "getting_started" → "Getting Started", "model-guide" → "Model Guide"
 */
function folderNameToTitle(name: string): string {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Create meta.json for a version directory.
 *
 * Uses SECTIONS config to assign pages to named sections.
 * Pages not in any section go into "Guides".
 * Changelog files always go into the "changelogs" subfolder.
 *
 * @param folderSections  Sections auto-detected from upstream subfolders
 *                        (empty when the upstream repo is flat).
 */
function createMetaJson(
  versionLabel: string,
  docs: DocMetadata[],
  folderSections: { name: string; pages: string[] }[],
): object {
  const allSlugs = new Set(docs.map((d) => d.slug));
  const changelogSlugs = docs
    .filter((d) => CHANGELOG_PATTERN.test(d.slug))
    .map((d) => d.slug);
  const placed = new Set<string>();

  const pages: (string | object)[] = [];

  // 1. Hardcoded sections — only include pages that actually exist
  for (const section of SECTIONS) {
    const existing = section.pages.filter(
      (p) => allSlugs.has(p) && !CHANGELOG_PATTERN.test(p),
    );
    if (existing.length === 0) continue;
    pages.push(`---${section.name}---`);
    for (const p of existing) {
      pages.push(p);
      placed.add(p);
    }
  }

  // 2. Auto-detected folder sections (from upstream subfolders)
  //    If a SECTIONS entry matches the folder name, use its page order.
  //    Pages from the folder not listed in SECTIONS are appended after.
  for (const fs of folderSections) {
    if (fs.pages.length === 0) continue;

    // Check if a hardcoded section matches this folder's display name
    const matchingSection = SECTIONS.find(
      (s) => s.name.toLowerCase() === fs.name.toLowerCase(),
    );

    let ordered: string[];
    if (matchingSection) {
      // Use hardcoded order for known pages, append unknown ones after
      const folderSet = new Set(fs.pages);
      const knownOrdered = matchingSection.pages.filter((p) => folderSet.has(p));
      const unknown = fs.pages.filter((p) => !matchingSection.pages.includes(p));
      ordered = [...knownOrdered, ...unknown];
    } else {
      ordered = fs.pages;
    }

    pages.push(`---${fs.name}---`);
    for (const p of ordered) {
      pages.push(p);
      placed.add(p);
    }
  }

  // 3. Catch-all: any remaining non-changelog pages go under "Others"
  const remaining = docs
    .filter(
      (d) =>
        !placed.has(d.slug) && !CHANGELOG_PATTERN.test(d.slug),
    )
    .map((d) => d.slug);
  if (remaining.length > 0) {
    pages.push("---Others---");
    for (const p of remaining) {
      pages.push(p);
    }
  }

  // 4. Changelogs folder (rendered by custom sidebar component)
  if (changelogSlugs.length > 0) {
    pages.push("changelogs");
  }

  return {
    title: versionLabel,
    description: "Evaluation framework documentation",
    root: true,
    pages,
  };
}

/**
 * Create meta.json for the changelogs subfolder.
 */
function createChangelogsMetaJson(changelogSlugs: string[]): object {
  const sorted = [...changelogSlugs].sort((a, b) => {
    const va = a.replace("lmms-eval-", "");
    const vb = b.replace("lmms-eval-", "");
    return parseFloat(vb) - parseFloat(va);
  });

  return {
    title: "Changelogs",
    defaultOpen: false,
    pages: sorted,
  };
}


// ---------------------------------------------------------------------------
// Per-version sync
// ---------------------------------------------------------------------------

/**
 * Sync documentation for a single version.
 * Fetches docs at the given git ref and writes them to content/docs/<slug>/.
 */
async function syncDocsForVersion(
  token: string | undefined,
  version: VersionEntry,
): Promise<void> {
  const targetDir = path.join(CONTENT_DIR, version.slug);
  console.log(
    `  Syncing ${version.label} (ref: ${version.ref}) -> ${version.slug}/`,
  );

  // Ensure version directory exists
  await fs.mkdir(targetDir, { recursive: true });

  // Fetch top-level file list at this ref
  const entries = await fetchGitHubFiles(token, version.ref);
  const mdFiles = entries.filter(
    (f) => f.type === "file" && f.name.match(/\.mdx?$/),
  );
  const subDirs = entries.filter(
    (f) => f.type === "dir" && !EXCLUDED_FOLDERS.has(f.name),
  );

  console.log(`    Found ${mdFiles.length} markdown files, ${subDirs.length} subfolders`);

  const docMetadata: DocMetadata[] = [];
  const changelogSlugs: string[] = [];
  const folderSections: { name: string; pages: string[] }[] = [];

  // --- Process top-level markdown files ---
  for (const file of mdFiles) {
    console.log(`    Processing: ${file.name}`);

    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${encodeURIComponent(version.ref)}/${file.path}`;
    const content = await downloadFile(rawUrl, token);

    const slug =
      file.name.toLowerCase() === "readme.md"
        ? "index"
        : file.name.replace(/\.mdx?$/, "").toLowerCase();
    const title = extractTitle(file.name);
    const description = "";

    docMetadata.push({ title, description, slug });

    const mdxContent = convertToMDX(content, { title, description, slug });

    // Changelog files go into a changelogs/ subfolder
    if (CHANGELOG_PATTERN.test(slug)) {
      const changelogsDir = path.join(targetDir, "changelogs");
      await fs.mkdir(changelogsDir, { recursive: true });
      const targetPath = path.join(changelogsDir, `${slug}.mdx`);
      await fs.writeFile(targetPath, mdxContent, "utf-8");
      changelogSlugs.push(slug);
    } else {
      const targetPath = path.join(targetDir, `${slug}.mdx`);
      await fs.writeFile(targetPath, mdxContent, "utf-8");
    }
  }

  // --- Process subfolders (auto-detected sections) ---
  // Most subfolders: files are written flat alongside top-level files and
  // listed under a separator heading.
  // Special case: a "changelogs" folder is kept as a local subfolder so the
  // custom sidebar component (show 2 + expand) works.
  for (const dir of subDirs) {
    const folderName = dir.name;
    const sectionTitle = folderNameToTitle(folderName);
    const isChangelogsFolder = folderName.toLowerCase() === "changelogs";
    console.log(`    Processing folder: ${folderName}/ -> "${sectionTitle}"`);

    const folderFiles = await fetchGitHubFiles(token, version.ref, folderName);
    const folderMdFiles = folderFiles.filter(
      (f) => f.type === "file" && f.name.match(/\.mdx?$/),
    );

    if (folderMdFiles.length === 0) continue;

    const folderPageSlugs: string[] = [];

    for (const file of folderMdFiles) {
      console.log(`      Processing: ${folderName}/${file.name}`);

      const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${encodeURIComponent(version.ref)}/${file.path}`;
      const content = await downloadFile(rawUrl, token);

      const slug =
        file.name.toLowerCase() === "readme.md"
          ? "index"
          : file.name.replace(/\.mdx?$/, "").toLowerCase();
      const title = extractTitle(file.name);
      const description = "";

      const mdxContent = convertToMDX(content, { title, description, slug });

      if (isChangelogsFolder) {
        // Write into local changelogs/ subfolder (Fumadocs folder for custom component)
        const changelogsDir = path.join(targetDir, "changelogs");
        await fs.mkdir(changelogsDir, { recursive: true });
        const targetPath = path.join(changelogsDir, `${slug}.mdx`);
        await fs.writeFile(targetPath, mdxContent, "utf-8");
        changelogSlugs.push(slug);
      } else {
        // Write flat to the top-level version directory
        const targetPath = path.join(targetDir, `${slug}.mdx`);
        await fs.writeFile(targetPath, mdxContent, "utf-8");
        folderPageSlugs.push(slug);
      }
    }

    if (!isChangelogsFolder) {
      folderSections.push({ name: sectionTitle, pages: folderPageSlugs });
    }
  }

  // Write meta.json for this version
  const metaJson = createMetaJson(version.label, docMetadata, folderSections);
  const metaPath = path.join(targetDir, "meta.json");
  await fs.writeFile(metaPath, JSON.stringify(metaJson, null, 2), "utf-8");

  // Write changelogs/meta.json if there are changelog files
  if (changelogSlugs.length > 0) {
    const changelogsMetaJson = createChangelogsMetaJson(changelogSlugs);
    const changelogsMetaPath = path.join(targetDir, "changelogs", "meta.json");
    await fs.writeFile(
      changelogsMetaPath,
      JSON.stringify(changelogsMetaJson, null, 2),
      "utf-8",
    );
  }
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

/**
 * Sync documentation for all versions (latest + each minor release).
 *
 * 1. Fetch all tags from GitHub
 * 2. Select the latest patch per minor version (exclude .dev/.post)
 * 3. For each selected version + "latest" (main branch): fetch docs, convert
 *    to MDX, write to content/docs/<version>/
 * 4. Write content/docs/versions.json manifest
 */
export async function syncVersionedDocs(
  token?: string,
  options?: { force?: boolean },
): Promise<void> {
  const force = options?.force ?? false;
  console.log("Syncing versioned lmms-eval docs from GitHub...\n");

  try {
    // Ensure base content directory exists
    await fs.mkdir(CONTENT_DIR, { recursive: true });

    // 1. Fetch tags
    console.log("Fetching tags...");
    const tags = await fetchTags(token);
    console.log(`  Found ${tags.length} tags total`);

    // 2. Select versions
    const selected = selectVersions(tags);
    console.log(
      `  Selected ${selected.length} versions: ${selected.map((v) => v.tag).join(", ")}`,
    );

    // 3. Build the version entries list: "latest" first, then tagged versions
    const versions: VersionEntry[] = [
      { slug: "latest", ref: "main", label: "Latest" },
      ...selected.map((v) => ({
        slug: v.tag,
        ref: v.tag,
        label: v.tag,
      })),
    ];

    // 4. Sync each version
    //    "latest" is always re-synced (tracks main branch HEAD).
    //    Tagged versions are only synced if their directory doesn't exist yet,
    //    so manual edits to legacy tag content are preserved across runs.
    //    Pass force=true to re-sync everything (overwrite all versions).
    for (const version of versions) {
      if (!force && version.slug !== "latest") {
        const versionDir = path.join(CONTENT_DIR, version.slug);
        try {
          await fs.access(versionDir);
          console.log(
            `  Skipping ${version.label} (already exists at ${version.slug}/)`,
          );
          continue;
        } catch {
          // Directory doesn't exist — proceed with sync
        }
      }
      await syncDocsForVersion(token, version);
    }

    // 5. Write versions.json manifest (project root, not content dir — Fumadocs scans content/)
    const manifestPath = path.join(process.cwd(), "versions.json");
    await fs.writeFile(
      manifestPath,
      JSON.stringify(versions, null, 2),
      "utf-8",
    );
    console.log(`\nWrote versions manifest to ${manifestPath}`);

    console.log("\nSync completed successfully!");
  } catch (error) {
    console.error("Sync failed:", error);
    throw error;
  }
}

// Also export individual helpers for testing
export {
  fetchTags,
  parseVersion,
  selectVersions,
  fetchGitHubFiles,
  downloadFile,
  extractTitle,
  escapeYamlValue,
  escapeHtmlTags,
  escapeMathFormulas,
  addImageDimensions,
  convertToMDX,
  createMetaJson,
  syncDocsForVersion,
};

// Allow running directly
if (require.main === module) {
  const token = process.env.GITHUB_TOKEN;
  const force = process.argv.includes("--force");
  syncVersionedDocs(token, { force }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
