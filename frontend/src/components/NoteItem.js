import React, { useContext, useState, useRef, useEffect } from 'react';
import noteContext from '../context/notes/noteContext';

function NoteItem(props) {
    const context = useContext(noteContext);
    const { editNote, setPinnedNotes, setDirectoryContent, directoryContent, pinnedNotes, setTrashedNotes, trashedNotes, formatParentPathName } = context;
    const { note, updateNote, isPinned, path } = props;
    
    const [hide, setHide] = useState(false);
    const descriptionRef = useRef(null);
    const titleRef = useRef(null);

    useEffect(() => {
        descriptionRef.current.innerHTML = note.description;
        titleRef.current.innerHTML = note.title;
        //eslint-disable-next-line
    }, [directoryContent, pinnedNotes])

    const handleMouseEnter = () => {
        setHide(true);
    }

    const handleMouseExit = () => {
        setHide(false);
    }

    const handlePinnedNote = async () => {
        await editNote(note._id, note.title, note.description, note.tag, Date.now());
        setPinnedNotes([note, ...pinnedNotes]);
        setDirectoryContent(directoryContent.filter(({ _id }) => {
            return _id !== note._id;
        }))
    }

    const handleUnPinnedNote = async () => {
        props.showAlert("Note unpinned successfully", "success");
        await editNote(note._id, note.title, note.description, note.tag, 'remove');
        setPinnedNotes(pinnedNotes.filter(({ _id }) => {
            return _id !== note._id;
        }))

        if ((formatParentPathName(path) === note.parent) || (path === undefined && note.parent === null)) {
            setDirectoryContent([note, ...directoryContent]);
        }
    }

    const moveToTrash = async () => {
        await editNote(note._id, note.title, note.description, note.tag, null, true);
        setTrashedNotes([note, ...trashedNotes]);
        let temp = directoryContent.filter(({ _id }) => _id === note._id);
        if (temp.length) {
            setDirectoryContent(directoryContent.filter(({ _id }) => _id !== note._id));
        } else {
            setPinnedNotes(pinnedNotes.filter(({ _id }) => _id !== note._id));
        }
        props.showAlert("Moved to trash", "success");
    }

    return (
        <div className='col-md-3 my-2' onClick={(e) => { updateNote(note) }}>
            <div className="cardParent card  my-1" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseExit}>
                <div className={`card-body pb-1 ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`}>
                    <div className="card-title mb-3" contentEditable={false} ref={titleRef}></div>
                    <div className={`navIcons position-absolute top-0 end-0 ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`}>
                        {!isPinned ?
                            <i className="fa-solid fa-thumbtack" title="Pin note" style={{
                                color: props.mode === 'light' ? 'lightColor' : 'darkColor',
                                visibility: hide ? '' : 'hidden'
                            }} onClick={(e) => { handlePinnedNote(); e.stopPropagation(); }} ></i>
                            :
                            <i className="fa-solid fa-thumbtack" title="Unpin note" style={{
                                color: props.mode === 'light' ? 'lightColor' : 'darkColor',
                                visibility: hide ? '' : 'hidden'
                            }} onClick={(e) => { handleUnPinnedNote(); e.stopPropagation(); }}></i>
                        }
                    </div>
                    <div className="card-text" contentEditable={false} ref={descriptionRef}></div>
                    <div className={`icons my-1 ${props.mode === 'light' ?
                        'signupContainer-light' : 'signupContainer-dark'}`}>
                        <i className="fa-solid fa-arrows-up-down-left-right" title="Move note" style={hide ? {} : { visibility: 'hidden' }} onClick={(e) => { e.stopPropagation(); }}></i>
                        <i className="fa-solid fa-trash mx-3" title="Delete note" style={hide ? {} : { visibility: 'hidden' }} onClick={(e) => { moveToTrash(); e.stopPropagation(); }}></i>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default NoteItem