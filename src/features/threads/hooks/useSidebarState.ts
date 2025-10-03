import { useCallback, useEffect, useState } from "react";

const DESKTOP_BREAKPOINT = 1024;

const getIsDesktop = () =>
  typeof window !== "undefined" && window.innerWidth >= DESKTOP_BREAKPOINT;

export const useSidebarState = () => {
  const [isDesktop, setIsDesktop] = useState(getIsDesktop);
  const [isOpen, setIsOpen] = useState(() => (getIsDesktop() ? true : false));
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const desktop = getIsDesktop();
      setIsDesktop(desktop);
      setIsOpen((prev) => (desktop ? true : prev));
      if (!desktop) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openSidebar = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      setIsCollapsed(false);
    }
  }, [isDesktop]);

  return {
    isDesktop,
    isOpen,
    isCollapsed: isDesktop ? isCollapsed : false,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    toggleCollapse,
  };
};

