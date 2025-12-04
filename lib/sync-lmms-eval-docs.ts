import fs from "fs/promises";
import path from "path";

const GITHUB_REPO = "EvolvingLMMs-Lab/lmms-eval";
const DOCS_PATH = "docs";
const TARGET_DIR = path.join(process.cwd(), "content", "docs", "lmms-eval");

interface GitHubFile {
  name: string;
  path: string;
  download_url: string;
  type: "file" | "dir";
}

interface DocMetadata {
  title: string;
  description: string;
  slug: string;
}

/**
 * Fetch files from GitHub repository
 */
async function fetchGitHubFiles(token?: string): Promise<GitHubFile[]> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${DOCS_PATH}`;
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Download file content from GitHub
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

/**
 * Extract title from filename
 */
function extractTitle(filename: string): string {
  // Special case for README.md -> "Index"
  if (filename.toLowerCase() === "readme.md") {
    return "Index";
  }

  // Remove file extension and convert to title case
  return filename
    .replace(/\.mdx?$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Extract description from markdown content
 */
function extractDescription(content: string): string {
  return "";
}

/**
 * Escape YAML value - quote if contains special characters
 */
function escapeYamlValue(value: string): string {
  // Quote if contains: colon, quotes, brackets, braces, or starts with special chars
  const needsQuoting = /[:"'\[\]{}#&*!|>@`]|^\s|^\-/.test(value);

  if (needsQuoting) {
    // Escape existing quotes and wrap in quotes
    return `"${value.replace(/"/g, '\\"')}"`;
  }

  return value;
}

/**
 * Escape HTML-like tags in markdown content
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

      // Escape <word> patterns but preserve real HTML tags
      return line.replace(/<([a-z_][a-z0-9_-]*)>/gi, (match, tagName) => {
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
        // Convert self-closing tags to proper format first
        if (htmlTags.includes(tagName.toLowerCase())) {
          // Self-closing tags need />
          if (["br", "hr", "img"].includes(tagName.toLowerCase())) {
            return `<${tagName} />`;
          }
          return match;
        }
        // Escape non-HTML placeholders
        return `\\<${tagName}\\>`;
      });
    })
    .join("\n");
}

/**
 * Add width and height attributes to images
 */
function addImageDimensions(content: string): string {
  // Convert markdown images to HTML img tags with width and height
  return content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" width="800" height="600" />'
  );
}

/**
 * Convert markdown to MDX with frontmatter
 */
function convertToMDX(content: string, metadata: DocMetadata): string {
  // Escape HTML-like tags and add image dimensions
  let processedContent = escapeHtmlTags(content);
  processedContent = addImageDimensions(processedContent);
  const frontmatter = `---
title: ${escapeYamlValue(metadata.title)}
description: ""
---

`;

  return frontmatter + processedContent;
}

/**
 * Create meta.json for navigation
 */
function createMetaJson(docs: DocMetadata[]): object {
  const pages = docs
    .filter((doc) => doc.slug !== "index")
    .map((doc) => doc.slug);

  return {
    title: "lmms-eval",
    description: "Evaluation framework documentation",
    root: true,
    pages: ["---Getting Started---", "index", "---Guides---", ...pages],
  };
}

/**
 * Main sync function
 */
export async function syncLmmsEvalDocs(token?: string): Promise<void> {
  console.log("🔄 Syncing lmms-eval docs from GitHub...");

  try {
    // Ensure target directory exists
    await fs.mkdir(TARGET_DIR, { recursive: true });

    // Fetch file list from GitHub
    const files = await fetchGitHubFiles(token);
    const mdFiles = files.filter(
      (file) => file.type === "file" && file.name.match(/\.mdx?$/)
    );

    console.log(`📄 Found ${mdFiles.length} markdown files`);

    const docMetadata: DocMetadata[] = [];

    // Process each file
    for (const file of mdFiles) {
      console.log(`  Processing: ${file.name}`);

      // Download content
      const content = await downloadFile(file.download_url, token);

      // Extract metadata
      // Convert README.md to index for proper routing
      const slug =
        file.name.toLowerCase() === "readme.md"
          ? "index"
          : file.name.replace(/\.mdx?$/, "").toLowerCase();
      const title = extractTitle(file.name);
      const description = extractDescription(content);

      docMetadata.push({ title, description, slug });

      // Convert to MDX
      const mdxContent = convertToMDX(content, { title, description, slug });

      // Write to file
      const targetPath = path.join(TARGET_DIR, `${slug}.mdx`);
      await fs.writeFile(targetPath, mdxContent, "utf-8");
    }

    // Create meta.json
    const metaJson = createMetaJson(docMetadata);
    const metaPath = path.join(TARGET_DIR, "meta.json");
    await fs.writeFile(metaPath, JSON.stringify(metaJson, null, 2), "utf-8");

    console.log("✅ Sync completed successfully!");
    console.log(`📁 Files saved to: ${TARGET_DIR}`);
  } catch (error) {
    console.error("❌ Sync failed:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const token = process.env.GITHUB_TOKEN;
  syncLmmsEvalDocs(token).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
