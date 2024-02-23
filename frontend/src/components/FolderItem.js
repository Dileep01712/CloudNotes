import React, { useContext, useEffect, useState } from "react"
import noteContext from "../context/notes/noteContext";
import { useLocation, useNavigate } from "react-router-dom";

const FolderItem = (props) => {
    const { folder, mode, showAlert } = props;
    const context = useContext(noteContext);
    const { getDirectoryContent, deleteFolder, breadCrumbPath, setBreadCrumbPath, setCurrentFolderName } = context;
    const [showOptions, setShowOptions] = useState(false);
    let navigate = useNavigate();
    let location = useLocation();

    useEffect(() => {
        getDirectoryContent(location.pathname);
        //eslint-disable-next-line
    }, [location])

    const formatFolderName = (str) => {
        const formattedString = str.replace(/[^\w\s]/gi, '');
        const finalString = formattedString.replace(/\s+/g, '-');
        return finalString ? finalString + '-' : finalString;
    }

    const handleClick = async () => {
        navigate(`/${formatFolderName(folder.name)}${folder._id}`);
        if (breadCrumbPath.length > 0) {
            setBreadCrumbPath([...breadCrumbPath, {
                name: folder.name,
                url: formatFolderName(folder.name) + folder._id
            }])
        } else {
            setBreadCrumbPath([{
                name: 'Home',
                url: ''
            }, {
                name: folder.name,
                url: formatFolderName(folder.name) + folder._id
            }])
        }
        setCurrentFolderName(folder.name);
    }

    const handleDeleteFolderClick = (e) => {
        e.stopPropagation();
        deleteFolder(folder);
        showAlert("Deleted successfully", "success");
    }

    const handleIconClick = () => {
        setShowOptions(!showOptions);
    };

    const handleRename = () => {
        // Your logic for renaming
        alert('Rename clicked');
    };

    const handleDetails = () => {
        // Your logic for renaming
        alert('Rename clicked');
    };

    return (
        <div className='col-md-2 col-folder'>
            <div className=" card my-2 border" id="folderItem">
                <div className={`card-body-folder ${mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`}>
                    <div className="ms-1 mb-2 folderTitle">{folder.name}</div>
                    <div className="verticalIcon">
                        <i className="fa-solid fa-ellipsis-vertical" onClick={handleIconClick}></i>
                    </div>
                    {showOptions && (
                        <ul className={`optionsList border ${mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`} style={{ color: props.mode === 'light' ? 'black' : 'white' }}>
                            <div className="listItems">
                                <div className="firstDiv border-bottom">
                                    <i className="fa-solid fa-pen" style={{ backgroundColor: 'transparent', cursor: 'default' }}></i>
                                    <li className="mx-1" onClick={handleRename}>Rename</li>
                                </div>
                                <div className="secondDiv border-bottom">
                                    <i className="fa-solid fa-circle-info" style={{ backgroundColor: 'transparent', cursor: 'default' }}></i>
                                    <li className="mx-1" onClick={handleDetails}>Details</li>
                                </div>
                                <div className="thirdDiv">
                                    <i className="fa-solid fa-trash" style={{ backgroundColor: 'transparent', cursor: 'default' }}></i>
                                    <li className="mx-1" onClick={handleDeleteFolderClick}>Delete</li>
                                </div>
                            </div>
                        </ul>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'center' }} onClick={handleClick}>
                        <i className="fa-solid fa-folder"></i>
                    </div>
                </div>
            </div>
        </div >
    )
}
export default FolderItem;