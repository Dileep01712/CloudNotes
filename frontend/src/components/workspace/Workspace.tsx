import { Dispatch, SetStateAction } from "react";
import WorkspaceHero from "./WorkspaceHero";
import Composer from "./Composer";
import NotesGrid from "../notes/NotesGrid";
import Notes from "../notes/Notes";
import FoldersGrid from "../folders/FoldersGrid";
import Folders from "../folders/Folders";

interface WorkspaceProps {
    searchTerm: string;
    mode: "note" | "folder" | "folderView";
    setMode: Dispatch<SetStateAction<"note" | "folder" | "folderView">>;
    path: string;
    showAlert: (
        msg: string,
        type: "success" | "danger" | "warning" | "info"
    ) => void;
}

export default function Workspace({
    searchTerm,
    mode,
    setMode,
    path,
    showAlert,
}: WorkspaceProps) {
    return (
        <main>
            <WorkspaceHero />

            <Composer path={path} showAlert={showAlert} mode={mode} setMode={setMode} />

            <NotesGrid>
                <Notes showAlert={showAlert} searchTerm={searchTerm} mode={mode} setMode={setMode} />
            </NotesGrid>

            <FoldersGrid>
                <Folders showAlert={showAlert} searchTerm={searchTerm} mode={mode} setMode={setMode} />
            </FoldersGrid>
        </main>
    );
}