import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Libre_Baskerville } from "next/font/google";
import { Name } from "./name";
import { HomeViewProvider } from "./components/home-view-context";
import { MenuHoverProvider } from "./components/menu-hover-context";
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
  panel,
}: {
  children: React.ReactNode;
  panel: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cx(
        "text-[#363636] bg-white dark:text-[#ededed] dark:bg-[#141414]",
        geistSans.variable,
        geistMono.variable,
        baskerville.variable,
      )}
    >
      <body className="antialiased m-4 max-w-[1200px] md:mx-auto md:px-4">
        <HomeViewProvider>
          <MenuHoverProvider>
            <main className="flex flex-col min-w-0 font-[family-name:var(--font-geist-sans)]">
              <Name />
              {children}
              {panel}
            </main>
          </MenuHoverProvider>
        </HomeViewProvider>
      </body>
    </html>
  );
}
