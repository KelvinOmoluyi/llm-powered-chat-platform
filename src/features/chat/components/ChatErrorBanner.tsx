import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { FiAlertTriangle } from "react-icons/fi";

export type ChatErrorBannerProps = {
  error: string;
  pendingQuestion: string | null;
  errorVariants: Variants;
  onRetry: () => void;
};

const ChatErrorBanner = ({ error, pendingQuestion, errorVariants, onRetry }: ChatErrorBannerProps) => (
  <motion.div
    variants={errorVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="error-banner"
    role="alert"
  >
    <FiAlertTriangle className="size-5" aria-hidden />
    <div className="flex flex-1 flex-col gap-1">
      <span>{error}</span>
      {pendingQuestion && (
        <button
          type="button"
          onClick={onRetry}
          className="w-fit text-xs font-semibold uppercase tracking-wide text-[#f8e709] underline"
        >
          Retry last question
        </button>
      )}
    </div>
  </motion.div>
);

export default ChatErrorBanner;
