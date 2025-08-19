import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={{
        name: "docs",
        children: [
          {
            type: "separator",
            name: "Introduction",
          },
          {
            type: "page",
            name: "Welcome",
            url: "/",
          },
          {
            type: "page",
            name: "Getting Started",
            url: "/getting-started",
          },
          {
            type: "page",
            name: "Components Demo",
            url: "/components-demo",
          },
          {
            type: "separator",
            name: "Demo lib",
          },
          {
            type: "folder",
            name: "Examples",
            index: {
              name: "Examples",
              type: "page",
              url: "/examples",
            },
            children: [
              {
                type: "page",
                name: "Basic Pipeline",
                url: "/examples/basic-pipeline",
              },
              {
                type: "page",
                name: "Batch Processing",
                url: "/examples/batch-processing",
              },
              {
                type: "page",
                name: "Notebook",
                url: "/examples/notebook",
              },
            ],
          },
          {
            type: "folder",
            name: "Guides",
            index: {
              name: "Guides",
              type: "page",
              url: "/guides",
            },
            children: [
              {
                type: "page",
                name: "Configuration",
                url: "/guides/configuration",
              },
              {
                type: "page",
                name: "Data IO",
                url: "/guides/data-io",
              },
              {
                type: "page",
                name: "Performance",
                url: "/guides/performance",
              },
            ],
          },
          {
            type: "separator",
            name: "Others",
          },
          {
            type: "page",
            name: "Contributing",
            url: "/contributing",
          },
          {
            type: "page",
            name: "FAQ",
            url: "/faq",
          },
        ],
      }}
      {...baseOptions}
    >
      {children}
    </DocsLayout>
  );
}
