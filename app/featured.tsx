import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function Featured() {
  const links = [
    {
      description:
        "*Learning to Paint* is a generative art installation.",
      image: "/featured/seniorproject.png",
      alt: "A complex scramble of white dots on a black screen.",
      url: "/seniorproject",
    },
    {
      description:
        "[www.jennaferayo.com](https://www.jennaferayo.com) is a portfolio website for the New York multi-media artist Jenna Ferayo.",
      image: "/featured/jennaferayo.png",
      alt: "guy",
      url: "https://www.jennaferayo.com",
    },
    {
      description:
        "[www.finn-crawford.com](https://www.finn-crawford.com)",
      image: "/featured/finncrawford.png",
      alt: "a portfolio website with a gallery of images.",
      url: "https://www.finn-crawford.com",
    },
    {
      description:
        "[www.huntkats.com](https://www.huntkats.com)",
      image: "/featured/huntermathews.png",
      alt: "a portfolio website with a gallery of images.",
      url: "https://www.huntkas.com",
    },
  ];

  return (
    <div className="flex flex-col gap-y-16">
      {links.map((link) => (
        <div key={link.url} className="flex flex-col items-start md:p-3">
          <Link href={link.url}>
            <Image
              width={1000}
              height={1000}
              alt={link.alt}
              src={link.image}
              className="rounded-md w-auto max-h-[50vh]"
            />
          </Link>
          <div className="px-4 md:px-6 relative -top-2 md:-top-4">
            <ReactMarkdown>{link.description}</ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
}
