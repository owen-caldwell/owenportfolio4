import type { NextRequest } from "next/server";

function isLocalHost(host: string): boolean {
  return (
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1:") ||
    host.startsWith("[::1]:")
  );
}

/** True only in development and when the request targets loopback (matches API behavior). */
export function isLocalCmsEnabled(request: NextRequest): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const host = request.headers.get("host") ?? "";
  return isLocalHost(host);
}

/** Same rules as {@link isLocalCmsEnabled} for server components that only have the Host header. */
export function isLocalCmsPageAllowed(host: string): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return isLocalHost(host);
}
