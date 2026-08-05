import { createContext } from "react";
import type { NoteContextType } from "./types";

const NoteContext = createContext<NoteContextType | null>(
    null
);

export default NoteContext;