// App.tsx
import { useRef, useState } from "react";
import type { suggestedPrompt } from "../../types";
import icon from "../../public/images/orb.png"
import { TbTruckDelivery } from "../assests";
import { HiMiniSquare3Stack3D } from "../assests";
import { BiSolidBusiness } from 'react-icons/bi';
import openAILogo from "../../public/images/openAI-logo.png"
import { AiOutlineLink } from 'react-icons/ai';
import { BsFillSendFill } from 'react-icons/bs';

type ChatTurn = { role: "user" | "model"; text: string; parts: { text: string }[] };

export default function Chat() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const suggestedPrompts: suggestedPrompt[] = [
    {
      id: 1,
      head: "Delivery",
      text: "we will find suppliers with the best prices",
      Icon: TbTruckDelivery
    },
    {
      id: 2,
      head: "Suppliers",
      text: "we will find suppliers with the best prices",
      Icon: HiMiniSquare3Stack3D
    },
    {
      id: 3,
      head: "Search",
      text: "we will find suppliers with the best prices",
      Icon: BiSolidBusiness
    },
  ]

  async function ask() {
    if (!value.trim()) {
      setError("Please ask a question.");
      return;
    }
    setError("");
    setLoading(true);
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    // Prepare history in Gemini’s expected shape
    const historyForAPI = chatHistory.map((t) => ({
      role: t.role,
      parts: [{ text: t.text }],
    }));

    // Optimistic add of the user turn + a placeholder assistant turn
    setChatHistory((prev) => [
      ...prev,
      { role: "user", text: value, parts: [{ text: value }] },
      { role: "model", text: "", parts: [{ text: "" }] },
    ]);
    setValue("");

    try {
      const res = await fetch("http://localhost:8000/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: historyForAPI, message: value }),
        signal: controllerRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Network error");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let assistant = "";
      // Stream SSE lines
      while (true) {
        const { value: chunk, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(chunk, { stream: true });

        for (const line of text.split("\n\n")) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = JSON.parse(trimmed.slice(5).trim());

          if (payload.delta) {
            assistant += payload.delta;
            // Update just the last assistant message
            setChatHistory((prev) => {
              const copy = [...prev];
              const lastIdx = copy.length - 1;
              copy[lastIdx] = {
                role: "model",
                text: assistant,
                parts: [{ text: assistant }],
              };
              return copy;
            });
          }
          if (payload.error) {
            setError(payload.error);
          }
        }
      }
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center flex-col">
      <div className="h-full w-full flex flex-col gap-4 pt-30 pb-50 px-10 overflow-y-scroll">
        <div className="w-[800px] h-fit bg-black rounded-4xl input-board fixed bottom-10 left-[calc(50vw-300px)]">
          <input
            type="text"
            value={value}
            placeholder="Talk about your capabilities..."
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && ask()}
            className="w-full"
          />
          <div className="flex justify-between items-center mt-9">
            <div className="flex  gap-1 items-center">
              <img src={openAILogo} className="size-8 bg-[#1b1600] rounded-full"/>
              <AiOutlineLink color="#c7c72a" className="size-8 bg-[#1b1600] rounded-full mr-2 p-1 border-1 border-[#c7c72a]"/>
              <h4>Open AI</h4> 
            </div>


            {!error ? (
              <button
              className="size-8 bg-[#c59626] rounded-full flex items-center justify-center shadow-[0_0_10px_#c59626]" onClick={ask} disabled={loading}>
                <BsFillSendFill color="#fafafc" />
              </button>
            ) : (
              <button className="size-8 bg-[#1b1600] rounded-full mr-2 p-1 border-1 border-[#c7c72a] flex items-center justify-center">
                <BsFillSendFill color="#777" />
              </button>
            )}
          </div>
        </div>   

        <div className="h-fit w-full flex flex-col gap-4">
          {chatHistory.map((m, i) => 
            m.role === "model" ? (        
              <div key={i} className="w-full h-fit flex justify-start">
                <div className="w-[400px] p-5 bg-[#000000] rounded-[20px]">
                  <h5>{m.text}</h5>
                </div>
              </div>
            ) : (
              <div key={i} className="w-full h-fit flex justify-end">
                <div className="w-[400px] p-5 bg-[#242424] rounded-[20px]">
                  <h5>{m.text}</h5>
                </div>
              </div>
            )
          )}
      </div>
      </div>
    </div>
  );
}
