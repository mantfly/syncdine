import { Link } from 'react-router-dom';
import logo from "../img/logo.svg";

export function NavigationBarView({ logoutButton, onLogoClick }) {
  return (
    <nav className="navigation">
      <Link to="/" className="nav-logo" onClick={onLogoClick}>
        <img className="logo" alt="logo" src={logo} />
        <span className="brand-name">SyncDine</span>
      </Link>

      <div className="nav-right">
        <Link to="/profile" className="nav-action-btn">Profile</Link>
        {logoutButton}
      </div>
    </nav>
  );
}

