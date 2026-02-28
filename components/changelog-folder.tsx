"use client";

import { Children, useState, type ReactNode } from "react";
import type { PageTree } from "fumadocs-core/server";
import {
  SidebarFolder,
  SidebarFolderTrigger,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarSeparator,
} from "fumadocs-ui/components/layout/sidebar";
import { FiChevronsDown, FiChevronsUp } from "react-icons/fi";

const CHANGELOG_FOLDER_NAME = "Releases";
const DEFAULT_VISIBLE = 1;

/**
 * Custom sidebar folder component.
 *
 * For the "Changelogs" folder: renders as a separator-style title with
 * DEFAULT_VISIBLE items shown, plus an expand toggle for the rest.
 * All other folders render with default Fumadocs behavior.
 */
export function CustomFolder({
  item,
  level,
  children,
}: {
  item: PageTree.Folder;
  level: number;
  children: ReactNode;
}) {
  if (String(item.name) !== CHANGELOG_FOLDER_NAME) {
    return (
      <SidebarFolder defaultOpen={item.defaultOpen}>
        {item.index ? (
          <SidebarFolderLink
            href={item.index.url}
            external={item.index.external}
          >
            {item.icon}
            {item.name}
          </SidebarFolderLink>
        ) : (
          <SidebarFolderTrigger>
            {item.icon}
            {item.name}
          </SidebarFolderTrigger>
        )}
        <SidebarFolderContent>{children}</SidebarFolderContent>
      </SidebarFolder>
    );
  }

  return <ChangelogSection>{children}</ChangelogSection>;
}

function ChangelogSection({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const childArray = Children.toArray(children);
  const totalCount = childArray.length;
  const hasMore = totalCount > DEFAULT_VISIBLE;
  const visibleChildren = expanded
    ? childArray
    : childArray.slice(0, DEFAULT_VISIBLE);
  const hiddenCount = totalCount - DEFAULT_VISIBLE;

  return (
    <div className="mt-6">
      <SidebarSeparator>Releases</SidebarSeparator>
      {visibleChildren}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="changelog-expand-toggle"
        >
          <span className="changelog-expand-line" />
          <span>{expanded ? <FiChevronsUp /> : <FiChevronsDown />}</span>
          <span className="changelog-expand-line" />
        </button>
      )}
    </div>
  );
}
