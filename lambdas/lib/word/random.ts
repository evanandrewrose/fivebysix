import { words } from "fivebysix-words";

export const randomWord = () => words[Math.floor(Math.random() * words.length)];
