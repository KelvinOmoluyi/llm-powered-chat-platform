import { motion } from "framer-motion";
import { BsFillSendFill } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";
import { easeOutExpo } from "../../../shared/animation/easings";

export type ChatComposerProps = {
  inputValue: string;
  setInputValue: (value: string) => void;
  loading: boolean;
  disableSend: boolean;
  ask: (prompt?: string) => void;
  stop: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

const ChatComposer = ({
  inputValue,
  setInputValue,
  loading,
  disableSend,
  ask,
  stop,
  inputRef,
}: ChatComposerProps) => (
  <motion.div
    key="composer"
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 12 }}
    transition={{ duration: 0.35, ease: easeOutExpo }}
    className="input-board w-full max-w-3xl sm:max-w-4xl rounded-2xl sm:rounded-3xl"
  >
    <div className="flex flex-col gap-6">
      <div className="flex gap-4 items-center sm:gap-6">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          placeholder="Ask chatbot..."
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask();
            }
          }}
          aria-label="Message the assistant"
          className="w-full text-xs"
          disabled={loading}
        />

        <div className="flex items-center gap-3">
          {loading ? (
            <button
              type="button"
              onClick={stop}
              className="flex items-center gap-2 rounded-full border border-[#f8e709] px-4 py-2 text-xs uppercase tracking-wide text-[#f8e709] transition-colors duration-200 hover:bg-[#f8e709]/10"
            >
              <CgSpinner className="animate-spin" />
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={() => ask()}
              disabled={disableSend}
              className="flex size-10 items-center justify-center rounded-full bg-[#c59626] shadow-[0_0_18px_#c59626] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
              style={{ order: 2 }}
            >
              <BsFillSendFill color="#fafafc" />
            </button>
          )}
        </div>
      </div>


    </div>
  </motion.div>
);

export default ChatComposer;

