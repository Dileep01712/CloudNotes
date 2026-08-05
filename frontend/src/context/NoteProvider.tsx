import { ReactNode, useCallback, useMemo, useState } from 'react';
import { useDirectoryState } from './directory/useDirectoryState';
import { useFoldersState } from './folders/useFoldersState';
import { useNotesState } from './notes/useNotesState';
import { useFetchWithAuth } from './hooks/useFetchWithAuth';
import NoteContext from './NoteContext';
import { DirectoryItem } from './types';

const SERVER_URL = 'http://localhost:8000';

interface NoteProviderProps {
    children: ReactNode;
}

export const NoteProvider = ({ children }: NoteProviderProps) => {
    const { fetchWithAuth, isTokenExpiredError } = useFetchWithAuth();
    const [directoryContent, setDirectoryContent] = useState<DirectoryItem[]>([]);
    const notes = useNotesState(setDirectoryContent);
    const folders = useFoldersState(setDirectoryContent);
    const directoryUtils = useDirectoryState(notes.allNotes, folders.allFolders);
    const currentFolderName = 'Home';

    const getDirectoryContent = useCallback(async (folderId?: string) => {
        try {
            const res = await fetchWithAuth(
                `${SERVER_URL}/api/note/fetch/${folderId ?? 'none'}`
            );
            const data = await res.json();
            if (data.success && Array.isArray(data.notes)) {
                setDirectoryContent(data.notes);
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

    const value = useMemo(() => ({
        directoryContent,
        pinnedNotes: directoryUtils.pinnedNotes,
        trashedNotes: directoryUtils.trashedNotes,
        currentFolderName: currentFolderName || 'Home',
        pinnedFolders: directoryUtils.pinnedFolders,
        trashedFolders: directoryUtils.trashedFolders,
        getDirectoryContent,

        allNotes: notes.allNotes,
        getAllNotes: notes.getAllNotes,
        addNote: notes.addNote,
        editNote: notes.editNote,
        moveNoteToFolder: notes.moveNoteToFolder,
        removeNoteFromFolder: notes.removeNoteFromFolder,
        pinNote: notes.pinNote,
        unpinNote: notes.unpinNote,
        moveNoteToTrash: notes.moveNoteToTrash,
        restoreNote: notes.restoreNote,
        deleteNotePermanently: notes.deleteNotePermanently,

        allFolders: folders.allFolders,
        getAllFolders: folders.getAllFolders,
        addFolder: folders.addFolder,
        updateFolder: folders.updateFolder,
        pinFolder: folders.pinFolder,
        unpinFolder: folders.unpinFolder,
        onFolderColorChange: folders.onFolderColorChange,
        moveFolderToTrash: folders.moveFolderToTrash,
        restoreFolder: folders.restoreFolder,
        deleteFolderPermanently: folders.deleteFolderPermanently,
    }), [
        directoryContent,
        directoryUtils.pinnedNotes,
        directoryUtils.trashedNotes,
        directoryUtils.pinnedFolders,
        directoryUtils.trashedFolders,
        currentFolderName,
        getDirectoryContent,

        notes.allNotes,
        notes.getAllNotes,
        notes.addNote,
        notes.editNote,
        notes.moveNoteToFolder,
        notes.removeNoteFromFolder,
        notes.pinNote,
        notes.unpinNote,
        notes.moveNoteToTrash,
        notes.restoreNote,
        notes.deleteNotePermanently,

        folders.allFolders,
        folders.getAllFolders,
        folders.addFolder,
        folders.updateFolder,
        folders.pinFolder,
        folders.unpinFolder,
        folders.onFolderColorChange,
        folders.moveFolderToTrash,
        folders.restoreFolder,
        folders.deleteFolderPermanently,
    ]);

    return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
};