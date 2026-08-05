import { useMemo, Dispatch, SetStateAction, useCallback } from "react";
import { useNotes } from "@/context/useNotes";
import Composer from "../workspace/Composer";
import { Folder } from "@/context/types";
import FolderItem from "./FolderItem";

interface FoldersProps {
    searchTerm: string;
    mode: "note" | "folder" | "folderView";
    setMode: Dispatch<SetStateAction<"note" | "folder" | "folderView">>;
    showAlert: (
        msg: string,
        type: "success" | "danger" | "warning" | "info"
    ) => void;
}

export default function Folders({
    searchTerm,
    mode,
    setMode,
    showAlert,
}: FoldersProps) {
    const {
        allNotes,
        allFolders,
        pinnedFolders,
        updateFolder,
        pinFolder,
        unpinFolder,
        onFolderColorChange,
        moveFolderToTrash,
    } = useNotes();

    const doesFolderMatchSearch = useCallback((folder: Folder, term: string) => {
        if (folder.title?.toLowerCase().includes(term)) return true;

        return allNotes.some(note => {
            if (note.parent === folder._id && !note.expireAt) {
                return (
                    note.title?.toLowerCase().includes(term) ||
                    note.description.toLowerCase().includes(term) ||
                    (note.tag && note.tag.toLowerCase().includes(term))
                );
            }

            return false;
        });
    }, [allNotes]);

    const unpinnedFolders = useMemo(
        () => allFolders.filter((item): item is Folder =>
            item.typeName === "folder" && !item.pinnedAt && !item.expireAt
        ),
        [allFolders]
    );

    const pinnedFiltered = useMemo(() => {
        if (!searchTerm.trim()) return pinnedFolders;
        const term = searchTerm.toLowerCase();

        return pinnedFolders.filter(folder => doesFolderMatchSearch(folder, term));
    }, [pinnedFolders, searchTerm, doesFolderMatchSearch]);

    const unpinnedFiltered = useMemo(() => {
        if (!searchTerm.trim()) return unpinnedFolders;
        const term = searchTerm.toLowerCase();

        return unpinnedFolders.filter(folder => doesFolderMatchSearch(folder, term));
    }, [unpinnedFolders, searchTerm, doesFolderMatchSearch]);

    const handleFolderRename = async (folder: Folder, newName: string) => {
        try {
            await updateFolder(folder._id, newName, folder.parent ?? null);
            showAlert("Folder renamed", "success");
        } catch {
            showAlert("Failed to rename folder", "danger");
        }
    };

    const handleFolderPinToggle = async (folder: Folder) => {
        try {
            if (folder.pinnedAt) {
                await unpinFolder(folder._id);
                showAlert("Folder unpinned", "success");
            } else {
                await pinFolder(folder._id);
                showAlert("Folder pinned", "success");
            }
        } catch (error) {
            console.error("Failed to update pin status: ", error);
            showAlert("Failed to update pin status", "danger");
        }
    };

    const handleFolderMoveToTrash = async (folder: Folder) => {
        try {
            await moveFolderToTrash(folder._id);
            showAlert("Folder moved to trash", "success");
        } catch (error) {
            console.error("Failed to move to trash: ", error);
            showAlert("Failed to move to trash", "danger");
        }
    };

    const hasAnyFolders = pinnedFiltered.length > 0 || unpinnedFiltered.length > 0;

    return (
        <div className="flex flex-col w-full">
            <div className="mb-15">
                <Composer path="" showAlert={showAlert} mode={mode} setMode={setMode} />
            </div>

            <div className="flex flex-col gap-12">
                {pinnedFiltered.length > 0 && (
                    <section>
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-0.2 select-none">
                            Pinned {searchTerm && `· matching “${searchTerm}”`}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                            {pinnedFiltered.map((folder) => (
                                <FolderItem
                                    key={folder._id}
                                    folder={folder}
                                    isPinned
                                    setMode={setMode}
                                    onFolderRename={handleFolderRename}
                                    onFolderPinToggle={handleFolderPinToggle}
                                    onFolderColorChange={onFolderColorChange}
                                    onFolderMoveToTrash={handleFolderMoveToTrash}
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
                            {unpinnedFiltered.map((folder) => (
                                <FolderItem
                                    key={folder._id}
                                    folder={folder}
                                    setMode={setMode}
                                    onFolderRename={handleFolderRename}
                                    onFolderPinToggle={handleFolderPinToggle}
                                    onFolderColorChange={onFolderColorChange}
                                    onFolderMoveToTrash={handleFolderMoveToTrash}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {!hasAnyFolders && (
                <div className="mt-8 flex min-h-102 flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white">
                    <div className="text-center px-6">
                        <h3 className="text-lg font-semibold text-zinc-900">
                            {searchTerm ? "No matching folders" : "No folders yet"}
                        </h3>
                        <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                            {searchTerm
                                ? `No folders contain “${searchTerm}”. Try a different term.`
                                : "Create your first folder to organize your notes."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}