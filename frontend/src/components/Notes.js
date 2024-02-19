import React, { useContext, useEffect, useRef, useState } from 'react';
import noteContext from '../context/notes/noteContext';
import NoteItem from './NoteItem';
import FolderItem from "./FolderItem";
import AddNote from './AddNote';
import { useNavigate, useParams } from 'react-router-dom';
import BreadCrumbs from './Breadcrumbs';
function Notes(props) {
    const context = useContext(noteContext);
    const { directoryId } = useParams();
    const { editNote, deleteNote, pinnedNotes, getPinnedNotes, directoryContent, getDirectoryContent, breadCrumbPath, setBreadCrumbPath, getPath, setCurrentFolderName, currentFolderName, getAllFolderPaths } = context;
    let navigate = useNavigate();
    const descriptionRef = useRef("");
    const titleRef = useRef("");
    const [note, setNote] = useState({ _id: "", etitle: "", edescription: "", etag: "", parentName: "" })
    const ref = useRef(null);
    const refClose = useRef(null);
    const [isDisabledUpdate, setIsDisabledUpdate] = useState(true)
    const [allFoldersPath, setAllFoldersPath] = useState([]);
    const { mode } = props;

    useEffect(() => {
        (
            async () => {
                if (localStorage.getItem('token')) {
                    getPinnedNotes();
                    if (directoryId !== undefined) {
                        let arr = directoryId.split('-');
                        let objectId = arr[arr.length - 1];
                        let temp = await getPath(objectId);
                        if (breadCrumbPath.length === 0) {
                            setBreadCrumbPath([{
                                name: 'Home',
                                url: ''
                            }, ...temp]);
                        }
                        setCurrentFolderName(temp[temp.length - 1].name);
                    } else {
                        setBreadCrumbPath([]);
                    }
                }
                else {
                    navigate('/signup');
                }
            }
        )();
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        getDirectoryContent(directoryId);
        // eslint-disable-next-line
    }, [directoryId]);

    const updateNote = async (currentNote) => {
        ref.current.click();
        setNote({ _id: currentNote._id, etitle: currentNote.title, edescription: currentNote.description, etag: currentNote.tag })
        descriptionRef.current.innerHTML = currentNote.description;
        titleRef.current.innerHTML = currentNote.title;
        const paths = await getAllFolderPaths();
        setAllFoldersPath(paths);
    }

    const handleClick = async(e) => {
        e.preventDefault();
        if (note.etitle.length === 0 && note.edescription.length === 0) {
            await deleteNote(note);
            props.showAlert("deleted Successfully", "success");
        } else {
            await editNote(note._id, note.etitle, note.edescription, note.etag, null, null, note.parentName)
            props.showAlert("Updated Successfully", "success");
        }
        refClose.current.click();
    }

    const handleCloseClick = () => {
        refClose.current.click();
        setIsDisabledUpdate(true);
    }

    const onChange = (e) => {
        setIsDisabledUpdate(false);
        setNote({ ...note, [e.target.name]: e.target.value })
    }

    const handleContentChange = (e) => {
        const cleanedContent = e.target.innerHTML.replace(/&nbsp;/g, " ").trim();
        setNote({ ...note, [e.target.getAttribute('name')]: cleanedContent });
        setIsDisabledUpdate(false);
    };

    const getFirstDir = (path) => {
        let temp = path.split('/');
        const parentName = temp[temp.length-2];
        return parentName;
    }

    const handleChangeFolder = async(e) => {
        const parentName = getFirstDir(e.target.innerText);
        setNote({...note, parentName});
        setIsDisabledUpdate(false);
    }

    return (
        <>
            <AddNote showAlert={props.showAlert} mode={mode} path={directoryId} />
            <button type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#exampleModal" ref={ref}></button>
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" >
                    <div className={`modal-content ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`}>
                        <div className="modal-body">
                            <form className="my-3" style={{ color: props.mode === 'light' ? 'black' : 'white' }}>
                                <div className="mb-2">
                                    <label htmlFor="title" className="form-label">Title</label>
                                    <div className={`form-control ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`} id="title" name="etitle" contentEditable={true}
                                        aria-describedby="emailHelp" onInput={handleContentChange} required ref={titleRef} data-placeholder="Required" onFocus={(e) => e.target.classList.add('focused')} onBlur={(e) => e.target.classList.remove('focused')} onPaste={(e) => {
                                            e.preventDefault();
                                            document.execCommand("insertText", false, e.clipboardData.getData('text/plain'));
                                        }}>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <div className={`form-control ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`} id="description" name="edescription" contentEditable={true} onInput={handleContentChange} required ref={descriptionRef} data-placeholder="Required" onFocus={(e) => e.target.classList.add('focused')} onBlur={(e) => e.target.classList.remove('focused')} onPaste={(e) => {
                                        e.preventDefault();
                                        document.execCommand("insertText", false, e.clipboardData.getData('text/plain'));
                                    }} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="tag" className="form-label">Tag</label>
                                    <input type="text" className={`form-control ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`} id="tag" name="etag" value={note.etag} onChange={onChange} placeholder='Optional' onFocus={(e) => e.target.classList.add('focused')} onBlur={(e) => e.target.classList.remove('focused')} />
                                </div>
                                <div className='mb-3'>
                                    <label htmlFor="Current path" className="form-label">Note is in {currentFolderName} folder, to change select folder</label>
                                    <div className="dropdown">
                                        <div className="btn btn-secondary dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            {note.parentName ? note.parentName: 'Change folder'}
                                        </div>
                                        <ul className="dropdown-menu">
                                            {
                                                allFoldersPath.map((path) => {
                                                    return <li key={path} className={`dropdown-item ${getFirstDir(path) === note.parentName && 'active-path'}`} onClick={handleChangeFolder}>{path}</li>
                                                })
                                            }
                                        </ul>
                                    </div>

                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" ref={refClose} onClick={handleCloseClick}>Close</button>
                            <button type="button" className="btn btn-primary" disabled={isDisabledUpdate} onClick={handleClick}>Update Note</button>
                        </div>
                    </div>
                </div>
            </div>
            {pinnedNotes.length > 0 && (
                <div className={`signup-container ${props.mode === 'light' ? 'signupContainer-light' :
                    'signupContainer-dark'}`} id='Notes' style={{ width: '95%', boxShadow: 'none' }}>
                    <div className="row">
                        <h3 className="my-1 mb-4" style={{ textAlign: 'center', color: props.mode === 'light' ? 'black' : 'white' }}>Pinned</h3>
                        {pinnedNotes.map((note) => {
                            return <NoteItem note={note} key={note._id} showAlert={props.showAlert} updateNote={updateNote} mode={mode} isPinned={true} path={directoryId} />
                        })}
                    </div>
                </div>
            )}
            {directoryId !== undefined ? <BreadCrumbs /> : <h3 className="my-1 mb-4" style={{ textAlign: 'center', color: props.mode === 'light' ? 'black' : 'white' }}>Your Notes & Folders</h3>}
            <div className={`signup-container ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`} id='Notes' style={{ width: '95%', boxShadow: 'none' }}>
                <div className="row">
                    {directoryContent.map((item) => {
                        // item can be note or folder depends on item.typeName
                        if (item.typeName === 'note') {
                            return <NoteItem note={item} key={item._id} showAlert={props.showAlert} updateNote={updateNote} mode={mode} isPinned={false} path={directoryId} />
                        } else if (item.typeName === 'folder') {
                            return <FolderItem folder={item} key={item._id} mode={mode} showAlert={props.showAlert} />
                        }
                        return <></>
                    })}
                </div>
            </div>
        </>
    )
}

export default Notes