/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false, // Keep optimization enabled
    minimumCacheTTL: 31536000, // Cache optimized images for 1 year (they're immutable)
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      // Add more domains as needed for image generation services
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.openai.com",
        port: "",
        pathname: "/**",
      },
      // Add local backend for generated images (uploads)
      {
        protocol: "http",
        hostname: "localhost",
        port: "5012",
        pathname: "/uploads/**",
      },
      // Add local backend for database images (API endpoint)
      {
        protocol: "http",
        hostname: "localhost",
        port: "5012",
        pathname: "/api/images/**",
      },
      // Add production backend for generated images (uploads)
      {
        protocol: "https",
        hostname: "apis-aindrea-ai.vercel.app", // Replace with your actual backend domain
        port: "",
        pathname: "/uploads/**",
      },
      // Add production backend for database images (API endpoint)
      {
        protocol: "https",
        hostname: "apis-aindrea-ai.vercel.app", // Replace with your actual backend domain
        port: "",
        pathname: "/api/images/**",
      },
      // Google AI images
      {
        protocol: "https",
        hostname: "*.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "generativelanguage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "aindrea-previews.fra1.digitaloceanspaces.com",
        port: "",
        pathname: "/**",
      },
    ],
    // Increase timeout for image optimization
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
