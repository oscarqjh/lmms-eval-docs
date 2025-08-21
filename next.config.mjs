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
        destination: "/docs", // redirect to /docs
        permanent: true, // 308 permanent redirect
      },
    ];
  },
};

export default withMDX(config);
