import type { IconType } from "react-icons";

export type suggestedPrompt = {
    id: number,
    head: string,
    text: string,
    Icon: IconType,
}

export type ChatMessage = {
    id: string,
    role: "user" | "model",
    text: string,
    createdAt: number,
}

export type ChatThread = {
    id: string,
    title: string,
    createdAt: number,
    updatedAt: number,
    messages: ChatMessage[],
}
