"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type MenuHoverContextValue = {
  hoveredMenuLinkId: string | null;
  setHoveredMenuLinkId: (id: string | null) => void;
};

const MenuHoverContext = createContext<MenuHoverContextValue | undefined>(
  undefined,
);

export function MenuHoverProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hoveredMenuLinkId, setHoveredMenuLinkId] = useState<string | null>(
    null,
  );

  // Clear transient hover state on route transitions so shared orb layout
  // always returns to the header baseline after navigation.
  useEffect(() => {
    setHoveredMenuLinkId(null);
  }, [pathname]);

  const value = useMemo(
    () => ({ hoveredMenuLinkId, setHoveredMenuLinkId }),
    [hoveredMenuLinkId],
  );

  return (
    <MenuHoverContext.Provider value={value}>
      {children}
    </MenuHoverContext.Provider>
  );
}

export function useMenuHover() {
  const context = useContext(MenuHoverContext);

  if (!context) {
    throw new Error("useMenuHover must be used inside MenuHoverProvider");
  }

  return context;
}
