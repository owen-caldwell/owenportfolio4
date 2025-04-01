import { unstable_ViewTransition as ViewTransition } from "react";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransition>
      <div className="max-w-[600px] prose pb-20 mx-auto">{children}</div>
    </ViewTransition>
  );
}
