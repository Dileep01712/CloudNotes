import { useEffect, useRef, useState } from "react";
import { Button } from '../ui/button';
import { useNotes } from "@/context/useNotes";
import { getWordCountDetails } from "@/lib/helper";

export interface NoteData {
    title: string;
    description: string;
    tag: string;
}

interface NoteComposerProps {
    path: string;
    mode: "note" | "folder";
    showAlert: (
        msg: string,
        type: "success" | "danger" | "warning" | "info",
    ) => void;
}

export default function NoteComposer({
    path,
    mode,
    showAlert,
}: NoteComposerProps) {
    const { addNote } = useNotes();
    const [loading, setLoading] = useState<boolean>(false);
    const [note, setNote] = useState({
        title: "",
        description: "",
        tag: "",
    });
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (mode !== "note") return;
        const textarea = textareaRef.current;

        if (textarea) {
            const scrollY = window.scrollY;

            textarea.style.height = "auto";

            const MAX_HEIGHT = 400;
            const currentScrollHeight = textarea.scrollHeight;

            if (!note.description || note.description.trim() === "") {
                textarea.style.height = "";
                textarea.style.overflowY = "hidden";
            } else if (currentScrollHeight >= MAX_HEIGHT) {
                textarea.style.height = `${MAX_HEIGHT}px`;
                textarea.style.overflowY = "auto";
            } else {
                textarea.style.height = `${currentScrollHeight}px`;
                textarea.style.overflowY = "hidden";
            }

            window.scrollTo(0, scrollY);
        }
    }, [note.description, mode]);

    const handleNoteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!note.description.trim()) return;

        setLoading(true);

        try {
            await addNote(
                note.description,
                note.title,
                note.tag,
                path,
            );

            setNote({
                title: "",
                description: "",
                tag: ""
            });

            showAlert("Note created successfully", "success");

        } catch (error) {
            console.error("Failed to save notes: ", error);
            showAlert("Failed to save notes", "danger");

        } finally {
            setLoading(false);
        }
    };

    const {wordCount, formattedCount} = getWordCountDetails(note.description);

    return (
        <section className="w-full flex flex-col flex-1 min-h-64">
            <form onSubmit={handleNoteSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Note title"
                    maxLength={150}
                    value={note.title}
                    onChange={(e) =>
                        setNote({
                            ...note,
                            title: e.target.value,
                        })
                    }
                    className="w-full text-2xl font-bold tracking-tight border-b text-black outline-none placeholder:text-zinc-300 placeholder:select-none"
                />

                <input
                    type="text"
                    placeholder="Tag (e.g. work, idea, urgent) - optional"
                    maxLength={30}
                    value={note.tag}
                    onChange={(e) => setNote({ ...note, tag: e.target.value })}
                    className="md:w-75 text-base font-medium border-b text-black outline-none placeholder:text-zinc-300 placeholder:select-none"
                />

                <textarea
                    ref={textareaRef}
                    placeholder="Start writing your thoughts here..."
                    value={note.description}
                    maxLength={30000}
                    onChange={(e) =>
                        setNote({
                            ...note,
                            description: e.target.value,
                        })
                    }
                    className="min-h-32 w-full resize-none text-base leading-relaxed font-medium text-black outline-none placeholder:text-zinc-300 placeholder:select-none"
                />

                <div className="mt-2 flex items-center justify-between select-none">
                    <div className="text-xs font-medium text-black tracking-wide uppercase">
                        {formattedCount} {wordCount === 1 ? 'word' : 'words'}
                    </div>

                    <Button
                        type="submit"
                        variant="default"
                        disabled={
                            !note.description.trim() ||
                            loading
                        }
                        className="px-5 rounded-full font-medium transition-all duration-200 cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : "Create Note"}
                    </Button>
                </div>
            </form>
        </section>
    );
}