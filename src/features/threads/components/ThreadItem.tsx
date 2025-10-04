import type { ChatThread } from "../../../types";

type ThreadItemProps = {
  thread: ChatThread;
  isActive: boolean;
  onSelect: () => void;
};

const formatRelativeTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";
  if (diff < hour) {
    const value = Math.max(1, Math.round(diff / minute));
    return `${value} min ago`;
  }
  if (diff < day) {
    const value = Math.max(1, Math.round(diff / hour));
    return `${value} hr${value > 1 ? "s" : ""} ago`;
  }
  if (diff < 7 * day) {
    const value = Math.max(1, Math.round(diff / day));
    return `${value} day${value > 1 ? "s" : ""} ago`;
  }

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

function ThreadItem({ thread, isActive, onSelect }: ThreadItemProps) {
  const lastMessage = thread.messages.at(-1);
  const preview = lastMessage?.text ?? "Start a new conversation";
  const title = thread.title.trim() || "New conversation";
  const badge = formatRelativeTime(thread.updatedAt);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={`flex w-full flex-col gap-2 rounded-2xl border border-transparent bg-[#22211c] px-4 py-2 text-left transition-all duration-200 hover:border-[#f8e709] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8e709]/60 overflow-hidden ${
        isActive ? "border-[#f8e709]" : ""
      }`}
    >
      <h5 className="text-xs sm:text-sm font-semibold text-[#f8e709] truncate">{title}</h5>
      <div className="flex justify-between items-center gap-2">
        <p className="line-clamp-1 text-[10px] text-[#acacac] truncate flex-1">{preview}</p>
        <span className="text-[10px] text-[#8b8b8b] shrink-0">{badge}</span>
      </div>
    </button>
  );
}

export default ThreadItem;
