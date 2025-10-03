import { useEffect, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { ChatThread } from "../../../types";
import { easeOutExpo } from "../../../shared/animation/easings";
import ChatHeader from "./ChatHeader";
import ChatHero from "./ChatHero";
import ChatMessageList from "./ChatMessageList";
import ChatComposer from "./ChatComposer";
import { useChatInteractions } from "../hooks/useChatInteractions";
import { suggestedPrompts } from "../constants/prompts";

export type ChatExperienceProps = {
  thread: ChatThread;
  username: string;
  isDesktopSidebar: boolean;
  onOpenSidebar: () => void;
  clearThread: (id: string) => void;
  updateThread: (
    id: string,
    updater: (thread: ChatThread) => ChatThread
  ) => void;
};

const ChatExperience = ({
  thread,
  username,
  clearThread,
  updateThread,
}: ChatExperienceProps) => {
  const shouldReduceMotion = useReducedMotion();

  const {
    inputValue,
    setInputValue,
    loading,
    error,
    chatHistory,
    hasConversation,
    ask,
    stop,
    insertPrompt,
    clearConversation,
    disableSend,
    inputRef,
    messagesEndRef,
  } = useChatInteractions({ thread, updateThread, clearThread });

  useEffect(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }, [chatHistory.length, loading, messagesEndRef, shouldReduceMotion]);

  const panelVariants = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
      visible: {
        opacity: 1,
        y: 0,
        transition: shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.45, ease: easeOutExpo },
      },
      exit: {
        opacity: 0,
        y: shouldReduceMotion ? 0 : -16,
        transition: shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.35, ease: easeOutExpo },
      },
    }),
    [shouldReduceMotion]
  );

  const messageVariants = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
      visible: {
        opacity: 1,
        y: 0,
        transition: shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.4, ease: easeOutExpo },
      },
      exit: {
        opacity: 0,
        y: shouldReduceMotion ? 0 : -14,
        transition: shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.3, ease: easeOutExpo },
      },
    }),
    [shouldReduceMotion]
  );

  const errorVariants = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 6 },
      visible: {
        opacity: 1,
        y: 0,
        transition: shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.25, ease: easeOutExpo },
      },
      exit: {
        opacity: 0,
        y: shouldReduceMotion ? 0 : -6,
        transition: shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.2, ease: easeOutExpo },
      },
    }),
    [shouldReduceMotion]
  );

  return (
    <>
      <AnimatePresence>
        {error && (
          <motion.div
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-red-500 text-white px-4 py-2 rounded shadow-lg max-w-xs text-center mx-auto "
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="chat-root">
        <div className="chat-shell">
          <AnimatePresence mode="wait">
            {hasConversation ? (
              <motion.section
                key={`conversation-${thread.id}`}
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex h-full w-full flex-1 flex-col"
              >
                <ChatHeader
                  onClear={clearConversation}
                  disableClear={loading || !chatHistory.length}
                />
                <ChatMessageList
                  messages={chatHistory}
                  messageVariants={messageVariants}
                  loading={loading}
                  messagesEndRef={messagesEndRef}
                />
              </motion.section>
            ) : (
              <ChatHero
                username={username}
                prompts={suggestedPrompts}
                insertPrompt={insertPrompt}
                shouldReduceMotion={Boolean(shouldReduceMotion)}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="composer-wrapper">
          <ChatComposer
            inputValue={inputValue}
            setInputValue={setInputValue}
            loading={loading}
            disableSend={disableSend}
            ask={ask}
            stop={stop}
            inputRef={inputRef}
          />
        </div>
      </div>
    </>
  );
};

export default ChatExperience;
