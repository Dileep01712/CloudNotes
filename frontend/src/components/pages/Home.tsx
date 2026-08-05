import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNotes } from '@/context/useNotes';
import SearchBar from "../common/SearchBar";
import Notes from "../notes/Notes";
import Folders from '../folders/Folders';
import FolderView from './FolderView';

interface HomeProps {
  mode: "note" | "folder" | "folderView";
  setMode: Dispatch<SetStateAction<"note" | "folder" | "folderView">>;
  showAlert: (
    msg: string,
    type: "success" | "danger" | "warning" | "info"
  ) => void;
}

export default function Home({
  mode,
  setMode,
  showAlert,
}: HomeProps) {
  const { directoryId, folderId } = useParams<{ directoryId?: string, folderId?: string }>();
  const { getDirectoryContent, getAllNotes, getAllFolders } = useNotes();
  const [searchTerm, setSearchTerm] = useState("");
  const showAlertRef = useRef(showAlert);
  const lastFetchedIdRef = useRef<string | null | undefined>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    showAlertRef.current = showAlert;
  }, [showAlert]);

  useEffect(() => {
    if (isFetchingRef.current) return;

    const activeId = folderId || directoryId;
    if (lastFetchedIdRef.current === activeId) return;

    const fetchData = async () => {
      isFetchingRef.current = true;

      try {
        await Promise.all([
          getDirectoryContent(activeId),
          getAllNotes(),
          getAllFolders(),
        ]);

        lastFetchedIdRef.current = activeId;
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : '';
        if (!errMsg.includes('expired') && !errMsg.includes('Session')) {
          showAlertRef.current('Failed to load data. Please try again.', 'danger');
        }
      } finally {
        isFetchingRef.current = false;
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directoryId, folderId]);

  const placeholder =
    mode === "note"
      ? "Search notes by title, tag, or description..."
      : mode === "folder"
        ? "Search folders by name, or notes inside them..."
        : "Search notes inside this folder...";

  return (
    <main className="mx-auto max-w-7xl py-16">
      <SearchBar placeholder={placeholder} searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {mode === "note" && (
        <Notes showAlert={showAlert} searchTerm={searchTerm} mode={mode} setMode={setMode} />
      )}

      {mode === "folder" && (
        <Folders showAlert={showAlert} searchTerm={searchTerm} mode={mode} setMode={setMode} />
      )}

      {mode === "folderView" && (
        <FolderView showAlert={showAlert} searchTerm={searchTerm} mode={mode} setMode={setMode} />
      )}
    </main>
  );
}