"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Name() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean); // Split the path into segments and remove empty strings

  return (
    <header className="flex gap-2 text-[#242424] dark:text-neutral-200 mt-4 md:mt-8 font-[family-name:var(--font-geist-sans)]">
      <Image
        aria-hidden
        src="/ellipse.svg"
        alt="Ellipse icon"
        width={10}
        height={10}
      />
      <nav className="flex text-sm">
        <Link href="/" className="hover:underline underline-offset-2">
          Owen Caldwell
        </Link>
        {pathSegments.map((segment, index) => {
          if (segment === "p") return null; // Skip rendering for the "p" segment
          const href = "/" + pathSegments.slice(0, index + 1).join("/"); // Construct the path for each breadcrumb
          const isLast = index === pathSegments.length - 1; // Check if it's the last breadcrumb
          return (
            <span
              key={href}
              className="flex items-center text-gray-500 dark:text-neutral-400"
            >
              <span className="mx-2">/</span>
              {isLast ? (
                <span>{segment}</span> // Render plain text for the last breadcrumb
              ) : (
                <Link
                  className="hover:underline underline-offset-2"
                  href={href}
                >
                  {segment}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </header>
  );
}
