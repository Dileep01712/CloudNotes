import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { Folder } from "@/context/types";
import { Button } from "../ui/button";
import FolderDropdownMenu from "./FolderDropdownMenu";
import { formatFullDateTime, getFolderBgClass, isUpdated } from "@/lib/helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFolder,
    faEllipsisVertical,
    faCalendar,
    faCalendarPlus,
    faArrowLeft
} from "@fortawesome/free-solid-svg-icons";
import { useNotes } from "@/context/useNotes";

interface FolderItemProps {
    folder: Folder;
    isPinned?: boolean;
    setMode: Dispatch<SetStateAction<"note" | "folder" | "folderView">>;
    onFolderRename: (folder: Folder, newName: string) => void;
    onFolderPinToggle: (folder: Folder) => void;
    onFolderColorChange: (folder: Folder, color: string | null) => void;
    onFolderMoveToTrash: (folder: Folder) => void;
}

export default function FolderItem({
    folder,
    isPinned = false,
    setMode,
    onFolderRename,
    onFolderPinToggle,
    onFolderColorChange,
    onFolderMoveToTrash,
}: FolderItemProps) {
    const navigate = useNavigate();
    const { allNotes } = useNotes();
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editName, setEditName] = useState<string>(folder.title);

    const menuRef = useRef<HTMLDivElement>(null);

    const childNotesCount = allNotes.filter(note => note.parent === folder._id && !note.trashedAt).length;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if ((menuRef.current && !menuRef.current.contains(target))) {
                setShowMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOpenFolder = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();

        if (isEditing || showDetails) return;

        navigate(`/f/${folder._id}`);
        setMode("folderView");
    };

    const handleRenameSave = async () => {
        const trimmed = editName.trim();
        if (trimmed === folder.title || trimmed === "") {
            setIsEditing(false);
            setEditName(folder.title);
            return;
        }

        try {
            onFolderRename?.(folder, trimmed);
            setIsEditing(false)
        } catch (error) {
            console.log("Failed to rename folder: ", error);
        }
    };

    const isUpdateBool = isUpdated(folder);

    return (
        <div ref={menuRef} className="relative group h-full">
            <div onClick={handleOpenFolder}
                className={`group/card flex flex-col h-55 rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:shadow-lg ${showDetails ? 'cursor-default' : 'cursor-pointer hover:scale-105'}`}
            >
                {showDetails ? (
                    <div className="flex flex-col animate-in fade-in duration-200 w-full z-10 bg-white p-5 min-h-54.75 rounded-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3 select-none">
                            <h3 className="text-sm font-bold text-black">Folder Details</h3>
                            <Button
                                variant="ghost"
                                className="group/btn h-7 px-2 text-xs font-medium text-zinc-500 hover:text-black hover:bg-zinc-100 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDetails(false);
                                    setShowMenu(true);
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faArrowLeft}
                                    className="transition-transform transform group-hover/btn:-translate-x-1 leading-none"
                                />
                                <span className="font-sans leading-none">Back</span>
                            </Button>
                        </div>

                        <div className="mb-2 w-full">
                            <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 select-none">
                                Name
                            </span>

                            <span className="block text-sm font-medium text-black line-clamp-2 wrap-break-word leading-snug">
                                {folder.title}
                            </span>
                        </div>

                        <div className="mt-auto space-y-1.5 border-t border-zinc-100 pt-3">
                            <p className="text-xs font-medium text-zinc-500 flex items-center gap-2 select-none">
                                <FontAwesomeIcon icon={faCalendar} className="text-zinc-400 w-3 h-3" />
                                Created: {formatFullDateTime(folder.createdAt)}
                            </p>

                            {folder.updatedAt && new Date(folder.updatedAt).getTime() > new Date(folder.createdAt).getTime() && (
                                <p className="text-xs font-medium text-zinc-500 flex items-center gap-2 select-none">
                                    <FontAwesomeIcon icon={faCalendarPlus} className="text-zinc-400 w-3 h-3" />
                                    Updated: {formatFullDateTime(folder.updatedAt)}
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`flex h-16 w-16 items-center justify-center rounded-md transition-all duration-300 ${getFolderBgClass(folder.color)}`}>
                                    <FontAwesomeIcon icon={faFolder} size="2xl" />
                                </div>

                                {!isEditing && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-md p-2 text-zinc-400 hover:bg-zinc-100 hover:text-black cursor-pointer lg:opacity-0 transition-opacity group-hover/card:opacity-100 data-[state=open]:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(!showMenu);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faEllipsisVertical} />
                                    </Button>
                                )}
                            </div>

                            <div className="min-h-12">
                                {isEditing ? (
                                    <textarea
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onFocus={(e) => {
                                            const val = e.currentTarget.value;
                                            e.currentTarget.setSelectionRange(val.length, val.length);
                                            e.currentTarget.style.height = 'auto';
                                            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                                        }}
                                        onInput={(e) => {
                                            e.currentTarget.style.height = 'auto';
                                            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                                        }}
                                        rows={1}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full h-12 resize-none overflow-hidden border-b bg-transparent text-base font-semibold text-black wrap-break-word focus:outline-none"
                                    />
                                ) : (
                                    <h3 className="h-12 text-base font-semibold text-black line-clamp-2 wrap-break-word">
                                        {folder.title}
                                    </h3>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            {isEditing ? (
                                <div className="flex w-full items-center justify-end gap-5 px-5">
                                    <Button
                                        className="h-7 cursor-pointer px-3 text-xs font-medium"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditName(folder.title);
                                            setIsEditing(false);
                                        }}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        className="h-7 cursor-pointer px-3 text-xs font-medium"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRenameSave();
                                        }}
                                    >
                                        Save
                                    </Button>
                                </div>
                            ) : (
                                <div className="w-full px-5">
                                    <p className="border-t border-zinc-100 mb-4" />
                                    <div className="flex items-center justify-between gap-2">
                                        {(folder.createdAt || folder.updatedAt) && (
                                            <p className="text-xs font-medium text-zinc-400 flex items-center gap-2 select-none my-auto">
                                                <FontAwesomeIcon
                                                    icon={isUpdateBool ? faCalendarPlus : faCalendar}
                                                    className="text-zinc-400"
                                                />
                                                {isUpdateBool ? "Updated: " : "Created: "}
                                                {isUpdateBool
                                                    ? formatFullDateTime(folder.updatedAt)
                                                    : formatFullDateTime(folder.createdAt)
                                                }
                                            </p>
                                        )}
                                        <span className="whitespace-nowrap w-fit text-xs font-medium text-zinc-400 border px-2 rounded-full select-none">
                                            {childNotesCount === 0
                                                ? "Empty"
                                                : `${childNotesCount} ${childNotesCount === 1 ? 'note' : 'notes'}`
                                            }
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <FolderDropdownMenu
                folder={folder}
                showMenu={showMenu}
                isPinned={isPinned}
                setShowMenu={setShowMenu}
                setIsEditing={setIsEditing}
                setShowDetails={setShowDetails}
                onFolderPinToggle={onFolderPinToggle}
                onFolderColorChange={onFolderColorChange}
                onFolderMoveToTrash={onFolderMoveToTrash}
            />
        </div>
    );
}