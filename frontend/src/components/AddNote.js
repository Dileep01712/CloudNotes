import React, { useContext, useState, useRef } from 'react';
import noteContext from '../context/notes/noteContext';

function AddNote(props) {
    const context = useContext(noteContext);
    const { addNote, createFolder, currentFolderName, createFolderRef } = context;
    const descriptionRef = useRef("");
    const titleRef = useRef("");

    const [note, setNote] = useState({ title: "", description: "", tag: "" })
    const [folderName, setFolderName] = useState("");

    const handleClick = (e) => {
        e.preventDefault();
        addNote(note.title, note.description, note.tag, props.path);
        descriptionRef.current.innerHTML = "";
        titleRef.current.innerHTML = "";
        props.showAlert("Added Successfully", "success");
    }
    const isDescriptionEmpty = !note.description.trim();

    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value })
    }

    const handleContentChange = (e) => {
        const cleanedContent = e.target.innerHTML.replace(/&nbsp;/g, " ").trim();
        setNote({ ...note, [e.target.getAttribute('name')]: cleanedContent });
    };
    
    const handleCreateFolderClick = () => {
        setFolderName("");
        createFolder(folderName, props.path);
        props.showAlert("Created folder Successfully", "success");
    }

    const handlefolderName = (e) => {
        setFolderName(e.target.value);
    }
    return (
        <>
            <div className={`signup-container mt-3 mb-5 ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`} id='addNote' style={{ width: '70%' }} >
                <div>
                    <form className="form mx-auto" id='addNote' style={{ width: '90%' }}>
                        <p style={{textAlign: 'center'}}>Inside {currentFolderName} folder</p>
                        <h1 style={{ textAlign: 'center' }}>Take a note...</h1>
                        <div className="mb-2">
                            <label htmlFor="title" className="form-label">Title</label>
                            <div className={`form-control ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`} id="title" name="title" contentEditable={true}
                                aria-describedby="emailHelp" onInput={handleContentChange} required ref={titleRef} data-placeholder="Required" onFocus={(e) => e.target.classList.add('focused')} onBlur={(e) => e.target.classList.remove('focused')} onPaste={(e) => {
                                    e.preventDefault();
                                    document.execCommand("insertText", false, e.clipboardData.getData('text/plain'));
                                }} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Description</label>
                            <div className={`form-control ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`} id="description" name="description" contentEditable={true} onInput={handleContentChange} required ref={descriptionRef} data-placeholder="Required" onFocus={(e) => e.target.classList.add('focused')} onBlur={(e) => e.target.classList.remove('focused')} onPaste={(e) => {
                                e.preventDefault();
                                document.execCommand("insertText", false, e.clipboardData.getData('text/plain'));
                            }} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="tag" className="form-label">Tag</label>
                            <input type="text" className={`form-control ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`} id="tag" name="tag" value={note.tag} onChange={onChange} placeholder='Optional' onFocus={(e) => e.target.classList.add('focused')} onBlur={(e) => e.target.classList.remove('focused')} />
                        </div>
                        <button type="submit" className="btn btn-primary mb-3" disabled={!note.title.trim() || isDescriptionEmpty} onClick={handleClick} >Add Note</button>
                    </form>
                </div>
            </div>
            <button type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#exampleModal1" ref={createFolderRef}></button>
            <div className="modal fade" id="exampleModal1" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" >
                    <div className={`modal-content ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`}>
                        <div className="modal-body">
                            <form onSubmit={(e)=>{e.preventDefault()}} className="my-3" style={{ color: props.mode === 'light' ? 'black' : 'white' }}>
                                <div className="mb-2">
                                    <label htmlFor="Folder name" className="form-label">Folder Name</label>
                                    <input type="text" className={`form-control ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`} id="folderName" name="folderName" value={folderName} onChange={handlefolderName} placeholder='Enter folder name' onFocus={(e) => e.target.classList.add('focused')} onBlur={(e) => e.target.classList.remove('focused')} autoComplete='off'/>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={handleCreateFolderClick}>Create folder</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddNote
