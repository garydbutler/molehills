import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return ["www.inchmeal.app", "molehills.app", "www.molehills.app"].map(
      (host) => ({
        source: "/:path*",
        has: [{ type: "host", value: host }],
        destination: "https://inchmeal.app/:path*",
        permanent: true,
      }),
    );
  },
};

export default nextConfig;
