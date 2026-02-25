import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { BookIcon } from "lucide-react";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: <>lmms-eval</>,
    url: "/docs/latest",
  },
  links: [
    {
      icon: <BookIcon />,
      text: "Blog",
      url: "https://www.lmms-lab.com/",
      secondary: false,
    },
  ],
  githubUrl: "https://github.com/EvolvingLMMs-Lab/lmms-eval",
};
