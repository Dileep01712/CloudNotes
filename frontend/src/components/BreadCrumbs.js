import React, { useContext } from "react";
import { Link } from "react-router-dom";
import noteContext from "../context/notes/noteContext";

const BreadCrumbs = () => {
    const context = useContext(noteContext);
    const { breadCrumbPath, setBreadCrumbPath, setCurrentFolderName } = context;

    const handleClick = (e) => {
        let flag = false;
        let res = breadCrumbPath.reduce((acc, val) => {
            if (val.name === e.target.name) {
                flag = true;
                acc.push(val);
            } else if (!flag) {
                acc.push(val);
            }
            return acc;
        }, [])
        setBreadCrumbPath(res);
        setCurrentFolderName(e.target.name);
    }

    return (
        <div aria-label="breadcrumb">
            <ol className="breadcrumb">
                {breadCrumbPath.map((directoryObj, index) => {
                    return <li key={index} className="breadcrumb-item active">
                        <Link to={'/' + directoryObj.url} style={{ textDecoration: "none" }} onClick={handleClick} name={directoryObj.name} >
                            {directoryObj.name}
                        </Link>
                    </li>
                })}
            </ol>
        </div>
    )
}

export default BreadCrumbs;