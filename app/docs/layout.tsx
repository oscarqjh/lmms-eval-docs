import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";
import { GithubInfo } from "fumadocs-ui/components/github-info";

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
            url: "/docs/",
          },
          {
            type: "page",
            name: "Getting Started",
            url: "/docs/getting-started",
          },
          {
            type: "page",
            name: "Components Demo",
            url: "/docs/components-demo",
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
              url: "/docs/examples",
            },
            children: [
              {
                type: "page",
                name: "Basic Pipeline",
                url: "/docs/examples/basic-pipeline",
              },
              {
                type: "page",
                name: "Batch Processing",
                url: "/docs/examples/batch-processing",
              },
              {
                type: "page",
                name: "Notebook",
                url: "/docs/examples/notebook",
              },
            ],
          },
          {
            type: "folder",
            name: "Guides",
            index: {
              name: "Guides",
              type: "page",
              url: "/docs/guides",
            },
            children: [
              {
                type: "page",
                name: "Configuration",
                url: "/docs/guides/configuration",
              },
              {
                type: "page",
                name: "Data IO",
                url: "/docs/guides/data-io",
              },
              {
                type: "page",
                name: "Performance",
                url: "/docs/guides/performance",
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
            url: "/docs/contributing",
          },
          {
            type: "page",
            name: "FAQ",
            url: "/docs/faq",
          },
        ],
      }}
      {...baseOptions}
    >
      {children}
    </DocsLayout>
  );
}
