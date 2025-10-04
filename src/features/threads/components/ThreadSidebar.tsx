import { BiEdit } from "react-icons/bi";
import { FaXmark } from "react-icons/fa6";
import type { ChatThread } from "../../../types";
import ThreadItem from "./ThreadItem";

type ThreadSidebarProps = {
  threads: ChatThread[];
  activeThreadId: string;
  username: string;
  isOpen: boolean;
  isCollapsed: boolean;
  isDesktop: boolean;
  onSelectThread: (id: string) => void;
  onCreateThread: () => void;
  onClearThread: (id: string) => void;
  onDeleteThread: (id: string) => void;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

const ThreadSidebar = ({
  threads,
  activeThreadId,
  username,
  isCollapsed,
  onSelectThread,
  onClearThread,
  onDeleteThread,
}: ThreadSidebarProps) => {
  const canDelete = threads.length > 1;

  return (
    <aside
      className={`relative flex h-full w-full flex-col gap-6 p-6 transition-[transform,opacity] duration-300  ${
        isCollapsed ? "lg:px-4" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          <button
            type="button"
            onClick={() => onClearThread(activeThreadId)}
            className="flex size-9 items-center justify-center rounded-full border border-transparent bg-[#1d1d1d] transition-colors duration-200 hover:border-[#f8e709]"
            aria-label="Start a new conversation"
          >
            <BiEdit color="#f8e709" className="size-5" aria-hidden />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDeleteThread(activeThreadId)}
            disabled={!canDelete}
            className="flex size-9 items-center justify-center rounded-full border border-transparent bg-[#1d1d1d] transition-colors duration-200 hover:border-[#acacac] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Delete conversation"
          >
            <FaXmark color="#acacac" className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex flex-col gap-2 text-sm text-[#818181]">
          <p className="font-semibold uppercase tracking-wide text-[#c9c9c9]">
            Welcome, {username || "Guest"}
          </p>
          <span>
            {threads.length} {threads.length === 1 ? "thread" : "threads"}
          </span>
        </div>
      )}

      {!isCollapsed && (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto pe-2 scrollbar-hide">
          {threads.map((thread) => (
            <ThreadItem
              key={thread.id}
              thread={thread}
              isActive={thread.id === activeThreadId}
              onSelect={() => onSelectThread(thread.id)}
            />
          ))}
        </div>
      )}
    </aside>
  );
};

export default ThreadSidebar;
