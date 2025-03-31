import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Libre_Baskerville } from "next/font/google";
import { Name } from "./name";
// import Footer from "./components/footer"

export const metadata: Metadata = {
  metadataBase: new URL("https://owencaldwell.info"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Owen Caldwell",
    template: "%s | Owen Caldwell",
  },
  description: "Web designer and student living in New York.",
};

const baskerville = Libre_Baskerville({
  variable: "--font-baskerville",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const cx = (...classes: string[]) => classes.filter(Boolean).join(" ");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cx(
        "text-[#363636] bg-white dark:text-[#ededed] dark:bg-[#141414]",
        geistSans.variable,
        geistMono.variable,
        baskerville.variable
      )}
    >
      <body className="antialiased mx-4 md:mx-10">
        <main className="flex flex-col min-w-0 h-screen font-[family-name:var(--font-geist-sans)]">
          <Name />
          {children}
        </main>
      </body>
    </html>
  );
}
