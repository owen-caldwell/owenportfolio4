import ProjectOverlayLayout from "../components/project-overlay-layout";
import { validateAgainstMdxManifest, validateStaticEntries } from "../content/entry-validation";
import { getMdxManifestEntries } from "../content/mdx-manifest";

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV !== "production") {
    const staticEntryErrors = validateStaticEntries();
    const mdxManifest = await getMdxManifestEntries();
    const manifestErrors = validateAgainstMdxManifest(mdxManifest);
    const errors = [...staticEntryErrors, ...manifestErrors];

    if (errors.length) {
      console.warn(
        `[content-registry] ${errors.length} issue(s):\n${errors
          .map((error) => `- ${error}`)
          .join("\n")}`,
      );
    }
  }

  return <ProjectOverlayLayout>{children}</ProjectOverlayLayout>;
}
