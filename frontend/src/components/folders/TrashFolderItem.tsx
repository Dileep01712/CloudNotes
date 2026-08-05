import { Folder } from "@/context/types";
import { Button } from "../ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faFolder, faRotate, faTrash } from "@fortawesome/free-solid-svg-icons";
import { getFolderBgClass, useCurrentTime, getRemainingDays, getTrashedDate } from "@/lib/helper";
import { useNotes } from "@/context/useNotes";

interface TrashFolderItemProps {
    folder: Folder;
    showAlert: (
        msg: string,
        type: "success" | "danger" | "warning" | "info"
    ) => void;
}

export default function TrashFolderItem({
    folder,
    showAlert,
}: TrashFolderItemProps) {
    const { allNotes, restoreFolder, deleteFolderPermanently } = useNotes();
    const now = useCurrentTime();
    const remainingDays = getRemainingDays(folder.expireAt, now);
    const trashedDate = getTrashedDate(folder);
    const childNotesCount = allNotes.filter(note => note.parent === folder._id).length;

    const handleRestoreFolder = async () => {
        try {
            await restoreFolder(folder._id);
            showAlert('Note restored successfully', 'success');
        } catch (error) {
            console.error(error);
            showAlert('Failed to restore folder', 'danger');
        }
    };

    const handleDeleteFolderPermanently = async () => {
        try {
            await deleteFolderPermanently(folder._id);
            showAlert('Note deleted permanently', 'success');
        } catch (error) {
            console.error(error);
            showAlert('Failed to delete folder', 'danger');
        }
    };

    return (
        <div className="relative group h-full">
            <div className="group/card flex flex-col h-55 p-5 rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="mb-3.5">
                    <div className="flex items-start justify-between mb-3">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-md transition-all duration-300 
                            ${getFolderBgClass(folder.color)}`}>
                            <FontAwesomeIcon icon={faFolder} size="2xl" />
                        </div>

                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 select-none">
                            {remainingDays} {remainingDays === 1 ? "day" : "days"}
                        </span>
                    </div>

                    <h3 className="h-12 text-base font-semibold text-black line-clamp-2 wrap-break-word">
                        {folder.title}
                    </h3>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 pt-2 gap-1">
                    <p className="flex items-center gap-2 text-xs font-medium text-zinc-400 select-none">
                        <FontAwesomeIcon icon={faClock} className="text-zinc-400" />
                        Trashed: {trashedDate}
                    </p>
                    
                    <div className="flex items-center gap-2">
                        <span className="whitespace-nowrap w-fit text-xs font-medium text-zinc-400 border px-2 rounded-full select-none">
                            {childNotesCount === 0
                                ? "Empty"
                                : `${childNotesCount} ${childNotesCount === 1 ? 'note' : 'notes'}`
                            }
                        </span>

                        <div className="flex gap-1 lg:opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                                onClick={handleRestoreFolder}
                                className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
                                variant="ghost"
                                title="Restore folder"
                            >
                                <FontAwesomeIcon icon={faRotate} />
                            </Button>

                            <Button
                                onClick={handleDeleteFolderPermanently}
                                className="rounded-md p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
                                variant="ghost"
                                title="Delete forever"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}