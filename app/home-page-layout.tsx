"use client";

import Featured from "./featured";
import HomeColumn from "./home-column";
import { useHomeView } from "./components/home-view-context";

export default function HomePageLayout() {
  const { mobileView } = useHomeView();
  const showFeatured = mobileView === "featured";

  return (
    <div className="isolate flex flex-col gap-y-4 md:flex-row md:gap-x-12">
      <div
        className={`${showFeatured ? "hidden md:block" : "block"} md:relative md:z-0`}
      >
        <HomeColumn />
      </div>

      <div
        data-right-scroll
        className={`${showFeatured ? "block" : "hidden"} md:block py-10 md:max-w-[50vw] md:relative md:z-50`}
      >
        <div data-right-scroll-content>
          <Featured />
        </div>
      </div>
    </div>
  );
}
