import ChatExperience from "./features/chat/components/ChatExperience";
import ThreadSidebar from "./features/threads/components/ThreadSidebar";
import { useThreadsManager } from "./features/threads/hooks/useThreadsManager";
import { useSidebarState } from "./features/threads/hooks/useSidebarState";
import { useUsername } from "./features/user/hooks/useUsername";
import UserOnboardingModal from "./features/user/components/UserOnboardingModal";
import { useScrollLock } from "./shared/hooks/useScrollLock";

const App = () => {
  const { threads, activeThread, actions } = useThreadsManager();
  const { username, hasUsername, isReady, setUsername } = useUsername();
  const {
    isDesktop,
    isOpen,
    isCollapsed,
    openSidebar,
    closeSidebar,
    toggleCollapse,
  } = useSidebarState();

  useScrollLock(!isDesktop && isOpen);

  if (!activeThread) {
    return null;
  }

  const navClassName = isDesktop
    ? `sidebar relative z-[6] flex h-full w-[260px] flex-col transition-[width] duration-300 `
    : `sidebar fixed inset-y-0 left-0 z-[60] flex h-full max-w-sm flex-col transform bg-[#0f0e0b]/95 shadow-[0_25px_80px_rgba(0,0,0,0.65)] transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`;

  return (
    <div className="base flex min-h-screen w-full flex-col overflow-hidden lg:h-screen lg:flex-row">
      {!isDesktop && isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          className="fixed inset-0 z-[50] bg-black/50"
        />
      )}

      {!isDesktop && !isOpen && (
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={openSidebar}
          className="fixed top-4 right-4 z-[60] rounded-full bg-[#1d1d1d] p-3 shadow-lg shadow-black/50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-[#f8e709]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      <nav className={navClassName}>
        <ThreadSidebar
          threads={threads}
          activeThreadId={activeThread.id}
          username={username}
          isOpen={isOpen}
          isCollapsed={isCollapsed}
          isDesktop={isDesktop}
          onSelectThread={actions.setActiveThread}
          onCreateThread={actions.createNewThread}
          onClearThread={actions.clearThread}
          onDeleteThread={actions.deleteThread}
          onToggleCollapse={toggleCollapse}
          onCloseMobile={closeSidebar}
        />
      </nav>

      <main className="relative z-[4] flex h-full w-full flex-1">
        <ChatExperience
          thread={activeThread}
          username={username}
          isDesktopSidebar={isDesktop}
          onOpenSidebar={openSidebar}
          clearThread={actions.clearThread}
          updateThread={actions.updateThread}
        />
      </main>

      <UserOnboardingModal
        isOpen={isReady && !hasUsername}
        onSubmit={setUsername}
      />
    </div>
  );
};

export default App;
