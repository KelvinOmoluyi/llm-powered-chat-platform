import type { FormEvent } from "react";
import { useState } from "react";
import Modal from "../../../shared/components/Modal";

export type UserOnboardingModalProps = {
  isOpen: boolean;
  onSubmit: (username: string) => void;
};

const UserOnboardingModal = ({ isOpen, onSubmit }: UserOnboardingModalProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleaned = value.replace(/\s+/g, " ").trim();
    if (!cleaned) return;
    onSubmit(cleaned);
    setValue("");
  };

  return (
    <Modal isOpen={isOpen} disableBackdropClose className="relative z-[1001] w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#3a320f] bg-[#070603]/95 p-6 sm:p-8 shadow-[0_25px_75px_rgba(7,6,3,0.65)]"
      >
        <div className="mb-6 flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-semibold text-[#f8e709]" id="onboarding-title">
            Welcome!
          </h2>
          <p className="text-sm text-[#d0d0d0]">
            Let&apos;s personalise your space. Enter your name to start chatting.
          </p>
        </div>

        <label htmlFor="username" className="mb-3 block text-left text-sm font-medium text-[#f5f5f5]">
          Display name
        </label>
        <input
          id="username"
          name="username"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. Alex"
          className="w-full rounded-xl border border-[#3f3f3f] bg-[#141410] px-4 py-4 text-sm text-[#f5f5f5] outline-none focus:border-[#f8e709]"
          autoFocus
        />

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-[#c59626] py-3 text-sm font-semibold uppercase tracking-wide text-[#fafafc] transition-colors duration-200 hover:bg-[#d4a63d]"
        >
          Continue
        </button>
      </form>
    </Modal>
  );
};

export default UserOnboardingModal;
