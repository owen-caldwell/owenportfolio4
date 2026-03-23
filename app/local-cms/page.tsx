import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isLocalCmsPageAllowed } from "./allowed";
import LocalCmsClient from "./local-cms-client";

export default async function LocalCmsPage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  if (!isLocalCmsPageAllowed(host)) {
    notFound();
  }
  return <LocalCmsClient />;
}
