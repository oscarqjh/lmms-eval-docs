import * as fs from "fs/promises";
import * as path from "path";
import { convertRstToMarkdown } from "./rst-converter";

const REPO_OWNER = "EvolvingLMMs-Lab";
const REPO_NAME = "lmms-engine";
const DOCS_PATH = "docs";
const TARGET_DIR = path.join(process.cwd(), "content/docs/lmms-engine");

interface GitHubFile {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
}

interface DocMetadata {
  title: string;
  description: string;
  slug: string;
}

async function fetchGitHubDirectory(
  dirPath: string,
  token?: string
): Promise<GitHubFile[]> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${dirPath}`;
  const headers: HeadersInit = { Accept: "application/vnd.github.v3+json" };
  if (token) headers.Authorization = `token ${token}`;

  const response = await fetch(url, { headers });
  if (!response.ok)
    throw new Error(`Failed to fetch ${dirPath}: ${response.statusText}`);

  return response.json();
}

async function downloadFile(url: string, token?: string): Promise<string> {
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `token ${token}`;

  const response = await fetch(url, { headers });
  if (!response.ok)
    throw new Error(`Failed to download ${url}: ${response.statusText}`);

  return response.text();
}

function extractTitle(filename: string, dirName?: string): string {
  if (
    (filename.toLowerCase() === "index.rst" ||
      filename.toLowerCase() === "index.md") &&
    !dirName
  ) {
    return "Welcome";
  }
  if (
    filename.toLowerCase() === "index.rst" ||
    filename.toLowerCase() === "index.md"
  ) {
    if (dirName)
      return dirName
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
    return "Index";
  }
  return filename
    .replace(/\.(rst|md)$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

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

      line = line.replace(/<(br|hr|img)>/gi, "<$1 />");
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
        return htmlTags.includes(tagName.toLowerCase())
          ? match
          : `\\<${tagName}\\>`;
      });
    })
    .join("\n");
}

function addImageDimensions(content: string): string {
  return content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" width="800" height="600" />'
  );
}

function escapeYamlValue(value: string): string {
  const needsQuoting = /[:"'\[\]{}#&*!|>@`]|^\s|^\-/.test(value);
  if (needsQuoting) return `"${value.replace(/"/g, '\\"')}"`;
  return value;
}

function convertToMDX(content: string, metadata: DocMetadata): string {
  let processedContent = escapeHtmlTags(content);
  processedContent = addImageDimensions(processedContent);
  const frontmatter = `---\ntitle: ${escapeYamlValue(
    metadata.title
  )}\ndescription: ""\n---\n\n`;
  return frontmatter + processedContent;
}

async function processFile(
  file: GitHubFile,
  relativePath: string,
  token?: string
): Promise<{ metadata: DocMetadata; content: string } | null> {
  if (!file.download_url) return null;

  console.log(`  Processing: ${file.path}`);

  const rawContent = await downloadFile(file.download_url, token);
  let content = rawContent;

  if (file.name.endsWith(".rst")) {
    const dirPath = path.dirname(relativePath);
    const currentDir = dirPath === "." ? "" : dirPath;
    content = convertRstToMarkdown(rawContent, currentDir);
  }

  const dirName = path.dirname(relativePath).split(path.sep).pop();
  const isRootLevel = relativePath === file.name;
  const slug = relativePath
    .replace(/\.(rst|md)$/i, "")
    .toLowerCase()
    .replace(/\\/g, "/");
  const title = extractTitle(file.name, isRootLevel ? undefined : dirName);
  const metadata: DocMetadata = { title, description: "", slug };
  const mdxContent = convertToMDX(content, metadata);

  return { metadata, content: mdxContent };
}

async function processDirectory(
  dirPath: string,
  relativePath: string,
  token?: string
): Promise<DocMetadata[]> {
  const files = await fetchGitHubDirectory(dirPath, token);
  const allMetadata: DocMetadata[] = [];

  for (const file of files) {
    const fileRelativePath = relativePath
      ? `${relativePath}/${file.name}`
      : file.name;

    if (file.type === "dir") {
      const subMetadata = await processDirectory(
        file.path,
        fileRelativePath,
        token
      );
      allMetadata.push(...subMetadata);
    } else if (file.name.endsWith(".rst") || file.name.endsWith(".md")) {
      const result = await processFile(file, fileRelativePath, token);
      if (result) {
        allMetadata.push(result.metadata);
        const targetPath = path.join(TARGET_DIR, result.metadata.slug + ".mdx");
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, result.content, "utf-8");
      }
    }
  }

  return allMetadata;
}

function createMetaJson(docs: DocMetadata[]): object {
  const groups: Record<string, Set<string>> = {};
  const rootFiles: string[] = [];

  docs.forEach((doc) => {
    const parts = doc.slug.split("/");
    if (parts.length > 1) {
      const group = parts[0];
      if (!groups[group]) groups[group] = new Set();
      groups[group].add(doc.slug);
    } else {
      rootFiles.push(doc.slug);
    }
  });

  const pages: string[] = [];
  const indexDoc = docs.find((d) => d.slug === "index");
  if (indexDoc) pages.push("index");
  Object.keys(groups).forEach((group) => pages.push(group));

  return {
    title: "lmms-engine",
    description: "Training framework documentation",
    root: true,
    pages,
  };
}

export async function syncLmmsEngineDocs(token?: string): Promise<void> {
  console.log("🔄 Syncing lmms-engine docs from GitHub...");

  await fs.mkdir(TARGET_DIR, { recursive: true });
  const allMetadata = await processDirectory(DOCS_PATH, "", token);

  console.log(`📄 Processed ${allMetadata.length} files`);

  const metaJson = createMetaJson(allMetadata);
  await fs.writeFile(
    path.join(TARGET_DIR, "meta.json"),
    JSON.stringify(metaJson, null, 2),
    "utf-8"
  );

  console.log("✅ Sync completed successfully!");
  console.log(`📁 Files saved to: ${TARGET_DIR}`);
}
