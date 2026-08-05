import { useEffect, useRef } from "react";
import { useNotes } from "@/context/useNotes";
import TrashNoteItem from "../notes/TrashNoteItem";
import TrashFolderItem from "../folders/TrashFolderItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

interface TrashProps {
    showAlert: (
        msg: string,
        type: "success" | "danger" | "warning" | "info",
    ) => void;
}

export default function Trash({ showAlert }: TrashProps) {
    const { trashedNotes, getAllNotes, trashedFolders, getAllFolders } = useNotes();
    const showAlertRef = useRef(showAlert);
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        showAlertRef.current = showAlert;
    }, [showAlert]);

    useEffect(() => {
        if (hasFetchedRef.current) return;

        const fetchTrahsData = async () => {
            hasFetchedRef.current = true;

            try {
                await Promise.all([
                    getAllNotes(),
                    getAllFolders(),
                ]);
            } catch (error) {
                const errMsg = error instanceof Error ? error.message : '';
                if (!errMsg.includes('expired') && !errMsg.includes('Session')) {
                    showAlert('Failed to load trash data. Please try again.', 'danger');
                }
            }
        };

        fetchTrahsData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const displayTrashedNotes = trashedNotes.filter(note => {
        if (!note.parent) return true;
        const isParentTrashed = trashedFolders.some(f => f._id === note.parent);
        return !isParentTrashed;
    });

    return (
        <section className="mx-auto max-w-7xl py-16 min-h-102">
            <div className="mb-16 text-center select-none space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
                    Trash
                </h1>
                <p className="text-sm text-zinc-500 font-medium mx-auto">
                    Notes and Folders in the trash are permanently cleared automatically after 30 days.
                </p>
            </div>

            {trashedNotes.length === 0 && trashedFolders.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-100 rounded-[2rem] border border-dashed border-zinc-200 bg-white p-8 text-center shadow-sm">
                    <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 border border-zinc-100/50">
                        <FontAwesomeIcon icon={faTrash} className="text-2xl" />
                    </div>

                    <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">
                        Trash is empty
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400 font-medium leading-relaxed">
                        Deleted notes and folders will hold here safely before they are permanently removed.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-12">
                    {trashedFolders.length > 0 && (
                        <section>
                            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-0.2 select-none">
                                Folders
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                                {trashedFolders.map((folder) => (
                                    <TrashFolderItem
                                        key={folder._id}
                                        folder={folder}
                                        showAlert={showAlert}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {trashedNotes.length > 0 && (
                        <section>
                            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-0.2 select-none">
                                Notes
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                                {displayTrashedNotes.map((note) => (
                                    <TrashNoteItem
                                        key={note._id}
                                        note={note}
                                        showAlert={showAlert}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </section>
    );
}