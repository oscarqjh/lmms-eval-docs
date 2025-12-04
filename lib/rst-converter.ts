/**
 * RST to Markdown/MDX Converter
 * Modular functions for converting reStructuredText to Markdown
 */

/**
 * Convert toctree directives to markdown sections with links
 * @param content - RST content to convert
 * @param currentDir - Current directory path (e.g., "user_guide" or "") for resolving relative links
 */
export function convertToctree(
  content: string,
  currentDir: string = ""
): string {
  const toctreeRegex =
    /\.\. toctree::\s*\n((?:(?:[ \t]+[^\n]*|)\n)*?)(?=\n[^\s]|\n*$)/g;

  return content.replace(toctreeRegex, (match, block) => {
    const lines = block
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l);
    const options = lines.filter((l: string) => l.startsWith(":"));
    const entries = lines.filter((l: string) => !l.startsWith(":"));

    const captionLine = options.find((l: string) => l.startsWith(":caption:"));
    const caption = captionLine
      ? captionLine.replace(":caption:", "").trim()
      : "";

    let result = "";
    if (caption) result += `## ${caption}\n\n`;

    entries.forEach((entry: string) => {
      const title = entry
        .split("/")
        .pop()!
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      const fullPath = entry.startsWith("/")
        ? entry.substring(1)
        : currentDir
        ? `${currentDir}/${entry}`
        : entry;
      result += `- [${title}](/docs/lmms-engine/${fullPath})\n`;
    });

    return result + "\n";
  });
}

export function convertDocDirectives(content: string): string {
  return content.replace(/:doc:`([^`]+)`/g, (match, docPath) => {
    const title = docPath.split("/").pop() || docPath;
    return `[${title}](${docPath})`;
  });
}

export function convertHeaders(content: string): string {
  let result = content;
  result = result.replace(/^(.+)\n=+\s*$/gm, "# $1");
  result = result.replace(/^(.+)\n-+\s*$/gm, "## $1");
  result = result.replace(/^(.+)\n~+\s*$/gm, "### $1");
  result = result.replace(/^[=\-~]+\s*$/gm, "");
  return result;
}

export function convertInlineFormatting(content: string): string {
  let result = content;
  result = result.replace(/``([^`]+)``/g, "`$1`");
  result = result.replace(/\*\*([^*]+)\*\*/g, "**$1**");
  result = result.replace(/`([^<]+)<([^>]+)>`_/g, "[$1]($2)");
  return result;
}

export function removeRstDirectives(content: string): string {
  let result = content;
  result = result.replace(/:ref:`[^`]+`/g, "");
  result = result.replace(/\.\. [a-z-]+::/g, "");
  result = result.replace(/^\*\s*$/gm, "");
  return result;
}

export function escapeCurlyBraces(content: string): string {
  const lines = content.split("\n");
  let inCodeBlock = false;

  return lines
    .map((line) => {
      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        return line;
      }
      if (inCodeBlock) return line;
      return line.replace(/\{/g, "\\{").replace(/\}/g, "\\}");
    })
    .join("\n");
}

export function convertRstToMarkdown(
  rstContent: string,
  currentDir: string = ""
): string {
  try {
    let markdown = rstContent;
    markdown = convertToctree(markdown, currentDir);
    markdown = convertHeaders(markdown);
    markdown = convertDocDirectives(markdown);
    markdown = convertInlineFormatting(markdown);
    markdown = removeRstDirectives(markdown);
    markdown = escapeCurlyBraces(markdown);
    return markdown.trim();
  } catch (error) {
    console.error("RST conversion failed:", error);
    return rstContent;
  }
}
