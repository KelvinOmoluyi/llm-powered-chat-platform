import { HiMiniSquare3Stack3D } from "react-icons/hi2";
import { TbTruckDelivery } from "react-icons/tb";
import type { suggestedPrompt } from "../../../types";

export const suggestedPrompts: suggestedPrompt[] = [
  {
    id: 1,
    head: "Delivery",
    text: "Find suppliers with the fastest delivery times.",
    Icon: TbTruckDelivery,
  },
  {
    id: 2,
    head: "Suppliers",
    text: "Compare pricing across verified suppliers in seconds.",
    Icon: HiMiniSquare3Stack3D,
  },
];
