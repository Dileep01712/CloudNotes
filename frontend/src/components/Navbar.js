import '../App.css';
import React, { useContext, useRef } from 'react'
import { Link, useLocation, useNavigate } from "react-router-dom";
import noteContext from '../context/notes/noteContext';

function Navbar(props) {
    let location = useLocation();
    let navigate = useNavigate();
    let context = useContext(noteContext);
    const folderIconRef = useRef(null);
    const { createFolderRef } = context;

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    }

    const handleCreateFolderClick = () => {
        // Access the div with id 'folderIcon' using the ref
        if (folderIconRef.current) {
            console.log(folderIconRef.current);
            // Do whatever you want with the div
        }
    }

    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">CloudNotes</Link>
                <button className="navbar-toggler  bg-white" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === "/" ? "nav-link-active" : ""}`} to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === "/bin" ? "nav-link-active" : ""}`} to="/bin">Trash</Link>
                        </li>

                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === "/about" ? "nav-link-active" : ""}`} to="/about">About</Link>
                        </li>
                    </ul>
                    <div className="navIcons mx-2">
                        <i className="fa-solid fa-moon" id="moonIcons" onClick={props.toggleMode} ></i>
                    </div>
                    {!localStorage.getItem('token') ? <form className="d-flex" role="search">
                        <Link className="btn btn-primary mx-1" to="/login" role="button">Sign In</Link>
                        <Link className="btn btn-primary mx-3" to="/signup" role="button">Sign Up</Link>
                    </form> : <button className="btn btn-primary mx-1" onClick={handleLogout}>Sign Out</button>}
                </div>
            </div >
        </nav >
    )
}

export default Navbar
