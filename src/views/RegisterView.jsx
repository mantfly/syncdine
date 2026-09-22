import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAvatarUrl, generateSeed } from "../api/avatarApi";
import hero from "../img/hero.png";
import refreshIcon from "../img/refresh.svg";
import { Icon } from 'react-icons-kit';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import { eye } from 'react-icons-kit/feather/eye';
/**
 * View: presentational only. Form state (name, email, password) is local; on submit calls presenter callback.
 */
export function RegisterView({ isLoading, error, onRegister, onGoogleLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [seed, setSeed] = useState(generateSeed());
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

  const refreshAvatar = () => {
    setSeed(generateSeed());
  };
  const avatarUrl = getAvatarUrl(seed);


  function onSubmitACB(e) {
    e.preventDefault();
    onRegister(name, email, password, avatarUrl);
  }

  return (
    <div className="login">
      <div className="main">
        {/* — Left hero image — */}
        <img src={hero} className="left-side-hero-image" alt="SyncDine hero" />

        {/* — Right register panel — */}
        <div className="right-side-login">

          <div className="auth-container">
            <div className="profile-header-row">
              <h1>Create your profile</h1>
            </div>

            <div className="auth-error-toast" role="alert" aria-live="polite">
              {error && <>⚠️ {error}</>}
            </div>

            <div className="profile-photo">
              <img src={avatarUrl} alt="avatar" className="profile-img" />
              <button
                className="profile-photo-refresh"
                onClick={refreshAvatar}
                aria-label="Refresh profile image"
              >
                <img className={refreshIcon} alt='refresh' src={refreshIcon} />
              </button>
            </div>

            <form onSubmit={onSubmitACB} className="form">
              <div className="form-group">
                <label className="form-label" htmlFor="input-name">
                  Name
                </label>
                <div className="input">
                  <input
                    id="input-name"
                    type="text"
                    value={name}
                    maxLength="20"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="input-email">
                  Email
                </label>
                <div className="input">
                  <input
                    id="input-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="input-password">
                  Password
                </label>
                <div className="input">
                  <input
                    ref={passwordRef}
                    id="input-password"
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



              <button type="submit" disabled={isLoading} className="big-button">
                <div className="button-shadow" />
                {isLoading ? 'Creating account...' : 'Finish'}
              </button>
            </form>

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
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/3840px-Google_%22G%22_logo.svg.png"
                alt="Google"
                className="google-icon"
              />
            </button>

            <p className="divider-label">
              Already have an account? <Link to={`/login${location.search}`}>Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
