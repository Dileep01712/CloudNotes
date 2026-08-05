import { useState } from "react";
import { Button } from '../ui/button';
import { useNotes } from "@/context/useNotes";

interface FolderComposerProps {
    path: string;
    showAlert: (
        msg: string,
        type: "success" | "danger" | "warning" | "info"
    ) => void;
}

export default function FolderComposer({
    path,
    showAlert
}: FolderComposerProps) {
    const { addFolder } = useNotes();
    const [folderName, setFolderName] = useState("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleFolderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!folderName.trim()) return;

        setLoading(true);

        try {
            const parentId = path === "Home" || path === "none" || !path ? null : path;

            await addFolder(folderName.trim(), parentId);

            setFolderName("");
            showAlert("Folder created successfully", "success");

        } catch (error) {
            console.error("Failed to create folder: ", error);
            showAlert("Failed to create folder", "danger");

        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="w-full flex flex-col flex-1 min-h-[277.5px] max-h-69">
            <form onSubmit={handleFolderSubmit} className="flex flex-col flex-1 h-full">
                <input
                    type="text"
                    placeholder="Folder title"
                    maxLength={50}
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="md:w-200 border-b text-2xl font-bold tracking-tight text-black outline-none placeholder:text-zinc-300 placeholder:select-none"
                />

                <div className="mt-auto flex justify-end w-full select-none">
                    <Button
                        type="submit"
                        disabled={loading || !folderName.trim()}
                        className="px-5 rounded-full font-medium transition-all duration-200 cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Creating..." : "Create Folder"}
                    </Button>
                </div>
            </form>
        </section>
    );
}