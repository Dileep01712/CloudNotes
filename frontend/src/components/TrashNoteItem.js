import React, { useContext, useState, useRef, useEffect } from "react";
import noteContext from "../context/notes/noteContext";

const TrashNoteitem = ({ note, mode, showAlert }) => {
    const context = useContext(noteContext);
    const { trashedNotes, setTrashedNotes, editNote, deleteNote } = context;
    const [hide, setHide] = useState(false);
    const descriptionRef = useRef(null);
    const titleRef = useRef(null);

    const deleteDate = new Date(note.expireAt);
    const currentDate = new Date();
    const remainingDays = Math.round((deleteDate - currentDate) / (1000 * 84600));

    useEffect(() => {
        descriptionRef.current.innerHTML = note.description;
        titleRef.current.innerHTML = note.title;
        // eslint-disable-next-line
    }, [])

    const handleMouseEnter = () => {
        setHide(true);
    }

    const handleMouseExit = () => {
        setHide(false);
    }

    const restore = async () => {
        await editNote(note._id, note.title, note.description, note.tag, null, 'remove');
        setTrashedNotes(trashedNotes.filter(({ _id }) => _id !== note._id));
        showAlert("Note restored successfully", "success")
    }

    const handleDelete = async () => {
        await deleteNote(note);
        setTrashedNotes(trashedNotes.filter(({ _id }) => _id !== note._id));
        showAlert("Note deleted successfully", "success")
    }

    return (
        <div className='col-md-3 my-2'>
            <div className="cardParent card  my-1" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseExit}>
                <div className={`card-body ${mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`}>
                    <span className="badge bg-primary">{remainingDays} days</span>
                    <div className="card-title mb-3" contentEditable={false} ref={titleRef}></div>
                    <div className="card-text" contentEditable={false} ref={descriptionRef}></div>
                    <div className={`icons ${mode === 'light' ?
                        'signupContainer-light' : 'signupContainer-dark'}`} style={hide ? {} : {
                            visibility: 'hidden'
                        }}>
                        <i className="fa-solid fa-trash" title="Delete forever" onClick={(e) => {
                            handleDelete();
                            e.stopPropagation();
                        }}></i>
                        <i className="fa-solid fa-trash-can-arrow-up" title="Restore" onClick={restore}></i>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrashNoteitem;