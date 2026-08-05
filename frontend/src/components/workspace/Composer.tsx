import { Dispatch, SetStateAction } from 'react';
import { Button } from '../ui/button';
import NoteComposer from "../notes/NoteComposer";
import FolderComposer from "../folders/FolderComposer";

interface ComposerProps {
    mode: "note" | "folder" | "folderView";
    setMode: Dispatch<SetStateAction<"note" | "folder" | "folderView">>;
    path: string,
    showAlert: (
        msg: string,
        type: "success" | "danger" | "warning" | "info",
    ) => void;
}

export default function Composer({
    mode,
    setMode,
    path,
    showAlert,
}: ComposerProps) {
    return (
        <section className="mb-14 rounded-[2rem] border border-zinc-100 bg-white p-5 md:p-8 shadow-sm transition-all duration-300 focus-within:border-zinc-200 focus-within:shadow-md hover:shadow-md md:min-h-102">
            <div className="relative flex items-center mb-6 bg-zinc-100 p-0.5 gap-2 w-fit rounded-full select-none">
                <div className={`absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out 
                        ${mode === "note"
                        ? "translate-x-0"
                        : "translate-x-full"
                    }`}
                />

                <Button
                    onClick={() => setMode("note")}
                    className={`relative z-10 w-1/2 bg-transparent hover:bg-transparent border-none shadow-none rounded-full px-5 text-xs font-semibold transition-colors duration-200 cursor-pointer 
                        ${mode === "note"
                            ? "text-black" :
                            "text-zinc-500 hover:text-zinc-800"
                        }
                    `}
                >
                    New Note
                </Button>

                <Button
                    onClick={() => setMode("folder")}
                    className={`relative z-10 w-1/2 bg-transparent hover:bg-transparent border-none shadow-none rounded-full px-5 text-xs font-semibold transition-colors duration-200 cursor-pointer 
                        ${mode === "folder"
                            ? "text-black"
                            : "text-zinc-500 hover:text-zinc-800"
                        }
                    `}
                >
                    New Folder
                </Button>
            </div>

            {mode === "note" ? (
                <NoteComposer path={path} showAlert={showAlert} mode={mode} />
            ) : (
                <FolderComposer path={path} showAlert={showAlert} />
            )}
        </section>
    );
}