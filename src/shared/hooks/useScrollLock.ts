import { useEffect } from "react";

export const useScrollLock = (locked: boolean) => {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const { body } = document;
    const previous = body.style.overflow;

    if (locked) {
      body.style.overflow = "hidden";
    }

    return () => {
      body.style.overflow = previous;
    };
  }, [locked]);
};
