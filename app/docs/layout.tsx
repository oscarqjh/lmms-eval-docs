import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";
import { BookOpen, Tag } from "lucide-react";
import { CustomFolder } from "@/components/changelog-folder";
import versions from "@/versions.json";

interface VersionEntry {
  slug: string;
  ref: string;
  label: string;
}

function buildSidebarTabs(versionList: VersionEntry[]) {
  return versionList.map((v) => ({
    title: v.label,
    description: v.slug === "latest" ? "Main branch" : `Release ${v.label}`,
    url: `/docs/${v.slug}`,
    icon:
      v.slug === "latest" ? (
        <span className="flex items-center justify-center w-full h-full"><BookOpen className="w-5 h-5" /></span>
      ) : (
        <span className="flex items-center justify-center w-full h-full"><Tag className="w-5 h-5" /></span>
      ),
  }));
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      sidebar={{
        tabs: buildSidebarTabs(versions as VersionEntry[]),
        components: {
          Folder: CustomFolder,
        },
      }}
      tree={source.pageTree}
      {...baseOptions}
    >
      {children}
    </DocsLayout>
  );
}
