/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler:{
    styledComponents:true,
  },
  images: {
    domains: ['res.cloudinary.com','freepngimg.com','www.pngmart.com','media.graphassets.com'],
  },
}

module.exports = nextConfig
