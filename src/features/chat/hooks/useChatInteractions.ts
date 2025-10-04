import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatThread } from "../../../types";
import { createId } from "../../../shared/utils/ids";

const createMessage = (role: ChatMessage["role"], text: string): ChatMessage => ({
  id: createId(),
  role,
  text,
  createdAt: Date.now(),
});

const makeTitle = (input: string) => {
  const trimmed = input.replace(/\s+/g, " ").trim();
  if (!trimmed) return "New conversation";
  return trimmed.length <= 48 ? trimmed : `${trimmed.slice(0, 45)}.`;
};

type UseChatInteractionsArgs = {
  thread: ChatThread;
  updateThread: (id: string, updater: (thread: ChatThread) => ChatThread) => void;
  clearThread: (id: string) => void;
};

type AskFn = (prompt?: string) => Promise<void> | void;

type UseChatInteractionsReturn = {
  inputValue: string;
  setInputValue: (value: string) => void;
  loading: boolean;
  error: string;
  chatHistory: ChatMessage[];
  hasConversation: boolean;
  ask: AskFn;
  stop: () => void;
  retry: () => void;
  insertPrompt: (prompt: string) => void;
  clearConversation: () => void;
  disableSend: boolean;
  pendingQuestion: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  setError: (value: string) => void;
};

type SSEPayload = {
  delta?: string;
  done?: boolean;
  text?: string;
  error?: string;
};

const resolveApiUrl = () => {
  const configured = import.meta.env.VITE_GEMINI_API_URL;
  if (typeof configured === "string" && configured.trim().length > 0) {
    const trimmed = configured.trim();
    return trimmed.endsWith("/gemini") ? trimmed : `${trimmed.replace(/\/+$/, "")}/gemini`;
  }
  return "https://ai-power-chat-platform-backend.onrender.com/gemini";
};

export const useChatInteractions = ({
  thread,
  updateThread,
  clearThread,
}: UseChatInteractionsArgs): UseChatInteractionsReturn => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const pendingQuestionRef = useRef<string | null>(null);

  const chatHistory = thread.messages;
  const hasConversation = chatHistory.length > 0;

  useEffect(() => {
    setInputValue("");
    setError("");
    setLoading(false);
    pendingQuestionRef.current = null;
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, [thread.id]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const insertPrompt = useCallback((prompt: string) => {
    setInputValue(prompt);
    setError("");
    inputRef.current?.focus();
  }, []);

  const stop = useCallback(() => {
    if (!controllerRef.current) return;
    controllerRef.current.abort();
    controllerRef.current = null;
    setLoading(false);
    setError("Generation stopped.");
  }, []);

  const retry = useCallback(() => {
    if (!pendingQuestionRef.current) return;
    setInputValue(pendingQuestionRef.current);
    setError("");
    inputRef.current?.focus();
  }, []);

  const clearConversation = useCallback(() => {
    clearThread(thread.id);
    setInputValue("");
    setError("");
    pendingQuestionRef.current = null;
  }, [clearThread, thread.id]);

  const ask: AskFn = useCallback(
    async (prompt) => {
      if (loading) return;

      const question = (prompt ?? inputValue).trim();
      if (!question) {
        setError("Please enter a prompt to continue.");
        return;
      }

      const targetThreadId = thread.id;

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      const userMessage = createMessage("user", question);
      const assistantMessage = createMessage("model", "");
      const payloadHistory = [...thread.messages, userMessage].map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      const apiUrl = resolveApiUrl();

      setLoading(true);
      setError("");
      setInputValue("");
      pendingQuestionRef.current = question;

      updateThread(targetThreadId, (current) => {
        const nextMessages = [...current.messages, userMessage, assistantMessage];
        const nextTitle =
          current.messages.length === 0 || !current.title || current.title === "New conversation"
            ? makeTitle(question)
            : current.title;

        return {
          ...current,
          title: nextTitle,
          messages: nextMessages,
          updatedAt: Date.now(),
        };
      });

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ history: payloadHistory, message: question }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          const message = errorText.trim() || `Request failed with status ${response.status}`;
          throw new Error(message);
        }

        if (!response.body) {
          throw new Error("The server response was empty.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";
        let assistantText = "";
        let receivedContent = false;

        const updateAssistantMessage = (text: string) => {
          updateThread(targetThreadId, (current) => ({
            ...current,
            messages: current.messages.map((message) =>
              message.id === assistantMessage.id ? { ...message, text } : message,
            ),
            updatedAt: Date.now(),
          }));
        };

        const removeAssistantMessage = () => {
          updateThread(targetThreadId, (current) => ({
            ...current,
            messages: current.messages.filter((message) => message.id !== assistantMessage.id),
            updatedAt: Date.now(),
          }));
        };

        while (true) {
          const { value: chunk, done } = await reader.read();

          if (chunk) {
            buffer += decoder.decode(chunk, { stream: !done });
          } else if (done) {
            buffer += decoder.decode(new Uint8Array(), { stream: false });
          }

          let boundary = buffer.indexOf("\n\n");

          while (boundary !== -1) {
            const rawEvent = buffer.slice(0, boundary).trim();
            buffer = buffer.slice(boundary + 2);
            boundary = buffer.indexOf("\n\n");

            if (!rawEvent.startsWith("data:")) {
              continue;
            }

            const dataString = rawEvent.slice(5).trim();
            if (!dataString || dataString === "[DONE]") {
              continue;
            }

            let payload: SSEPayload;
            try {
              payload = JSON.parse(dataString) as SSEPayload;
            } catch (parseError) {
              console.error("Unable to parse SSE payload", parseError, dataString);
              continue;
            }

            if (payload.error) {
              throw new Error(payload.error);
            }

            if (typeof payload.delta === "string" && payload.delta.length > 0) {
              assistantText += payload.delta;
              receivedContent = true;
              updateAssistantMessage(assistantText);
            }

            if (payload.done && typeof payload.text === "string") {
              assistantText = payload.text;
              receivedContent = receivedContent || payload.text.trim().length > 0;
              updateAssistantMessage(assistantText);
            }
          }

          if (done) {
            break;
          }
        }

        if (!receivedContent || !assistantText.trim()) {
          removeAssistantMessage();
          setError("No response received. Please try again.");
          setInputValue(question);
          pendingQuestionRef.current = question;
          return;
        }

        pendingQuestionRef.current = null;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          updateThread(targetThreadId, (current) => ({
            ...current,
            messages: current.messages.filter((message) => message.id !== assistantMessage.id),
            updatedAt: Date.now(),
          }));
          return;
        }

        console.error(err);
        const rawMessage = (err as Error)?.message?.trim();
        const isHtml = rawMessage?.startsWith("<");
        setError(!rawMessage || isHtml ? "Something went wrong. Please try again." : rawMessage);
        setInputValue(question);

        updateThread(targetThreadId, (current) => {
          const filteredMessages = current.messages.filter(
            (message) => message.id !== userMessage.id && message.id !== assistantMessage.id,
          );

          return {
            ...current,
            messages: filteredMessages,
            updatedAt: Date.now(),
            title: filteredMessages.length === 0 ? "New conversation" : current.title,
          };
        });
      } finally {
        controllerRef.current = null;
        setLoading(false);
      }
    },
    [inputValue, loading, thread.id, thread.messages, updateThread],
  );

  const disableSend = loading || !inputValue.trim();

  return {
    inputValue,
    setInputValue,
    loading,
    error,
    chatHistory,
    hasConversation,
    ask,
    stop,
    retry,
    insertPrompt,
    clearConversation,
    disableSend,
    pendingQuestion: pendingQuestionRef.current,
    inputRef,
    messagesEndRef,
    setError,
  };
};

