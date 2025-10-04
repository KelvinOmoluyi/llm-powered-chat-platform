import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "../../../types";

export type ChatMessageListProps = {
  messages: ChatMessage[];
  messageVariants: Variants;
  loading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

const ChatMessageList = ({ messages, messageVariants, loading, messagesEndRef }: ChatMessageListProps) => (
  <div className="chat-scroll flex-1 overflow-y-auto px-1 sm:px-3 scrollbar-hide">
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-4 ">
      <AnimatePresence initial={false}>
        {messages.map((message) => {
          const isModel = message.role === "model";
          const isTyping = isModel && message.text === "" && loading;
          return (
            <motion.div
              layout
              key={message.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`flex w-full ${isModel ? "justify-start text-left" : "justify-end text-right"}`}
            >
              <motion.div
                layout
                className={`inline-block rounded-xl px-3 py-2 ${
                  isModel ? "bg-[#000000]/90" : "bg-[#242424]"
                }`}
                title={new Date(message.createdAt).toLocaleString()}
              >
                <h5 className="text-sm">
                  {isTyping ? (
                    <div className="typing-indicator">
                      <span />
                      <span />
                      <span />
                    </div>
                  ) : (
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  )}
                </h5>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div ref={messagesEndRef} />
    </div>
  </div>
);

export default ChatMessageList;
