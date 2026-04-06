import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["react-map-gl"],
  serverExternalPackages: ["mapbox-gl"],
};

export default withNextIntl(nextConfig);
