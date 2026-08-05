import { useContext } from "react";
import NoteContext from "./NoteContext";

export function useNotes() {
    const context = useContext(NoteContext);

    if (!context) {
        throw new Error(
            "useNotes must be used inside NoteState"
        );
    }

    return context;
}