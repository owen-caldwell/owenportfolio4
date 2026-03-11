"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMenuHover } from "./components/menu-hover-context";
import MenuOrb from "./components/menu-orb";
import { colorForHref } from "./page-tags";

type HomeColumnProps = {
  className?: string;
};

type HoverableLinkProps = {
  id: string;
  href: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
  isActive?: boolean;
};

function HoverableLink({
  id,
  href,
  children,
  target,
  rel,
  isActive = false,
}: HoverableLinkProps) {
  const { hoveredMenuLinkId, setHoveredMenuLinkId } = useMenuHover();
  const isHovered = !isActive && hoveredMenuLinkId === id;
  const orbColor = colorForHref(href);

  const startHover = () => {
    if (isActive) return;
    setHoveredMenuLinkId(id);
  };
  const endHover = () => setHoveredMenuLinkId(null);

  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={`underline-offset-2 inline-flex items-center gap-2 ${
        isActive
          ? "md:text-neutral-400 dark:md:text-neutral-500 cursor-default"
          : "hover:underline"
      }`}
      onMouseEnter={startHover}
      onMouseLeave={isActive ? undefined : endHover}
      onFocus={startHover}
      onBlur={isActive ? undefined : endHover}
      onPointerDown={isActive ? undefined : endHover}
    >
      <span>{children}</span>
      {isHovered && <MenuOrb color={orbColor} className="mt-px" />}
    </Link>
  );
}

export default function HomeColumn({ className = "" }: HomeColumnProps) {
  const pathname = usePathname();
  const isActiveProject = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div
      className={`flex flex-col pt-12 md:pt-20 md:max-w-[500px] md:min-w-[450px] mx-auto md:mx-0 ${className}`.trim()}
    >
      <div className="leading-[1.5] font-[family-name:var(--font-baskerville)]">
        Designer, Artist, and Engineer who builds performant, human-centered
        software for the web. Right now he&apos;s interning at{" "}
        <Link
          href="https://www.kitescouting.com/"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          KITE Scouting Inc
        </Link>
        , designing on-screen interfaces for a feature film production and
        continuing{" "}
        <Link href="/p/lacima" className="underline underline-offset-2">
          work at a charter school
        </Link>{" "}
        in Brooklyn, NY.
      </div>

      <div className="pt-12 pb-4">Work</div>
      <ul className="space-y-1">
        <li>
          <HoverableLink
            id="work-fda"
            href="/p/fda-redesign"
            isActive={isActiveProject("/p/fda-redesign")}
          >
            UX Research Project: FDA Nutrition Facts
          </HoverableLink>
        </li>
        <li>
          <HoverableLink
            id="work-lacima"
            href="/p/lacima"
            isActive={isActiveProject("/p/lacima")}
          >
            Web Design for La Cima Elementary
          </HoverableLink>
        </li>
        <li>
          <HoverableLink
            id="work-senior"
            href="/p/seniorproject"
            isActive={isActiveProject("/p/seniorproject")}
          >
            IDM@NYU Senior Project
          </HoverableLink>
        </li>
        <li>
          <HoverableLink
            id="work-finn"
            href="https://finn-crawford.com"
            target="_blank"
            rel="noreferrer"
          >
            Finn Crawford&apos;s Portfolio Website
          </HoverableLink>
        </li>
      </ul>

      <div className="pt-12 pb-4 pl-1" />
      <ul className="space-y-1">
        <li>
          <HoverableLink
            id="social-linkedin"
            href="https://www.linkedin.com/in/owencaldwell/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </HoverableLink>
        </li>
        <li>
          <HoverableLink id="social-resume" href="/caldwell-resume.pdf">
            Resume
          </HoverableLink>
        </li>
      </ul>
    </div>
  );
}
