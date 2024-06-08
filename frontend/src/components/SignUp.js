import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function SignUp(props) {
    const [credentials, setCredentials] = useState({ name: '', email: '', password: '', cpassword: '' })
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    let navigate = useNavigate();
    const SERVER_URL = process.env.REACT_APP_SERVER_URL;

    const getUrl = (path) => {
        return SERVER_URL + path
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password } = credentials;
        const response = await fetch(getUrl("/api/auth/createuser"), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        const json = await response.json();

        if (json.success) {
            localStorage.setItem('token', json.authtoken);
            props.showAlert("Account Created Successfully", "success");
            navigate('/');
        }
        else {
            props.showAlert("Invalid Credentials", "danger");
        }
    }

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    }

    return (
        <div className={`signup-container mx-auto' id='SignUp' ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'} `} style={{ padding: '0px' }}>
            <form className="signup-form" onSubmit={handleSubmit} style={{ color: props.mode === 'light' ? 'black' : 'white' }}>
                <h2>Create an Account</h2>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name:</label>
                    <input type="text" className={`form-control ${props.mode === 'light' ? 'signupContainer-light' : 'signupContainer-dark'} ${focused ? 'focused' : ''}`} id="name" name='name' value={credentials.name} onChange={onChange} required aria-describedby="emailHelp" onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
                </div>
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
                <div className="form-group">
                    <span htmlFor="terms-text" id="terms-text">By creating an account, you agree to CloudNotes <a href="/#" id="privacy-policy-link">Privacy Policy</a> and <a href="/#" id="terms-of-use-link">Terms of Use</a>.</span>
                </div>
                <div className='button-container my-3'>
                    <button type="submit" className="btn btn-primary" id='signupButton'>Sign Up</button>
                </div>
                <div className="form-group">
                    <span htmlFor="terms-text" id="term-text">Already have an account? <Link to="/login"
                        id="terms-of-use-link">Sign In</Link></span>
                </div>
            </form>
        </div>
    )
}

export default SignUp
