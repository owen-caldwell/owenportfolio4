import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function Featured() {
  const links = [
    {
      title: "Learning to Paint",
      description:
        "Learning to Paint - a generative art installation built using L-systems.",
      image: "/featured/seniorproject.png",
      alt: "A complex scramble of white dots on a black screen.",
      imageHref: "/p/seniorproject",
      actionHref: "/p/seniorproject",
    },
    {
      title: "Jenna Ferayo",
      description: "Design & Development, Portfolio",
      image: "/featured/jennaferayo.png",
      alt: "guy",
      imageHref: "/work",
      actionHref: "https://www.jennaferayo.com",
    },
    {
      title: "Finn Crawford",
      description: "Design & Development, Portfolio",
      image: "/featured/finncrawford.png",
      alt: "a portfolio website with a gallery of images.",
      imageHref: "/work",
      actionHref: "https://finn-crawford.com",
    },
    {
      title: "Hunter Mathews",
      description: "Design & Development, Portfolio",
      image: "/featured/huntermathews.png",
      alt: "a portfolio website with a gallery of images.",
      imageHref: "/work",
      actionHref: "https://www.huntkats.com",
    },
  ];

  return (
    <div className="flex flex-col gap-2 md:overflow-y-auto md:h-dvh md:-my-20 md:py-10 md:[scrollbar-width:none] md:[-ms-overflow-style:none] md:[&::-webkit-scrollbar]:hidden">
      {links.map((link) => (
        <div key={link.title} className="flex flex-col ">
          <Link href={link.imageHref}>
            <Image
              width={1000}
              height={1000}
              alt={link.alt}
              src={link.image}
            />
          </Link>
          <div className="flex flex-col">
            <h3 className="text-base">{link.title}</h3>
            <ReactMarkdown>{link.description}</ReactMarkdown>
            <Link
              href={link.actionHref}
              className="text-red-500"
            >
              Visit website
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
