export type ChatHeaderProps = {
  onClear: () => void;
  disableClear: boolean;
};

const ChatHeader = ({ onClear, disableClear }: ChatHeaderProps) => (
  <div className="conversation-header flex items-end justify-end gap-4 px-1 pb-6 sm:px-3 max-w-4xl w-full mx-auto">
    <button
      type="button"
      onClick={onClear}
      disabled={disableClear}
      className="rounded-full border border-[#3f3f3f] px-4 py-2 text-xs uppercase tracking-wide text-[#c9c9c9] transition-colors duration-200 hover:border-[#f8e709] hover:text-[#f8e709] disabled:cursor-not-allowed disabled:opacity-40"
    >
      Clear
    </button>
  </div>
);

export default ChatHeader;
