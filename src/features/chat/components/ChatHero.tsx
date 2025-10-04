import { motion } from "framer-motion";
import type { suggestedPrompt } from "../../../types";
import { easeOutExpo } from "../../../shared/animation/easings";
import icon from "../../../../public/images/orb.png";

export type ChatHeroProps = {
  username: string;
  prompts: suggestedPrompt[];
  insertPrompt: (prompt: string) => void;
  shouldReduceMotion: boolean;
};

const ChatHero = ({ username, prompts, insertPrompt, shouldReduceMotion }: ChatHeroProps) => (
  <motion.section
    key="hero"
    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -16 }}
    transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: easeOutExpo }}
    className="hero-section flex h-full w-full flex-1 flex-col items-center"
  >
    <div className="hero-scroll flex w-full max-w-4xl flex-1 flex-col items-center px-4 py-10 sm:py-12">
      <motion.img
        src={icon}
        width={140}
        height={140}
        alt="App icon"
        className="mx-auto size-20 sm:size-30"
        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.6,
          ease: easeOutExpo,
        }}
      />

      <motion.div
        className="flex flex-col gap-3 text-center"
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: shouldReduceMotion ? 0 : 0.15,
          duration: shouldReduceMotion ? 0 : 0.5,
          ease: easeOutExpo,
        }}
      >
        <h1>
          <span className="text-gradient-01 text-2xl sm:text-4xl md:text-5xl">Welcome back {username || "there"}!</span>
        </h1>
        <p className="text-sm text-[#a9a9a9]">
          Ask anything about sourcing, pricing, or supplier intelligence.
        </p>
      </motion.div>

      <motion.div
        className="w-full max-w-4xl flex flex-wrap gap-3 mt-6"
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: shouldReduceMotion ? 0 : 0.3,
          duration: shouldReduceMotion ? 0 : 0.5,
          ease: easeOutExpo,
        }}
      >
        {prompts.map((prompt) => (
          <motion.div
            key={prompt.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center grow min-w-[200px] h-20 bg-[#000000] rounded-2xl p-4 gap-3 hover:cursor-pointer"
            onClick={() => insertPrompt(prompt.text)}
          >
            <prompt.Icon color="#f8e709ff" className="min-h-8 min-w-8 rounded-lg bg-[#1b1600] p-2" />
            <div className="flex flex-col gap-1">
              <h5 className="text-sm font-semibold text-[#f8e709]">{prompt.head}</h5>
              <h6 className="line-clamp-2 text-xs text-[#acacac]">{prompt.text}</h6>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </motion.section>
);

export default ChatHero;
