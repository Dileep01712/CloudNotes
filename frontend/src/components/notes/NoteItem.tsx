import { useState } from "react";
import type { Note } from "@/context/types";
import { useNotes } from "@/context/useNotes";
import { Button } from "../ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendar,
    faCalendarPlus,
    faFolderOpen,
    faThumbTack,
    faThumbTackSlash,
    faTrash,
    faArrowLeft,
    faFolder,
    faHouse
} from "@fortawesome/free-solid-svg-icons";
import { formatFullDateTime, isUpdated } from "@/lib/helper";

interface NoteItemProps {
    note: Note;
    isPinned?: boolean;
    onNoteEdit: (note: Note) => void;
    onNotePinToggle: (note: Note) => void;
    onNoteMoveToTrash: (note: Note) => void;
    onNoteMove: (note: Note, targetFolderId: string | null) => void;
}

export default function NoteItem({
    note,
    isPinned = false,
    onNoteEdit,
    onNotePinToggle,
    onNoteMoveToTrash,
    onNoteMove,
}: NoteItemProps) {
    const isUpdateBool = isUpdated(note);
    const { allFolders } = useNotes();
    const [showFolderMenu, setShowFolderMenu] = useState(false);

    const handleMoveSelection = (e: React.MouseEvent, targetFolderId: string | null) => {
        e.stopPropagation();
        onNoteMove(note, targetFolderId);
        setShowFolderMenu(false);
    };

    return (
        <article
            onClick={() => { if (!showFolderMenu) onNoteEdit(note); }}
            className={`group flex flex-col h-55 gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-300 hover:shadow-lg ${showFolderMenu ? 'cursor-default' : 'cursor-pointer hover:scale-105'}`}
        >
            {showFolderMenu ? (
                <div className="flex flex-col h-full w-full animate-in fade-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-3 select-none">
                        <h3 className="text-sm font-bold text-black">Move to...</h3>
                        <Button
                            variant="ghost"
                            className="group/btn h-7 px-2 text-xs font-medium text-zinc-500 hover:text-black hover:bg-zinc-100 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowFolderMenu(false);
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faArrowLeft}
                                className="transition-transform transform group-hover/btn:-translate-x-1 leading-none"
                            />
                            <span className="font-sans leading-none">Back</span>
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1">
                        {note.parent && (
                            <Button
                                className="w-full h-auto justify-start gap-3 text-sm font-medium text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer overflow-hidden mb-4 p-2 bg-zinc-50 border border-zinc-200"
                                onClick={(e) => handleMoveSelection(e, null)}
                                variant="ghost"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm border border-zinc-200">
                                    <FontAwesomeIcon icon={faHouse} className="text-zinc-500 text-sm" />
                                </div>
                                <div className="flex flex-col items-start min-w-0">
                                    <span className="truncate w-full text-left leading-tight">
                                        Home Dashboard
                                    </span>
                                    <span className="text-xs font-normal text-zinc-500 leading-tight mt-0.5">
                                        Remove from current folder
                                    </span>
                                </div>
                            </Button>
                        )}

                        {(() => {
                            const availableFolders = allFolders.filter(
                                folder => !folder.trashedAt && !folder.expireAt && folder._id !== note.parent
                            );

                            return (
                                <>
                                    <div className="px-2 mb-2">
                                        <span className="text-xxs font-bold text-zinc-400 uppercase tracking-wider select-none">
                                            {note.parent ? "Or move to folder" : "Your Folders"}
                                        </span>
                                    </div>

                                    {availableFolders.length > 0 ? (
                                        availableFolders.map(folder => (
                                            <Button
                                                key={folder._id}
                                                className="w-full justify-start gap-3 text-sm font-normal text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer overflow-hidden mb-0.5 px-2"
                                                onClick={(e) => handleMoveSelection(e, folder._id)}
                                                variant="ghost"
                                            >
                                                <FontAwesomeIcon icon={faFolder} className="text-zinc-400 shrink-0" />
                                                <span className="truncate w-full text-left">
                                                    {folder.title}
                                                </span>
                                            </Button>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                                            <span className="text-sm text-zinc-500 font-medium">
                                                No folders available
                                            </span>
                                            <span className="text-xs text-zinc-400 mt-1">
                                                Create a folder first to move this note.
                                            </span>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-center min-h-6 gap-1">
                        <h3 className={`line-clamp-1 flex-1 text-base font-semibold 
                                ${note.title
                                ? 'text-black'
                                : 'text-gray-400'
                            }
                        `}>
                            {note.title || "Untitled Note"}
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
                    </div>

                    <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed font-medium text-zinc-500 min-h-23">
                        {note.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-zinc-100 pt-2 gap-1">
                        <p className="text-xs font-medium text-zinc-400 flex items-center gap-2 select-none">
                            <FontAwesomeIcon
                                icon={isUpdateBool ? faCalendarPlus : faCalendar}
                                className="text-zinc-400"
                            />
                            {isUpdateBool ? "Updated: " : "Created: "}
                            {formatFullDateTime(isUpdateBool ? note.updatedAt : note.createdAt)}
                        </p>

                        <div className="flex gap-1 lg:opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowFolderMenu(true);
                                }}
                                className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
                                title="Move to Folder"
                                variant="ghost"
                            >
                                <FontAwesomeIcon icon={faFolderOpen} />
                            </Button>

                            {isPinned ? (
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onNotePinToggle?.(note);
                                    }}
                                    className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
                                    title="Unpin"
                                    variant="ghost"
                                >
                                    <FontAwesomeIcon icon={faThumbTackSlash} />
                                </Button>
                            ) : (
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onNotePinToggle?.(note);
                                    }}
                                    className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
                                    title="Pin"
                                    variant="ghost"
                                >
                                    <FontAwesomeIcon icon={faThumbTack} />
                                </Button>
                            )}

                            {onNoteMoveToTrash && (
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onNoteMoveToTrash?.(note);
                                    }}
                                    className="rounded-md p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
                                    title="Move to trash"
                                    variant="ghost"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </article>
    );
}