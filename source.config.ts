import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.vercel.app/docs/mdx/collections#define-docs
export const docs = defineDocs({
  docs: {
    schema: frontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
});

// lmms-eval documentation from external GitHub repo
export const lmmsEvalDocs = defineDocs({
  dir: "content/docs/lmms-eval",
  docs: {
    schema: frontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    // MDX options
    remarkPlugins: (v) => {
      // Filter out the remark-image plugin to prevent remote image fetching
      return v.filter((plugin) => {
        if (Array.isArray(plugin)) {
          return plugin[0]?.name !== "remarkImage";
        }
        return plugin?.name !== "remarkImage";
      });
    },
  },
});
