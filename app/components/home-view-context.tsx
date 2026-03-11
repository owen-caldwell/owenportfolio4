"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type HomeMobileView = "index" | "featured";

type HomeViewContextValue = {
  mobileView: HomeMobileView;
  setMobileView: (view: HomeMobileView) => void;
  toggleMobileView: () => void;
};

const HomeViewContext = createContext<HomeViewContextValue | null>(null);

export function HomeViewProvider({ children }: { children: React.ReactNode }) {
  const [mobileView, setMobileView] = useState<HomeMobileView>("index");

  const value = useMemo(
    () => ({
      mobileView,
      setMobileView,
      toggleMobileView: () =>
        setMobileView((current) =>
          current === "featured" ? "index" : "featured",
        ),
    }),
    [mobileView],
  );

  return (
    <HomeViewContext.Provider value={value}>
      {children}
    </HomeViewContext.Provider>
  );
}

export function useHomeView() {
  const context = useContext(HomeViewContext);
  if (!context) {
    throw new Error("useHomeView must be used within HomeViewProvider");
  }
  return context;
}
