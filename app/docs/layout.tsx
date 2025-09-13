import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";
import { GithubInfo } from "fumadocs-ui/components/github-info";
import { Boxes, Layers } from "lucide-react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      sidebar={{
        tabs: [
          {
            title: "Demo",
            description: "Demo documentation",
            url: "/docs/demo",
            icon: <Layers color="#9ebbff" className="w-5 h-5" />,
          },
          {
            title: "Models",
            description: "Our models",
            url: "/docs/models",
            icon: <Boxes color="#ad6dd0" className="w-5 h-5" />,
          },
        ],
      }}
      tree={source.pageTree}
      {...baseOptions}
    >
      {children}
    </DocsLayout>
  );
}
