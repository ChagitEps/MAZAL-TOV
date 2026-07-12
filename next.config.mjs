/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Puppeteer (PDF rendering) runs server-side only — keep it out of the client bundle.
  serverExternalPackages: ["puppeteer", "puppeteer-core"],
};

export default nextConfig;
