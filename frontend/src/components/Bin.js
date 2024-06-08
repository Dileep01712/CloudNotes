import React, { useContext, useEffect } from "react";
import noteContext from "../context/notes/noteContext";
import TrashNoteitem from "./TrashNoteItem";

const Bin = ({ mode, toggleMode, showAlert }) => {
    const context = useContext(noteContext);
    const { trashedNotes, getTrashedNotes } = context;

    useEffect(() => {
        getTrashedNotes();
        // eslint-disable-next-line
    }, []);

    return (
        <>
            {trashedNotes.length > 0 ?
                <div className={`signup-container ${mode === 'light' ? 'signupContainer-light' :
                    'signupContainer-dark'}`} id='Notes' style={{ width: '100%', boxShadow: 'none' }}>
                    <div className="row">
                        <h5 className="binTitle mb-4" style={{ textAlign: 'center', fontStyle: 'italic', color: mode === 'light' ? 'black' : 'white' }}>Notes in Trash are deleted after 30 days.</h5>
                        {trashedNotes.map((note) => {
                            return <TrashNoteitem key={note._id} note={note} mode={mode} showAlert={showAlert} />
                        })}
                    </div>
                </div>
                :
                <div className={`signup-container ${mode === 'light' ? 'signupContainer-light' :
                    'signupContainer-dark'}`} id='Notes' style={{ width: '95%', boxShadow: 'none' }}>
                    <div className="row">
                        <h5 className="binTitle mb-4" style={{ textAlign: 'center', fontStyle: 'italic', color: mode === 'light' ? 'black' : 'white' }}>Notes in Trash are deleted after 30 days.</h5>
                        <div className="emptyTrash" style={{ position: 'relative', top: '125px' }}>
                            <i className="fa-solid fa-trash-can" id="emptyTrash" style={{ color: mode === 'light' ? '#e5e5e5' : '#37383a' }}></i>
                            <h4 className="my-4">No notes in Trash</h4>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default Bin;