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
import ReactMarkdown from 'react-markdown'

type ChatTurn = { role: "user" | "model"; text: string; parts: { text: string }[] };

export default function Chat() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatMode, setChatMode] = useState(false);
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
      const res = await fetch("https://llm-powered-chat-platform.vercel.app/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: historyForAPI, message: value }),
        signal: controllerRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Network error");
      }
      if (res.body) setChatMode(true);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let assistant = "";
    let buffer = ""; // keep partial SSE lines here

    while (true) {
      const { value: chunk, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(chunk, { stream: true });

      // Process complete SSE events
      let boundary;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, boundary).trim();
        buffer = buffer.slice(boundary + 2);

        if (!rawEvent.startsWith("data:")) continue;

        try {
          const payload = JSON.parse(rawEvent.slice(5).trim());

          if (payload.delta) {
            assistant += payload.delta;
            setChatHistory(prev => {
              const copy = [...prev];
              const lastIdx = copy.length - 1;
              if (lastIdx >= 0) {
                copy[lastIdx] = {
                  role: "model",
                  text: assistant,
                  parts: [{ text: assistant }],
                };
              }
              return copy;
            });
          }

          if (payload.error) {
            setError(payload.error);
            // Optionally update assistant bubble with error message
            setChatHistory(prev => {
              const copy = [...prev];
              const lastIdx = copy.length - 1;
              if (lastIdx >= 0) {
                copy[lastIdx] = {
                  role: "model",
                  text: `(Error: ${payload.error})`,
                  parts: [{ text: `(Error: ${payload.error})` }],
                };
              }
              return copy;
            });
          }

          if (payload.done) {
            // If assistant never got tokens, put a fallback
            if (!assistant.trim()) {
              setChatHistory(prev => {
                const copy = [...prev];
                const lastIdx = copy.length - 1;
                if (lastIdx >= 0) {
                  copy[lastIdx] = {
                    role: "model",
                    text: "⚠️ I wasn’t able to provide an answer.",
                    parts: [{ text: "⚠️ I wasn’t able to provide an answer." }],
                  };
                }
                return copy;
              });
            }
            return; // exit streaming loop
          }
        } catch (err) {
          console.error("Failed to parse SSE event:", rawEvent, err);
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
      {chatMode ? (
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
                    <h5><ReactMarkdown>{m.text}</ReactMarkdown></h5>
                  </div>
                </div>
              ) : (
                <div key={i} className="w-full h-fit flex justify-end">
                  <div className="w-[400px] p-5 bg-[#242424] rounded-[20px]">
                    <h5><ReactMarkdown>{m.text}</ReactMarkdown></h5>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <>
          <img src={icon} width={200} height={200} alt="" />
          <div className="text-center">
            <h1><span className="text-gradient-01">Welcome back Alex!</span></h1>
            <p>Which house drawing do you want to analyze today?</p>
          </div>

          <div className="w-[800px] h-fit bg-black rounded-4xl input-board">
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
                <button className="size-8 bg-[#c59626] rounded-full flex items-center justify-center shadow-[0_0_10px_#c59626]" onClick={ask} disabled={loading}>
                  <BsFillSendFill color="#fafafc" />
                </button>
              ) : (
                <button className="size-8 bg-[#1b1600] rounded-full mr-2 p-1 border-1 border-[#c7c72a] flex items-center justify-center">
                  <BsFillSendFill color="#777" />
                </button>
              )}
            </div>
          </div>

          <div className="w-[800px] flex gap-2 mt-3">
            {suggestedPrompts.map((prompt) => (
              <div 
              key={prompt.id}
              className="flex items-center grow h-25 bg-[#000000] rounded-[50px] p-3 gap-2 hover:cursor-pointer">
                {/* <img src="" alt="" className="min-h-18 min-w-18 rounded-full bg-yellow-400" /> */}
                <prompt.Icon color="#f8e709ff" className="min-h-19 min-w-19 rounded-full bg-[#1b1600] p-3" />
                <div className="flex flex-col gap-1">
                  <h5>{prompt.head}</h5>
                  <h6 className="line-clamp-2">{prompt.text}</h6>
                </div>
              </div>
            ))}
          </div>
          {error && <p className="error">{error}</p>}
        </>
      )}
    </div>
  );
}
