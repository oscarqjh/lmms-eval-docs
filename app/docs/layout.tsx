import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";
import { Boxes, ChartColumnIcon, Wrench } from "lucide-react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      sidebar={{
        tabs: [
          {
            title: "Models",
            description: "Our models",
            url: "/docs/models",
            icon: <Boxes color="#ad6dd0" className="w-5 h-5" />,
          },
          {
            title: "lmms-eval",
            description: "Evaluation framework",
            url: "/docs/lmms-eval",
            icon: <ChartColumnIcon color="#4aafdeff" className="w-5 h-5" />,
          },
          {
            title: "lmms-engine",
            description: "Training framework",
            url: "/docs/lmms-engine",
            icon: <Wrench color="#f59e0b" className="w-5 h-5" />,
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
