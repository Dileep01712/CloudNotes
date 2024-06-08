import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login(props) {
    const [credentials, setCredentials] = useState({ email: '', password: '' })
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const SERVER_URL = process.env.REACT_APP_SERVER_URL;
    let navigate = useNavigate();

    const getUrl = (path) => {
        return SERVER_URL + path
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch(getUrl('/api/auth/login'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: credentials.email, password: credentials.password })
        });
        const json = await response.json();

        if (json.success) {
            localStorage.setItem('token', json.authtoken);
            props.showAlert("Logged in successfully", "success");
            navigate('/');
        }
        else {
            props.showAlert("Invalid details", "danger");
        }
    }

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    }

    return (
        <div className='signup-container mx-auto' id='SignIn' style={{ padding: '0px' }}>
            <form className="signup-form" onSubmit={handleSubmit} style={{ color: props.mode === 'light' ? 'black' : 'white' }}>
                <h2>Welcome Back ッ</h2>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className={`form-control ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'} ${focused ? 'focused' : ''}`} id="email" name='email' value={credentials.email} onChange={onChange} autoComplete="current-email" aria-describedby="emailHelp" onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="input-group" id='passwordField'>
                        <input type={showPassword ? 'text' : 'password'} className={`form-control ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'
                            } ${focused ? 'focused' : ''}`} id="password" name="password" value={credentials.password} onChange={onChange} required minLength={8}
                            autoComplete="current-password" onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)} />
                        <button type="button" className={`btn btn-light ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'
                            } ${focused ? 'focused' : ''}`} id='showButton' onClick={() => setShowPassword(!showPassword)} >
                            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} id='showPassword' />
                        </button>
                    </div>
                </div>
                <div className='button-container my-4'>
                    <button type="submit" className="btn btn-primary" id='signinButton'>Sign In</button>
                </div>
                <div className="form-group">
                    <span htmlFor="terms-text" id="term-text">Create an account <Link to="/signup"
                        id="terms-of-use-link">Sign Up</Link></span>
                </div>
            </form>
        </div>
    )
}

export default Login
