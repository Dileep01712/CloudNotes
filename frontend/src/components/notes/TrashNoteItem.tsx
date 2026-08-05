import { Note } from "@/context/types";
import { useNotes } from "@/context/useNotes";
import { Button } from "../ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faRotate, faTrash } from "@fortawesome/free-solid-svg-icons";
import { getRemainingDays, getTrashedDate, useCurrentTime } from "@/lib/helper";

interface TrashNoteItemProps {
    note: Note;
    showAlert: (msg: string, type: "success" | "danger" | "warning" | "info") => void;
}

export default function TrashNoteItem({
    note,
    showAlert,
}: TrashNoteItemProps) {
    const { restoreNote, deleteNotePermanently } = useNotes();
    const now = useCurrentTime();
    const remainingDays = getRemainingDays(note.expireAt, now);
    const trashedDate = getTrashedDate(note);

    const handleRestoreNote = async () => {
        try {
            await restoreNote(note._id);
            showAlert('Note restored successfully', 'success');
        } catch (error) {
            console.error(error);
            showAlert('Failed to restore note', 'danger');
        }
    };

    const handleDeleteNotePermanently = async () => {
        try {
            await deleteNotePermanently(note._id);
            showAlert('Note deleted permanently', 'success');
        } catch (error) {
            console.error(error);
            showAlert('Failed to delete note', 'danger');
        }
    };

    return (
        <article className="group flex flex-col h-55 gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center min-h-6 gap-2">
                <h3 className="line-clamp-1 flex-1 text-base font-semibold text-zinc-900">
                    {note.title}
                </h3>

                {note.tag && (
                    <span
                        className="inline-flex max-w-22 items-center rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 select-none"
                        title={note.tag}
                    >
                        <span className="truncate min-w-0">
                            #{note.tag}
                        </span>
                    </span>
                )}

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 select-none">
                    {remainingDays} {remainingDays === 1 ? "day" : "days"}
                </span>
            </div>

            <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-500 min-h-23">
                {note.description}
            </p>

            <div className="flex items-center justify-between border-t border-zinc-100 pt-2">
                <p className="flex items-center gap-2 text-xs font-medium text-zinc-400 select-none">
                    <FontAwesomeIcon icon={faClock} className="text-zinc-400" />
                    Trashed: {trashedDate}
                </p>

                <div className="flex gap-1 lg:opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                        onClick={handleRestoreNote}
                        className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
                        variant="ghost"
                        title="Restore note"
                    >
                        <FontAwesomeIcon
                            icon={faRotate}
                        />
                    </Button>

                    <Button
                        onClick={handleDeleteNotePermanently}
                        className="rounded-md p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        variant="ghost"
                        title="Delete forever"
                    >
                        <FontAwesomeIcon
                            icon={faTrash}
                        />
                    </Button>
                </div>
            </div>
        </article>
    );
}