import { useState, useEffect } from "react";
import { Note } from "@/context/types";
import { useNotes } from "@/context/useNotes";
import { Button } from "../ui/button";
import { getWordCountDetails } from "@/lib/helper";

interface EditNoteModalProps {
    note: Note | null;
    isOpen: boolean;
    onClose: () => void;
    showAlert: (
        msg: string,
        type: "success" | "danger" | "warning" | "info"
    ) => void;
}

export default function EditNoteModal({
    note,
    isOpen,
    onClose,
    showAlert
}: EditNoteModalProps) {
    const { editNote } = useNotes();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tag, setTag] = useState("");
    const [loading, setLoading] = useState(false);
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    const [prevNoteId, setPrevNoteId] = useState(note?._id);

    if (isOpen !== prevIsOpen || note?._id !== prevNoteId) {
        setPrevIsOpen(isOpen);
        setPrevNoteId(note?._id);

        if (isOpen && note) {
            setTitle(note.title || "");
            setDescription(note.description || "");
            setTag(note.tag || "");
        }
    }

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen || !note) return null;

    const hasChanges =
        title.trim() !== (note.title || "") ||
        description.trim() !== (note.description || "") ||
        tag.trim().toLowerCase() !== (note.tag || "").toLowerCase();

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasChanges) return;

        setLoading(true);
        try {
            await editNote(note._id, title.trim(), description.trim(), tag.trim());
            showAlert("Note updated successfully", "success");
            onClose();

        } catch (error) {
            console.error("Failed to update note:", error);
            showAlert("Failed to update note", "danger");

        } finally {
            setLoading(false);
        }
    };

    const { wordCount, formattedCount } = getWordCountDetails(description);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 sm:p-6 md:p-8">
            <div className="flex max-h-[90vh] w-full lg:max-w-2xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">

                <form onSubmit={handleModalSubmit} className="flex h-full flex-col">
                    <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">

                        <div className="flex flex-col gap-6">
                            <input
                                type="text"
                                placeholder="Note title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border-b bg-transparent px-0 text-3xl font-bold tracking-tight text-zinc-900 outline-none placeholder:text-zinc-300 focus:ring-0"
                                maxLength={150}
                            />

                            <div className="flex items-center gap-2">
                                <span className="select-none text-lg font-medium text-zinc-400">#</span>
                                <input
                                    type="text"
                                    placeholder="Tag (e.g. work, idea, urgent) - optional"
                                    value={tag}
                                    onChange={(e) => setTag(e.target.value)}
                                    className="w-full border-b bg-transparent px-0 text-sm font-medium text-zinc-600 outline-none placeholder:text-zinc-400 focus:ring-0"
                                    maxLength={30}
                                />
                            </div>

                            <textarea
                                placeholder="Start writing your thoughts here..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[40vh] w-full resize-none border-none bg-transparent px-0 text-base font-medium leading-loose text-zinc-700 outline-none placeholder:text-zinc-400 focus:ring-0"
                                maxLength={30000}
                            />
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-5 py-5 sm:px-10">
                        <div className="flex gap-1 text-xs font-medium text-black tracking-wide uppercase">
                            {formattedCount}
                            <span className="hidden sm:flex">
                                {wordCount === 1 ? 'word' : 'words'}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="cursor-pointer rounded-full px-6 py-2.5 text-sm font-medium text-zinc-600 transition disabled:opacity-50"
                                disabled={loading}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                className="cursor-pointer rounded-full px-6 py-2.5 text-sm font-medium text-white shadow-sm transition bg-zinc-900 hover:bg-zinc-800 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={loading || !hasChanges || !title.trim() || !description.trim()}
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}