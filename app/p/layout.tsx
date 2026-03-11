import ProjectOverlayLayout from "../components/project-overlay-layout";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProjectOverlayLayout>{children}</ProjectOverlayLayout>;
}
