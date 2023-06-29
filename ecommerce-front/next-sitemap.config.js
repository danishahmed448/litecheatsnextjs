const siteUrl = 'https://www.flavorsofkalimpong.in/'
const config = {
    siteUrl: process.env.SITE_URL || 'https://www.flavorsofkalimpong.in',
    generateRobotsTxt: true,
    changefreq: 'daily',
    exclude: ['/404'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        disallow: ["/404"],
      },
      { userAgent: "*", allow: "/" },
    ],
    additionalSitemaps: [
      `${siteUrl}sitemap-products.xml`,
      `${siteUrl}sitemap-categories.xml`,
      `${siteUrl}sitemap-blogcategories.xml`,
      `${siteUrl}sitemap-blogpost.xml`,
      `${siteUrl}sitemap-blogsubcategory.xml`,
    ],
  },
  }
  
 module.exports= config