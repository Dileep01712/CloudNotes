export interface Note {
    _id: string;
    title?: string;
    description: string;
    tag?: string;
    parent?: string | null;
    typeName: "note";
    createdAt: string;
    updatedAt: string;
    pinnedAt?: number | null;
    trashedAt?: string | null;
    expireAt?: string | null;
}

export interface Folder {
    _id: string;
    title: string;
    parent?: string;
    typeName: "folder";
    color?: string | null;
    createdAt: string;
    updatedAt: string;
    pinnedAt?: number | null;
    trashedAt?: string | null;
    expireAt?: string | null;
}

export type DirectoryItem = Note | Folder;

export interface NoteContextType {
    directoryContent: DirectoryItem[];
    pinnedNotes: Note[];
    trashedNotes: Note[];
    currentFolderName: string;
    pinnedFolders: Folder[];
    trashedFolders: Folder[];

    allNotes: Note[];
    allFolders: Folder[];
    getAllNotes: () => Promise<void>;
    getAllFolders: () => Promise<void>;

    addNote: (
        description: string,
        title?: string,
        tag?: string,
        path?: string,
    ) => Promise<void>;
    editNote: (
        id: string,
        title?: string,
        description?: string,
        tag?: string,
    ) => Promise<void>;
    moveNoteToFolder: (noteId: string, folderId: string) => Promise<void>;
    removeNoteFromFolder: (noteId: string) => Promise<void>;
    pinNote: (noteId: string) => Promise<void>;
    unpinNote: (noteId: string) => Promise<void>;
    moveNoteToTrash: (noteId: string) => Promise<void>;
    restoreNote: (noteId: string) => Promise<void>;
    deleteNotePermanently: (noteId: string) => Promise<void>;

    getDirectoryContent: (folderId?: string) => Promise<void>;

    addFolder: (title: string, parent: string | null) => Promise<void>;
    updateFolder: (folderId: string, title: string, parent: string | null) => Promise<void>;
    pinFolder: (folderId: string) => Promise<void>;
    unpinFolder: (folderId: string) => Promise<void>;
    onFolderColorChange: (folder: Folder, color: string | null) => void;
    moveFolderToTrash: (folderId: string) => Promise<void>;
    restoreFolder: (folderId: string) => Promise<void>;
    deleteFolderPermanently: (folderId: string) => Promise<void>;
}