import { useState, useMemo, Dispatch, SetStateAction } from 'react';
import { useNotes } from '@/context/useNotes';
import Composer from '../workspace/Composer';
import { Note } from '@/context/types';
import NoteItem from './NoteItem';
import EditNoteModal from '../modals/EditNoteModal';

interface NotesProps {
    searchTerm: string;
    mode: "note" | "folder" | "folderView";
    setMode: Dispatch<SetStateAction<"note" | "folder" | "folderView">>;
    folderId?: string;
    showAlert: (
        msg: string,
        type: "success" | "danger" | "warning" | "info"
    ) => void;
}

export default function Notes({
    searchTerm,
    mode,
    setMode,
    folderId,
    showAlert,
}: NotesProps) {
    const {
        allNotes,
        pinnedNotes,
        moveNoteToFolder,
        removeNoteFromFolder,
        pinNote,
        unpinNote,
        moveNoteToTrash
    } = useNotes();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);

    const currentFolderId = folderId || null;

    const unpinnedNotes = useMemo(
        () => allNotes.filter((item): item is Note => {
            const matchesFolder = currentFolderId ? item.parent === currentFolderId : !item.parent;
            return item.typeName === "note" && !item.pinnedAt && !item.expireAt && matchesFolder;
        }),
        [allNotes, currentFolderId]
    );

    const pinnedFiltered = useMemo(() => {
        const folderPinned = pinnedNotes.filter(note =>
            currentFolderId ? note.parent === currentFolderId : !note.parent
        );

        if (!searchTerm.trim()) return folderPinned;
        const term = searchTerm.toLowerCase();

        return folderPinned.filter(note =>
            note.title?.toLowerCase().includes(term) ||
            note.description.toLowerCase().includes(term) ||
            (note.tag && note.tag.toLowerCase().includes(term))
        );
    }, [pinnedNotes, searchTerm, currentFolderId]);

    const unpinnedFiltered = useMemo(() => {
        if (!searchTerm.trim()) return unpinnedNotes;
        const term = searchTerm.toLowerCase();

        return unpinnedNotes.filter(note =>
            note.title?.toLowerCase().includes(term) ||
            note.description.toLowerCase().includes(term) ||
            (note.tag && note.tag.toLowerCase().includes(term))
        );
    }, [unpinnedNotes, searchTerm]);

    const handleNoteEdit = (note: Note) => {
        setNoteToEdit(note);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setNoteToEdit(null);
    };

    const handleMoveNote = async (note: Note, targetFolderId: string | null) => {
        try {
            if (targetFolderId === null) {
                await removeNoteFromFolder(note._id);
            } else {
                await moveNoteToFolder(note._id, targetFolderId);
            }

            showAlert("Note moved successfully", "success");
        } catch (error) {
            console.error("Failed to move note:", error);
            showAlert("Failed to move note", "danger");
        }
    };

    const handleNotePinToggle = async (note: Note) => {
        try {
            if (note.pinnedAt) {
                await unpinNote(note._id);
                showAlert("Note unpinned", "success");
            } else {
                await pinNote(note._id);
                showAlert("Note pinned", "success");
            }
        } catch (error) {
            console.error("Failed to update pin status", error);
            showAlert("Failed to update pin status", "danger");
        }
    };

    const handleNoteMoveToTrash = async (note: Note) => {
        try {
            await moveNoteToTrash(note._id);
            showAlert("Note moved to trash", "success");
        } catch (error) {
            console.error("Failed to move to trash: ", error);
            showAlert("Failed to move to trash", "danger");
        }
    };

    const hasAnyNotes = pinnedFiltered.length > 0 || unpinnedFiltered.length > 0;

    return (
        <div className="flex flex-col w-full">
            {mode !== "folderView" && (
                <div className="mb-15">
                    <Composer path="" showAlert={showAlert} mode={mode} setMode={setMode} />
                </div>
            )}

            <div className="flex flex-col gap-12">
                {pinnedFiltered.length > 0 && (
                    <section>
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-0.2 select-none">
                            Pinned {searchTerm && `· matching “${searchTerm}”`}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                            {pinnedFiltered.map((note) => (
                                <NoteItem
                                    key={note._id}
                                    note={note}
                                    isPinned
                                    onNoteEdit={handleNoteEdit}
                                    onNotePinToggle={handleNotePinToggle}
                                    onNoteMoveToTrash={handleNoteMoveToTrash}
                                    onNoteMove={handleMoveNote}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {unpinnedFiltered.length > 0 && (
                    <section>
                        {pinnedFiltered.length > 0 && (
                            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-0.2 select-none">
                                Others {searchTerm && `· matching “${searchTerm}”`}
                            </h3>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                            {unpinnedFiltered.map((note) => (
                                <NoteItem
                                    key={note._id}
                                    note={note}
                                    onNoteEdit={handleNoteEdit}
                                    onNotePinToggle={handleNotePinToggle}
                                    onNoteMoveToTrash={handleNoteMoveToTrash}
                                    onNoteMove={handleMoveNote}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {!hasAnyNotes && (
                <div className="mt-8 flex min-h-102 flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white">
                    <div className="text-center px-6">
                        <h3 className="text-lg font-semibold text-zinc-900">
                            {searchTerm
                                ? "No matching notes"
                                : currentFolderId
                                    ? "This folder is empty"
                                    : "No notes yet"
                            }
                        </h3>
                        <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                            {searchTerm
                                ? `No notes contain “${searchTerm}” in title, tag, or content. Try a different term.`
                                : currentFolderId
                                    ? "Move notes into this folder from your home screen to keep your workspace organized."
                                    : "Your thoughts and ideas will appear here. Create your first note using the composer above."
                            }
                        </p>
                    </div>
                </div>
            )}

            <EditNoteModal
                note={noteToEdit}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                showAlert={showAlert}
            />
        </div>
    );
}