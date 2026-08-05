import { useEffect, Dispatch, SetStateAction } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotes } from '@/context/useNotes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFolder } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../ui/button';
import Notes from '../notes/Notes';
import { getFolderBgClass } from '@/lib/helper';

interface FolderViewProps {
    searchTerm: string;
    mode: "note" | "folder" | "folderView";
    setMode: Dispatch<SetStateAction<"note" | "folder" | "folderView">>;
    showAlert: (
        msg: string,
        type: "success" | "danger" | "warning" | "info"
    ) => void;
}

export default function FolderView({
    searchTerm,
    mode,
    setMode,
    showAlert,
}: FolderViewProps) {
    const { folderId } = useParams<{ folderId: string }>();
    const navigate = useNavigate();
    const { allNotes, allFolders } = useNotes();
    const folder = allFolders.find(f => f._id === folderId);
    const folderTitle = folder ? folder.title : "Loading...";
    const folderColor = folder ? (folder.color || null) : null;

    useEffect(() => {
        if (folderId && allFolders.length > 0) {
            if (!folder) {
                navigate('/');
            } else {
                setMode("folderView");
            }
        }
    }, [folderId, allFolders, folder, navigate, setMode]);

    const childNotesCount = allNotes.filter(note => note.parent === folder?._id && !note.trashedAt).length;

    return (
        <div className="flex flex-col w-full animate-in fade-in duration-300">
            <div className="grid grid-cols-[auto_1fr] gap-4 mb-8 pb-4 border-b border-zinc-200 md:flex md:flex-row md:items-center w-full">
                <div className={`flex shrink-0 h-16 w-16 items-center justify-center rounded-md transition-all duration-300 ${getFolderBgClass(folderColor)} md:order-1`}>
                    <FontAwesomeIcon icon={faFolder} size="2xl" />
                </div>

                <div className="flex flex-col items-end gap-3 justify-center md:flex-row md:items-center sm:order-3">
                    <span className="whitespace-nowrap w-fit text-xs font-medium text-zinc-400 border px-2 rounded-full select-none">
                        {childNotesCount === 0
                            ? "Empty"
                            : `${childNotesCount} ${childNotesCount === 1 ? 'note' : 'notes'}`
                        }
                    </span>

                    <Button
                        variant="outline"
                        className="h-7 sm:h-9 group/btn shrink-0 font-medium text-zinc-500 hover:text-black hover:bg-zinc-100 cursor-pointer w-auto justify-center"
                        onClick={() => {
                            setMode("folder");
                            navigate('/');
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faArrowLeft}
                            className="transition-transform transform group-hover/btn:-translate-x-1 leading-none"
                        />
                        <span className="font-sans leading-none">Back</span>
                    </Button>
                </div>

                <h1 className="col-span-2 text-2xl font-bold text-zinc-900 tracking-tight wrap-break-word line-clamp-3 sm:order-2 flex-1">
                    {folderTitle}
                </h1>
            </div>

            <Notes
                folderId={folderId}
                searchTerm={searchTerm}
                mode={mode}
                setMode={setMode}
                showAlert={showAlert}
            />
        </div>
    );
}