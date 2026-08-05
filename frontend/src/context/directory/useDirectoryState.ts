import { useCallback, useMemo, useState } from "react";
import { DirectoryItem, Folder, Note } from "../types";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const useDirectoryState = (
    allNotes: Note[],
    allFolders: Folder[],
) => {
    const { fetchWithAuth, isTokenExpiredError } = useFetchWithAuth();
    const [directoryContent, setDirectoryContent] = useState<DirectoryItem[]>([]);

    const pinnedNotes = useMemo(
        () => allNotes.filter((note) => note.pinnedAt && !note.expireAt),
        [allNotes]
    );

    const trashedNotes = useMemo(
        () => allNotes
            .filter((note): note is Note & { expireAt: string } => Boolean(note.expireAt))
            .sort((a, b) => new Date(b.expireAt).getTime() - new Date(a.expireAt).getTime()),
        [allNotes]
    );

    const pinnedFolders = useMemo(
        () => allFolders.filter((folder) => folder.pinnedAt && !folder.expireAt),
        [allFolders]
    );

    const trashedFolders = useMemo(
        () => allFolders
            .filter((folder): folder is Folder & { expireAt: string } => Boolean(folder.expireAt))
            .sort((a, b) => new Date(b.expireAt).getTime() - new Date(a.expireAt).getTime()),
        [allFolders]
    );

    const getDirectoryContent = useCallback(async (folderId?: string) => {
        try {
            const res = await fetchWithAuth(
                `${SERVER_URL}/api/note/fetch/${folderId ?? 'none'}`
            );
            const data = await res.json();

            if (data.success && Array.isArray(data.notes)) {
                setDirectoryContent(data.notes);
                // Optionally set folder name if returned
            } else {
                setDirectoryContent([]);
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error('getDirectoryContent error:', error);
            }
            throw error;
        }
    }, [fetchWithAuth, isTokenExpiredError]);

    return {
        directoryContent,
        setDirectoryContent,
        pinnedNotes,
        trashedNotes,
        pinnedFolders,
        trashedFolders,
        getDirectoryContent,
    };
};