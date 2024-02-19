import React, { useContext, useEffect } from "react"
import noteContext from "../context/notes/noteContext";
import { useLocation, useNavigate } from "react-router-dom";

const FolderItem = (props) => {
    const { folder, mode, showAlert } = props;
    const context = useContext(noteContext);
    const { getDirectoryContent, deleteFolder, breadCrumbPath, setBreadCrumbPath, setCurrentFolderName } = context;
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
            },{
                name: folder.name,
                url: formatFolderName(folder.name) + folder._id
            }])
        }
        setCurrentFolderName(folder.name);
    }

    const handleDeleteFolderClick = (e) => {
        e.stopPropagation();
        deleteFolder(folder);
        showAlert("deleted Successfully", "success");
    }
    return (
        <div className='col-md-4' onClick={handleClick}>
            <div className=" card  my-1" title="folder">
                <div className={`card-body-folder pb-1 ${mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="">{folder.name}</div>
                    <div>
                        <i className="fa-regular fa-folder"></i>
                        <i className="fa-solid fa-trash" title="Delete folder" onClick={handleDeleteFolderClick}></i>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default FolderItem;