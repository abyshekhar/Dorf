import "./src/env.mjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  redirects: async () => {
    return [
      {
        source: "/forms",
        destination: "/dashboard",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
