import { useRef, useState } from "react";
import NoteContext from "../notes/noteContext";

const NoteSate = (props) => {
    const host = process.env.REACT_APP_SERVER_URL;
    const [directoryContent, setDirectoryContent] = useState([]);
    const [pinnedNotes, setPinnedNotes] = useState([]);
    const [trashedNotes, setTrashedNotes] = useState([]);
    const [breadCrumbPath, setBreadCrumbPath] = useState([]);
    const [currentFolderName, setCurrentFolderName] = useState("Home");
    const createFolderRef = useRef();

    const formatParentPathName = (str) => {
        if(!str || str === '/'){
            return undefined;
        }
        const arr = str.split('-');
        return arr[arr.length-1];
    }

    // ADD
    const addNote = async (title, description, tag, parent) => {
        parent = formatParentPathName(parent);
        // eslint-disable-next-line
        const data = {title, description, tag};
        if(parent){
            data.parent = parent;
        }
        const response = await fetch(`${host}/api/notes/addnote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "auth-token": localStorage.getItem('token')
            },
            body: JSON.stringify(data)
        });
        const newNote = await response.json();
        setDirectoryContent([newNote, ...directoryContent])
    }

    // EDIT
    const editNote = async (id, title, description, tag, pinnedAt, expireAt, parentName) => {
        const requestData = {};
        if (title) { requestData.title = title };
        if (description) { requestData.description = description };
        if (tag) { requestData.tag = tag };
        if (parentName) {requestData.parentName = parentName};

        if(typeof pinnedAt === 'number' && Date.now() >= pinnedAt){
            requestData.pinnedAt = {
                status: true,
                value: pinnedAt
            }
        } else if(pinnedAt === 'remove'){
            requestData.pinnedAt = {
                status: false
            }
        }

        if(expireAt === true){
            requestData.expireAt = {
                status: true,
            }
        } else if(expireAt === 'remove'){
            requestData.expireAt = {
                status: false,
            }
        }
        
        const noteData = await fetch(`${host}/api/notes/updatenote/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "auth-token": localStorage.getItem('token')
            },
            body: JSON.stringify(requestData)
        });
        const res = await noteData.json();
        let newNotes = directoryContent.filter((n) => n._id === id);
        if(newNotes.length){
            
            // setDirectoryContent(directoryContent.map((val)=>{
            //     if(val._id === id){
            //         return {...val, title, description, tag};
            //     }
            //     return val;
            // }))
            setDirectoryContent(directoryContent.reduce((acc, val) => {
                if(val._id === id && val.parent === res.note.parent){
                    acc.push({...val, title, description, tag, expireAt, pinnedAt, parent: parentName});
                }
                if(val._id !== id){
                    acc.push(val);
                }
                return acc;
            }, []))
        } else {
            setPinnedNotes(pinnedNotes.map((val) => {
                if(val._id === id){
                    return {...val, title, description, tag};
                }
                return val;
            }))
        }
    }

    // DELETE
    const deleteNote = async (note) => {
        await fetch(`${host}/api/notes/deletenote/${note._id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "auth-token": localStorage.getItem('token')
            }
        });
        let newNotes = directoryContent.filter((n) => n._id === note._id);
        if(newNotes.length){
            setDirectoryContent(directoryContent.filter((n) => n._id !== note._id))
        } else {
            setPinnedNotes(pinnedNotes.filter((n) => n._id !== note._id))
        }
    }

    const deleteFolder = async (folder) => {
        await fetch(`${host}/api/notes/deletefolder/${folder._id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "auth-token": localStorage.getItem('token')
            }
        });
        setDirectoryContent(directoryContent.filter((n) => n._id !== folder._id))
    }

    // Get pinned notes
    const getPinnedNotes = async () => {
        const response = await fetch(`${host}/api/notes/fetchallnotes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "auth-token": localStorage.getItem('token')
            }
        });
        const json = await response.json();
        
        setPinnedNotes(json.filter((val) => {
            return val.typeName === 'note' && val.pinnedAt && !val.expireAt;
        }));
    }

    //get trashed notes
    const getTrashedNotes = async() => {
        const response = await fetch(`${host}/api/notes/fetchallnotes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "auth-token": localStorage.getItem('token')
            }
        });
        const json = await response.json();

        setTrashedNotes(json.filter((val) => {
            return val.typeName === 'note' && val.expireAt;
        }))
    }

    // create folder
    const createFolder = async(name, parent) => {
        parent = formatParentPathName(parent);
        const sendData = {name};
        if(parent){
            sendData.parent = parent;
        }
        const data = await fetch(`${host}/api/notes/createFolder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "auth-token": localStorage.getItem('token')
            },
            body: JSON.stringify(sendData)
        })
        const directory = await data.json();
        if(data.status === 201){
            setDirectoryContent([directory, ...directoryContent])
        } else if(data.status === 409) {
            props.showAlert(directory.error, "danger")
        }
    }

    // get directory content based on directory name
    const getDirectoryContent = async(directoryId) => {
        directoryId = formatParentPathName(directoryId);
        if(!directoryId){
            directoryId = 'none';
        }
        const data = await fetch(`${host}/api/notes/fetch/${directoryId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "auth-token": localStorage.getItem('token')
            }
        })
        const directories = await data.json();
        setDirectoryContent(directories.filter((val) => {
            return !val.expireAt && !val.pinnedAt;
        }));
    }

    const getPath = async(objectId) => {
        const data = await fetch(`${host}/api/notes/path/${objectId}`, {
            method: 'GET',
            headers: {
                'Content-Type':'application/json',
                'auth-token': localStorage.getItem('token')
            }
        })
        const path = await data.json();
        return path;
    }

    const getAllFolderPaths = async() => {
        const data = await fetch(`${host}/api/notes/getAllFolderPaths`, {
            method: 'GET',
            headers: {
                'Content-Type':'application/json',
                'auth-token': localStorage.getItem('token')
            }
        })
        const path = await data.json();
        return path;
    }

    return (
        <NoteContext.Provider value={{ addNote, editNote, deleteNote, pinnedNotes, setPinnedNotes, getPinnedNotes, trashedNotes, setTrashedNotes, getTrashedNotes, createFolder, getDirectoryContent, directoryContent, setDirectoryContent, formatParentPathName, deleteFolder, breadCrumbPath, setBreadCrumbPath, getPath, currentFolderName, setCurrentFolderName, getAllFolderPaths, createFolderRef }}>
            {props.children}
        </NoteContext.Provider>
    )
}

export default NoteSate;