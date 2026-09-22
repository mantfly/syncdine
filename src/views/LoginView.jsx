import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import "/src/index.css"
import hero from "../img/hero.png";
import { Icon } from 'react-icons-kit';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import { eye } from 'react-icons-kit/feather/eye';
/**
 * View: presentational only. Form state (email, password) is local; on submit calls presenter callback.
 */
export function LoginView({ isLoading, error, onLogin, onGoogleLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isShown, setIsShown] = useState(false);
    const [icon, setIcon] = useState(eyeOff);
    const location = useLocation();
    const passwordRef = useRef(null);

    function togglePasswordVisibility() {
        const pos = passwordRef.current?.selectionStart;
        setIsShown(prev => !prev);
        setIcon(prev => prev === eyeOff ? eye : eyeOff);
        setTimeout(() => {
            passwordRef.current?.setSelectionRange(pos, pos);
        }, 0);
    }

    function onSubmitACB(e) {
        e.preventDefault();
        onLogin(email, password);
    }

    return (

        <div className="login">

            <div className="main">

                {/* — Image — */}
                <img src={hero} className="left-side-hero-image">
                </img>

                {/* — login — */}
                <div className="right-side-login">

                    <div className='auth-container'>
                        <h1>Login</h1>
                        <div className="auth-error-toast" role="alert" aria-live="polite">
                            {error && <>⚠️ {error}</>}
                        </div>
                        {/* Email field */}

                        <form onSubmit={onSubmitACB} className='form'>
                            <div className="form-group">
                                <label className="form-label" htmlFor="input-email">Email</label>
                                <div className="input">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input">
                                    <input
                                        ref={passwordRef}
                                        type={isShown ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="form-input"
                                    />
                                    <span onMouseDown={(e) => e.preventDefault()} onClick={togglePasswordVisibility} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                        <Icon icon={icon} />
                                    </span>
                                </div>
                            </div>

                            {/* Log In button */}
                            <button type="submit" disabled={isLoading} className="big-button">
                                <div className="button-shadow" />
                                {isLoading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="divider-row">
                            <div className="horizontal-divider" />
                            <span className="divider-label">Or continue with</span>
                            <div className="horizontal-divider" />
                        </div>

                        <button
                            onClick={onGoogleLogin}
                            disabled={isLoading}
                            className="google-btn"
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/3840px-Google_%22G%22_logo.svg.png" alt="Google" className="google-icon" />
                        </button>

                        <p className="divider-label">
                            Don't have an account? <Link to={`/register${location.search}`}>Register here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
