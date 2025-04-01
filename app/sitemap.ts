import { promises as fs } from "fs";
import path from "path";

async function getSlugs(dir: string) {
  const entries = await fs.readdir(dir, {
    recursive: true,
    withFileTypes: true,
  });
  return entries
    .filter((entry) => entry.isFile() && entry.name === "page.mdx")
    .map((entry) => {
      const relativePath = path.relative(
        dir,
        path.join(entry.parentPath, entry.name)
      );
      return path.dirname(relativePath);
    })
    .map((slug) => slug.replace(/\\/g, "/"));
}

export default async function sitemap() {
  const directory = path.join(process.cwd(), "app", "p");
  const slugs = await getSlugs(directory);

  const pages = slugs.map((slug) => ({
    url: `https://owencaldwell.info/p/${slug}`,
    lastModified: new Date().toISOString(),
  }));

  // Add more routes later!!
  const routes = [""].map((route) => ({
    url: `https://owencaldwell.info${route}`,
    lastModified: new Date().toISOString(),
  }));

  return [...routes, ...pages];
}
