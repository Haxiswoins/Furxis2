
/** @type {import('next').NextConfig} */

// Helper function to extract hostname from a URL
const getHostnameFromUrl = (url) => {
  try {
    if (!url) return null;
    const urlObj = new URL(url);
    // Return hostname, removing port if present
    return urlObj.hostname;
  } catch (e) {
    // Return a default or null if URL is invalid
    return null;
  }
};

const baseUrlHostname = getHostnameFromUrl(process.env.NEXT_PUBLIC_BASE_URL);

const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'placehold.co',
  },
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  {
    protocol: 'https',
    hostname: 'apod.nasa.gov',
  },
  {
    protocol: 'https',
    hostname: 'www.nasa.gov',
  }
];

// Add the production hostname only if it's valid and not localhost
if (baseUrlHostname && baseUrlHostname !== 'localhost') {
  remotePatterns.push({
    protocol: process.env.NEXT_PUBLIC_BASE_URL?.startsWith('https') ? 'https' : 'http',
    hostname: baseUrlHostname,
  });
}

const nextConfig = {
  images: {
    remotePatterns: remotePatterns,
  },
  // Using rewrites is a more robust way to handle API calls in development
  // and avoids issues with fetch on the server-side.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `http://localhost:3000/api/:path*`, // Proxy to API routes
      },
    ]
  },
};

export default nextConfig;
