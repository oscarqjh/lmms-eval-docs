import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/", // when user visits /
        destination: "/docs/demo", // redirect to /docs
        permanent: true, // 308 permanent redirect
      },
      {
        source: "/docs",
        destination: "/docs/demo",
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);
