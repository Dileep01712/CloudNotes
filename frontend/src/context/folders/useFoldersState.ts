import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { DirectoryItem, Folder, Note } from "../types";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const useFoldersState = (
    onDirectoryUpdate?: (
        updater: DirectoryItem[] | ((prev: DirectoryItem[]) => DirectoryItem[])
    ) => void,
    setAllNotes?: Dispatch<SetStateAction<Note[]>>
) => {
    const { fetchWithAuth, isTokenExpiredError } = useFetchWithAuth();
    const [allFolders, setAllFolders] = useState<Folder[]>([]);

    const getAllFolders = useCallback(async () => {
        try {
            const res = await fetchWithAuth(
                `${SERVER_URL}/api/folder/fetch-all-folders`
            );
            const data = await res.json();

            if (data.success && Array.isArray(data.folders)) {
                setAllFolders(data.folders);
            } else {
                setAllFolders([]);
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("Error fetching all folders:", error);
            }
            throw error;
        }
    }, [fetchWithAuth, isTokenExpiredError]);

    const addFolder = useCallback(async (title: string, parentId: string | null) => {
        try {
            const payload: Record<string, string> = { title };
            if (parentId) payload.parent = parentId;

            const res = await fetchWithAuth(
                `${SERVER_URL}/api/folder/create-folder`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json();

            if (data.success) {
                const newFolder = data.folder;
                setAllFolders((prev) => [newFolder, ...prev]);
                onDirectoryUpdate?.((prev) => [newFolder, ...prev]);
            } else {
                throw new Error(data.error || "Failed to create folder");
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("addFolder error:", error);
            }
            throw error;
        }
    }, [fetchWithAuth, onDirectoryUpdate, isTokenExpiredError]);

    const updateFolder = useCallback(async (folderId: string, title: string, parentId: string | null) => {
        try {
            const res = await fetchWithAuth(
                `${SERVER_URL}/api/folder/update-folder/${folderId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ title, parent: parentId }),
                }
            );
            const data = await res.json();

            if (data.success) {
                const updated = data.folder;
                setAllFolders((prev) => prev.map(f => f._id === folderId ? updated : f));
                onDirectoryUpdate?.((prev) => prev.map(item =>
                    item._id === folderId ? updated : item
                ));
            } else {
                throw new Error(data.error || 'Failed to update folder');
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error('updateFolder error:', error);
            }
            throw error;
        }
    }, [fetchWithAuth, onDirectoryUpdate, isTokenExpiredError]);

    const pinFolder = useCallback(async (folderId: string) => {
        try {
            const payload = {
                pinnedAt: { status: true, value: new Date().toISOString() },
            };

            const res = await fetchWithAuth(
                `${SERVER_URL}/api/folder/update-folder/${folderId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json();

            if (data.success) {
                const updated = data.folder;
                setAllFolders((prev) =>
                    prev.map((f) => (f._id === folderId ? updated : f))
                );
                onDirectoryUpdate?.((prev) =>
                    prev.map((item) => (item._id === folderId ? updated : item))
                );
            } else {
                throw new Error(data.error || 'Failed to pin folder');
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error('pinFolder error:', error);
            }
            throw error;
        }
    }, [fetchWithAuth, onDirectoryUpdate, isTokenExpiredError]);

    const unpinFolder = useCallback(async (folderId: string) => {
        try {
            const payload = {
                pinnedAt: { status: false },
            };

            const res = await fetchWithAuth(
                `${SERVER_URL}/api/folder/update-folder/${folderId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json();

            if (data.success) {
                const updated = data.folder;
                setAllFolders((prev) =>
                    prev.map((f) => (f._id === folderId ? updated : f))
                );
                onDirectoryUpdate?.((prev) =>
                    prev.map((item) => (item._id === folderId ? updated : item))
                );
            } else {
                throw new Error(data.error || 'Failed to unpin folder');
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error('unpinFolder error:', error);
            }
            throw error;
        }
    }, [fetchWithAuth, onDirectoryUpdate, isTokenExpiredError]);

    const onFolderColorChange = useCallback(async (targetFolder: Folder, newColor: string | null) => {
        console.log("Color clicked! targetFolder: ", targetFolder.title, "newColor: ", newColor);
        try {
            const res = await fetchWithAuth(
                `${SERVER_URL}/api/folder/update-folder/${targetFolder._id}`,
                {
                    method: "PUT",
                    body: JSON.stringify({ color: newColor }),
                }
            );
            const data = await res.json();

            if (data.success) {
                const updated = data.folder;

                setAllFolders((prevFolders) =>
                    prevFolders.map((folder) =>
                        folder._id === targetFolder._id ? updated : folder
                    )
                );

                onDirectoryUpdate?.((prev) =>
                    prev.map((item) =>
                        item._id === targetFolder._id ? updated : item
                    )
                );
            } else {
                throw new Error(data.error || 'Failed to update folder color');
            }

        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("onFolderColorChange error:", error);
            }
            throw error;
        }
    }, [fetchWithAuth, onDirectoryUpdate, isTokenExpiredError]);

    const moveFolderToTrash = useCallback(async (folderId: string) => {
        try {
            const payload = {
                expireAt: { status: true },
                pinnedAt: { status: false },
            };

            const res = await fetchWithAuth(
                `${SERVER_URL}/api/folder/update-folder/${folderId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json();

            if (data.success) {
                const updated = data.folder;
                onDirectoryUpdate?.((prev) => prev.filter((item) => item._id !== folderId));
                setAllFolders((prev) =>
                    prev.map((f) => (f._id === folderId ? updated : f))
                );
                setAllNotes?.((prevNotes) => prevNotes.map((note) =>
                    note.parent === folderId
                        ? { ...note, expireAt: updated.expireAt, trashedAt: updated.trashedAt, pinnedAt: null }
                        : note
                ));
            } else {
                throw new Error(data.error || 'Failed to move folder to trash');
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("moveFolderToTrash error: ", error);
            }
            throw error;
        }
    }, [fetchWithAuth, onDirectoryUpdate, isTokenExpiredError, setAllNotes]);

    const restoreFolder = useCallback(async (folderId: string) => {
        try {
            const payload = {
                expireAt: { status: false },
            };

            const res = await fetchWithAuth(
                `${SERVER_URL}/api/folder/update-folder/${folderId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json();

            if (data.success) {
                const updated = data.folder;
                setAllFolders((prev) =>
                    prev.map((f) => (f._id === folderId ? updated : f))
                );

                setAllNotes?.((prevNotes) => prevNotes.map((note) =>
                    note.parent === folderId
                        ? { ...note, expireAt: null, trashedAt: null }
                        : note
                ));
            } else {
                throw new Error(data.error || 'Failed to restore folder');
            }
        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("restoreFolder error: ", error);
            }
            throw error;
        }
    }, [fetchWithAuth, isTokenExpiredError, setAllNotes]);

    const deleteFolderPermanently = useCallback(async (folderId: string) => {
        try {
            const res = await fetchWithAuth(
                `${SERVER_URL}/api/folder/delete-folder/${folderId}`,
                {
                    method: 'DELETE',
                }
            );
            const data = await res.json();

            if (data.success) {
                setAllFolders((prev) => prev.filter((item) => item._id !== folderId));
                onDirectoryUpdate?.((prev) => prev.filter((item) => item._id !== folderId));
                setAllNotes?.((prevNotes) => prevNotes.filter((note) => note.parent !== folderId));
            }
            else {
                throw new Error(data.error || "Failed to delete folder");
            }

        } catch (error) {
            if (!isTokenExpiredError(error)) {
                console.error("deleteFolder error:", error);
            }
            throw error;
        }
    }, [fetchWithAuth, onDirectoryUpdate, isTokenExpiredError, setAllNotes]);

    return {
        allFolders,
        setAllFolders,
        getAllFolders,
        addFolder,
        updateFolder,
        pinFolder,
        unpinFolder,
        onFolderColorChange,
        moveFolderToTrash,
        restoreFolder,
        deleteFolderPermanently,
    }
};