import { useCallback, useEffect, useMemo, useState } from "react";
import { createId } from "../../../shared/utils/ids";
import type { ChatThread } from "../../../types";

const STORAGE_KEY = "llm-powered-chat-platform::threads";

export const createThread = (title = "New conversation"): ChatThread => ({
  id: createId(),
  title,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [],
});

type ThreadsState = {
  threads: ChatThread[];
  activeThreadId: string;
};

const createInitialState = (): ThreadsState => {
  const initialThread = createThread();
  return {
    threads: [initialThread],
    activeThreadId: initialThread.id,
  };
};

export const useThreadsManager = () => {
  const [state, setState] = useState<ThreadsState>(() => createInitialState());
  const { threads, activeThreadId } = state;

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<ThreadsState> | null;
      if (!parsed?.threads?.length) return;

      setState({
        threads: parsed.threads,
        activeThreadId:
          parsed.activeThreadId && parsed.threads.some((thread) => thread.id === parsed.activeThreadId)
            ? parsed.activeThreadId
            : parsed.threads[0].id,
      });
    } catch (error) {
      console.warn("Unable to restore conversations", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (threads.length === 0) {
      setState(createInitialState());
    }
  }, [threads.length]);

  const setActiveThread = useCallback((id: string) => {
    setState((prev) =>
      prev.activeThreadId === id
        ? prev
        : {
            ...prev,
            activeThreadId: id,
          },
    );
  }, []);

  const createNewThread = useCallback(() => {
    setState((prev) => {
      const nextThread = createThread();
      return {
        threads: [nextThread, ...prev.threads],
        activeThreadId: nextThread.id,
      };
    });
  }, []);

  const deleteThread = useCallback((id: string) => {
    setState((prev) => {
      const filtered = prev.threads.filter((thread) => thread.id !== id);

      if (filtered.length === 0) {
        const fallback = createThread();
        return {
          threads: [fallback],
          activeThreadId: fallback.id,
        };
      }

      return {
        threads: filtered,
        activeThreadId: prev.activeThreadId === id ? filtered[0].id : prev.activeThreadId,
      };
    });
  }, []);

  const clearThread = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      threads: prev.threads.map((thread) =>
        thread.id === id
          ? {
              ...thread,
              title: "New conversation",
              messages: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }
          : thread,
      ),
    }));
  }, []);

  const updateThread = useCallback((id: string, updater: (thread: ChatThread) => ChatThread) => {
    setState((prev) => {
      if (!prev.threads.some((thread) => thread.id === id)) {
        return prev;
      }

      const updatedThreads = prev.threads
        .map((thread) => (thread.id === id ? updater(thread) : thread))
        .sort((a, b) => b.updatedAt - a.updatedAt);

      return {
        ...prev,
        threads: updatedThreads,
        activeThreadId: prev.activeThreadId,
      };
    });
  }, []);

  const activeThread = useMemo(() => {
    const found = threads.find((thread) => thread.id === activeThreadId);
    return found ?? threads[0];
  }, [threads, activeThreadId]);

  return {
    threads,
    activeThread,
    activeThreadId,
    actions: {
      setActiveThread,
      createNewThread,
      deleteThread,
      clearThread,
      updateThread,
    },
  };
};

