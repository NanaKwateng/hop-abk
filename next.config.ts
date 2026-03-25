import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
          : "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },



  //  images: {
  //       remotePatterns: [
  //           {
  //               protocol: "https",
  //               hostname: "**.supabase.co",
  //           },
  //       ],
  //   },
};

export default nextConfig;








