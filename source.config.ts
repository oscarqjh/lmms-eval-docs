import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";

export const docs = defineDocs({
  docs: {
    schema: frontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (v) => {
      return v.filter((plugin) => {
        if (Array.isArray(plugin)) {
          return plugin[0]?.name !== "remarkImage";
        }
        return !(
          typeof plugin === "object" &&
          plugin !== null &&
          "name" in plugin &&
          plugin.name === "remarkImage"
        );
      });
    },
  },
});
