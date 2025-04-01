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
  const directory = path.join(
    process.cwd(),
    "app",
    "seniorproject",
    "acc-final-project"
  );
  const slugs = await getSlugs(directory);

  const seniorproject = slugs.map((slug) => ({
    url: `https://owencaldwell.info/seniorproject/${slug}`,
    lastModified: new Date().toISOString(),
  }));
  const accfinalproject = slugs.map((slug) => ({
    url: `https://owencaldwell.info/acc-final-project/${slug}`,
    lastModified: new Date().toISOString(),
  }));

  // Add more routes later!!
  const routes = [""].map((route) => ({
    url: `https://owencaldwell.info${route}`,
    lastModified: new Date().toISOString(),
  }));

  return [...routes, ...seniorproject, ...accfinalproject];
}
