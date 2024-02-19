import React, { useContext, useEffect } from "react";
import noteContext from "../context/notes/noteContext";
import TrashNoteitem from "./TrashNoteItem";

const Bin = ({ mode, showAlert }) => {
    const context = useContext(noteContext);
    const { trashedNotes, getTrashedNotes } = context;

    useEffect(() => {
        getTrashedNotes();
        // eslint-disable-next-line
    },[]);

    return (
        <>
            {trashedNotes.length > 0 ?
                <div className={`signup-container ${mode === 'light' ? 'signupContainer-light' :
                    'signupContainer-dark'}`} id='Notes' style={{ width: '95%', boxShadow: 'none' }}>
                    <div className="row">
                        <h3 className="my-1 mb-4" style={{ textAlign: 'center', color: mode === 'light' ? 'black' : 'white' }}>Recycle Bin</h3>
                        {trashedNotes.map((note) => {
                            return <TrashNoteitem key={note._id} note={note} mode={mode} showAlert={showAlert}/>
                        })}
                    </div>
                </div>
                : 
                <div className={`${mode === 'light' ? 'signupContainer-light' :
                'signupContainer-dark'}`}>
                    <h1>Bin is empty</h1>
                </div>}
        </>
    )
}

export default Bin;