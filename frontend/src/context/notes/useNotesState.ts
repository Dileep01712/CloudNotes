import { useCallback, useState } from "react";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { Note, DirectoryItem } from "../types";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const useNotesState = (
    onDirectoryUpdate?: (
        updater: DirectoryItem[] | ((prev: DirectoryItem[]) => DirectoryItem[])
    ) => void,
) => {
    const { fetchWithAuth, isTokenExpiredError } = useFetchWithAuth();
    const [allNotes, setAllNotes] = useState<Note[]>([]);

    const getDirectoryContent = useCallback(async (folderId?: string) => {
        try {
            const res = await fetchWithAuth(
                `${SERVER_URL}/api/note/fetch/${folderId ?? "none"}`
            );
            const data = await res.json();

            if (data.success && Array.isArray(data.notes)) {
                onDirectoryUpdate?.(data.notes);
            } else {
                console.error("Failed to fetch directory content", data);
                onDirectoryUpdate?.([]);
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("Error fetching directory:", error);
            }
            throw error;
        }
    }, [fetchWithAuth, onDirectoryUpdate, isTokenExpiredError]);

    const getAllNotes = useCallback(async () => {
        try {
            const res = await fetchWithAuth(
                `${SERVER_URL}/api/note/fetch-all-notes`
            );
            const data = await res.json();

            if (data.success && Array.isArray(data.notes)) {
                setAllNotes(data.notes);
            } else {
                setAllNotes([]);
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("Error fetching all notes:", error);
            }
            throw error;
        }
    }, [fetchWithAuth, isTokenExpiredError]);

    const addNote = useCallback(async (
        description: string,
        title?: string,
        tag?: string,
        path?: string
    ) => {
        try {
            const parent = path === "" ? null : path;
            const res = await fetchWithAuth(
                `${SERVER_URL}/api/note/add-note`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        title: title || "",
                        description,
                        tag: tag || "",
                        parent,
                    }),
                }
            );
            const data = await res.json();

            if (data.success) {
                const newNote = data.note;
                setAllNotes((prev) => [newNote, ...prev]);
                onDirectoryUpdate?.((prev) => [newNote, ...prev]);
            } else {
                throw new Error(data.error || "Failed to add note");
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("addNote error:", error);
            }
            throw error;
        }
    }, [fetchWithAuth, onDirectoryUpdate, isTokenExpiredError]);

    const editNote = useCallback(async (
        id: string,
        title?: string,
        description?: string,
        tag?: string
    ) => {
        setAllNotes((prev) => prev.map((note) => {
            if (note._id === id) {
                return {
                    ...note,
                    title: title !== undefined ? title : note.title,
                    description: description !== undefined ? description : note.description,
                    tag: tag !== undefined ? tag : note.tag
                };
            }
            return note;
        }));

        onDirectoryUpdate?.((prev) => prev.map((item) => {
            if (item._id === id && item.typeName === 'note') {
                const noteItem = item as Note;
                return {
                    ...noteItem,
                    title: title !== undefined ? title : noteItem.title,
                    description: description !== undefined ? description : noteItem.description,
                    tag: tag !== undefined ? tag : noteItem.tag
                };
            }
            return item;
        }));

        try {
            const res = await fetchWithAuth(
                `${SERVER_URL}/api/note/update-note/${id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ title, description, tag }),
                }
            );
            const data = await res.json();

            if (data.success && data.note) {
                const updated = data.note;
                setAllNotes((prev) =>
                    prev.map((item) => (item._id === id ? { ...item, ...updated } : item))
                );
                onDirectoryUpdate?.((prev) =>
                    prev.map((item) => (item._id === id ? { ...item, ...updated } : item))
                );
            } else {
                throw new Error(data.error || "Failed to update note");
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("editNote error:", error);
            }
            throw error;
        }
    }, [fetchWithAuth, onDirectoryUpdate, isTokenExpiredError]);

    const moveNoteToFolder = useCallback(async (noteId: string, targetFolderId: string) => {
        setAllNotes((prev) => prev.map((note) => {
            if (note._id === noteId) {
                return { ...note, parent: targetFolderId };
            }
            return note;
        }));
        onDirectoryUpdate?.((prev) => prev.filter((item) => item._id !== noteId));

        try {
            const res = await fetchWithAuth(
                `${SERVER_URL}/api/note/update-note/${noteId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ parentId: targetFolderId }),
                }
            );
            const data = await res.json();

            if (data.success) {
                const updatedNote = data.note;
                setAllNotes((prev) =>
                    prev.map((note) => (note._id === noteId ? updatedNote : note))
                );
                onDirectoryUpdate?.((prev) => prev.filter((item) => item._id !== noteId));
            } else {
                throw new Error(data.error || "Failed to move note to folder");
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("moveNoteToFolder error:", error);
            }
            throw error;
        }
    }, [fetchWithAuth, onDirectoryUpdate, isTokenExpiredError]);

    const removeNoteFromFolder = useCallback(async (noteId: string) => {
        setAllNotes((prev) => prev.map((note) => {
            if (note._id === noteId) {
                return { ...note, parent: null };
            }
            return note;
        }));
        onDirectoryUpdate?.((prev) => prev.filter((item) => item._id !== noteId));

        try {
            const res = await fetchWithAuth(
                `${SERVER_URL}/api/note/update-note/${noteId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ parentId: null }),
                }
            );
            const data = await res.json();

            if (data.success) {
                const updatedNote = data.note;
                setAllNotes((prev) =>
                    prev.map((note) => (note._id === noteId ? updatedNote : note))
                );
                onDirectoryUpdate?.((prev) => prev.filter((item) => item._id !== noteId));
            } else {
                throw new Error(data.error || "Failed to remove note from folder");
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("removeNoteFromFolder error:", error);
            }
            throw error;
        }
    }, [fetchWithAuth, onDirectoryUpdate, isTokenExpiredError]);

    const pinNote = useCallback(async (noteId: string) => {
        const now = Date.now();

        setAllNotes((prev) => prev.map((note) => {
            if (note._id === noteId) {
                return { ...note, pinnedAt: now };
            }
            return note;
        }));

        onDirectoryUpdate?.((prev) => prev.map((item) => {
            if (item._id === noteId && item.typeName === 'note') {
                return { ...(item as Note), pinnedAt: now };
            }
            return item;
        }));

        try {
            const payload = {
                pinnedAt: {
                    status: true,
                    value: now,
                },
            };

            const res = await fetchWithAuth(
                `${SERVER_URL}/api/note/update-note/${noteId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json();

            if (data.success) {
                const updatedNote = data.note;
                setAllNotes((prev) =>
                    prev.map((note) => (note._id === noteId ? updatedNote : note))
                );
                onDirectoryUpdate?.((prev) =>
                    prev.map((item) =>
                        item._id === noteId && item.typeName === 'note' ? updatedNote : item
                    )
                );
            } else {
                throw new Error(data.error || 'Failed to pin note');
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("pinNote error:", error);
            }
            throw error;
        }
    }, [fetchWithAuth, onDirectoryUpdate, isTokenExpiredError]);

    const unpinNote = useCallback(async (noteId: string) => {
        setAllNotes((prev) => prev.map((note) => {
            if (note._id === noteId) {
                return { ...note, pinnedAt: null };
            }
            return note;
        }));

        onDirectoryUpdate?.((prev) => prev.map((item) => {
            if (item._id === noteId && item.typeName === 'note') {
                return { ...(item as Note), pinnedAt: null };
            }
            return item;
        }));

        try {
            const payload = {
                pinnedAt: {
                    status: false,
                },
            };

            const res = await fetchWithAuth(
                `${SERVER_URL}/api/note/update-note/${noteId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json();

            if (data.success) {
                const updatedNote = data.note;
                setAllNotes((prev) =>
                    prev.map((note) => (note._id === noteId ? updatedNote : note))
                );
                onDirectoryUpdate?.((prev) =>
                    prev.map((item) =>
                        item._id === noteId && item.typeName === 'note' ? updatedNote : item
                    )
                );
            } else {
                throw new Error(data.error || 'Failed to unpin note');
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("unpinNote error:", error);
            }
            throw error;
        }
    }, [fetchWithAuth, onDirectoryUpdate, isTokenExpiredError]);

    const moveNoteToTrash = useCallback(async (noteId: string) => {
        const nowStr = new Date().toISOString();

        setAllNotes((prev) => prev.map((note) => {
            if (note._id === noteId) {
                return { ...note, expireAt: nowStr, trashedAt: nowStr, pinnedAt: null };
            }
            return note;
        }));
        onDirectoryUpdate?.((prev) => prev.filter((item) => item._id !== noteId));

        try {
            const payload = {
                expireAt: { status: true },
                pinnedAt: { status: false },
            };

            const res = await fetchWithAuth(
                `${SERVER_URL}/api/note/update-note/${noteId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json();

            if (data.success) {
                const updatedNote = data.note;
                setAllNotes((prev) =>
                    prev.map((note) => (note._id === noteId ? updatedNote : note))
                );
                onDirectoryUpdate?.((prev) => prev.filter((item) => item._id !== noteId));
            } else {
                throw new Error(data.error || "Failed to move note to trash");
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("moveNoteToTrash error:", error);
            }
            throw error;
        }
    }, [fetchWithAuth, onDirectoryUpdate, isTokenExpiredError]);

    const restoreNote = useCallback(async (noteId: string) => {
        setAllNotes((prev) => prev.map((note) => {
            if (note._id === noteId) {
                return { ...note, expireAt: null, trashedAt: null };
            }
            return note;
        }));

        try {
            const payload = { expireAt: { status: false } };
            const res = await fetchWithAuth(
                `${SERVER_URL}/api/note/update-note/${noteId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json();

            if (data.success) {
                const updatedNote = data.note;

                setAllNotes((prev) =>
                    prev.map((note) => (note._id === noteId ? updatedNote : note))
                );
                await getDirectoryContent();
            } else {
                throw new Error(data.error || 'Failed to restore note');
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("restoreNote error:", error);
            }
            throw error;
        }
    }, [fetchWithAuth, getDirectoryContent, isTokenExpiredError]);

    const deleteNotePermanently = useCallback(async (noteId: string) => {
        setAllNotes((prev) => prev.filter((item) => item._id !== noteId));
        onDirectoryUpdate?.((prev) => prev.filter((item) => item._id !== noteId));

        try {
            const res = await fetchWithAuth(
                `${SERVER_URL}/api/note/delete-note/${noteId}`,
                {
                    method: 'DELETE',
                }
            );
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to delete note");
            }
            setAllNotes((prev) => prev.filter((item) => item._id !== noteId));
            onDirectoryUpdate?.((prev) => prev.filter((item) => item._id !== noteId));
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("deleteNote error:", error);
            }
            throw error;
        }
    }, [fetchWithAuth, onDirectoryUpdate, isTokenExpiredError]);

    return {
        allNotes,
        setAllNotes,
        getAllNotes,
        addNote,
        editNote,
        moveNoteToFolder,
        removeNoteFromFolder,
        pinNote,
        unpinNote,
        moveNoteToTrash,
        restoreNote,
        deleteNotePermanently,
    };
};