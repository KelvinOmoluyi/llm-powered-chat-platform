import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "llm-powered-chat-platform::username";

export const useUsername = () => {
  const [username, setUsername] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUsername(stored);
    }
    setIsReady(true);
  }, []);

  const saveUsername = useCallback((name: string) => {
    const cleaned = name.replace(/\s+/g, " ").trim();
    if (!cleaned) return;

    setUsername(cleaned);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, cleaned);
    }
  }, []);

  const clearUsername = useCallback(() => {
    setUsername("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    username,
    isReady,
    hasUsername: Boolean(username),
    setUsername: saveUsername,
    clearUsername,
  };
};
