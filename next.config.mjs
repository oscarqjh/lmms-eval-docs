import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX({
  // Disable image size fetching to prevent timeouts on remote images
  remarkPlugins: [],
});

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/", // when user visits /
        destination: "/docs/lmms-eval", // redirect to /docs/lmms-eval
        permanent: true, // 308 permanent redirect
      },
      {
        source: "/docs",
        destination: "/docs/lmms-eval",
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);
