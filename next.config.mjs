/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'share.google', 
      'drive.google.com', 
      'lh3.googleusercontent.com',
      'storage.googleapis.com',
      'images.unsplash.com',
      'res.cloudinary.com',
      'imgur.com',
      'i.imgur.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
