const withMDX = require("@next/mdx")();

/** @type {import("next").NextConfig} */
const config = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  transpilePackages: [
    "@carbon/react",
    "@carbon/tailwind",
    "geist",
    "react-icons",
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = withMDX(config);

// export default config;
