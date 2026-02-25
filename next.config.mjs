import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX({
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
        source: "/",
        destination: "/docs/latest",
        permanent: true,
      },
      {
        source: "/docs",
        destination: "/docs/latest",
        permanent: true,
      },
      // Redirect old lmms-eval paths to versioned latest
      {
        source: "/docs/lmms-eval/:path*",
        destination: "/docs/latest/:path*",
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);
