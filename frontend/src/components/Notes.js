import React, { useContext, useEffect, useRef, useState } from 'react';
import noteContext from '../context/notes/noteContext';
import NoteItem from './NoteItem';
import AddNote from './AddNote';
import { useNavigate, useParams } from 'react-router-dom';

function Notes(props) {
    const context = useContext(noteContext);
    const { directoryId } = useParams();
    const { editNote, deleteNote, pinnedNotes, getPinnedNotes, directoryContent, getDirectoryContent, breadCrumbPath, setBreadCrumbPath, getPath, setCurrentFolderName, getAllFolderPaths } = context;
    let navigate = useNavigate();
    const descriptionRef = useRef("");
    const titleRef = useRef("");
    const [note, setNote] = useState({ _id: "", etitle: "", edescription: "", etag: "", parentName: "" })
    const ref = useRef(null);
    const refClose = useRef(null);
    const [isDisabledUpdate, setIsDisabledUpdate] = useState(true)
    // eslint-disable-next-line
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

    const handleClick = async (e) => {
        e.preventDefault();
        if (note.etitle.length === 0 && note.edescription.length === 0) {
            await deleteNote(note);
            props.showAlert("Deleted successfully", "success");
        } else {
            await editNote(note._id, note.etitle, note.edescription, note.etag, null, null, note.parentName)
            props.showAlert("Updated successfully", "success");
        }
        refClose.current.click();
    }

    const handleCloseClick = () => {
        refClose.current.click();
        setIsDisabledUpdate(true);
    }

    // eslint-disable-next-line
    const onChange = (e) => {
        // setIsDisabledUpdate(false);
        setNote({ ...note, [e.target.name]: e.target.value })
    }

    const handleContentChange = (e) => {
        const cleanedContent = e.target.innerHTML.replace(/&nbsp;/g, " ").trim();
        setNote({ ...note, [e.target.getAttribute('name')]: cleanedContent });
        // setIsDisabledUpdate(false);
    };

    return (
        <div>
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
                    'signupContainer-dark'}`} id='pinnedNotes' style={{ width: '100%', boxShadow: 'none' }}>
                    <div className="row">
                        <h6 className="my-1 mx-3" style={{ color: props.mode === 'light' ? 'black' : 'white' }}>Pinned</h6>
                        {pinnedNotes.map((note) => {
                            return <NoteItem note={note} key={note._id} showAlert={props.showAlert} updateNote={updateNote} mode={mode} isPinned={true} path={directoryId} />
                        })}
                    </div>
                </div>
            )}

            <div className={`signup-container ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`} id='Notes' style={{ width: '100%', boxShadow: 'none' }}>
                <div className="row">
                    {pinnedNotes.length > 0 && (
                        <h6 className="my-1 mx-3" style={{ color: props.mode === 'light' ? 'black' : 'white' }}>Others</h6>
                    )}

                    {directoryContent.map((item) => {
                        // item can be note or folder depends on item.typeName
                        if (item.typeName === 'note') {
                            return <NoteItem note={item} key={item._id} showAlert={props.showAlert} updateNote={updateNote} mode={mode} isPinned={false} path={directoryId} />
                        }
                        return <></>
                    })}
                </div>
            </div>
        </div>
    )
}

export default Notes