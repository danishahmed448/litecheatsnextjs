import { getServerSideSitemapLegacy } from "next-sitemap";
import { getPosts } from "../../services";
const siteUrl = 'https://www.flavorsofkalimpong.in/'
export const getServerSideProps = async (ctx) => {
    const posts = (await getPosts()) || [];
  const newsSitemaps = posts.map((item) => ({
    loc: `${siteUrl}blog/${item.node.slug}`,
    lastmod: new Date(item.node.updatedAt || item.node.createdAt).toISOString(),
    changefreq:'daily',
    priority:'0.7'
  }));

  const fields = [...newsSitemaps];

  return getServerSideSitemapLegacy(ctx, fields);
};

export default function Site() {}