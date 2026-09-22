import logo from "../img/logo.svg";
import React from 'react';
import Icon from 'react-icons-kit';
import {group} from 'react-icons-kit/fa/group';
import {ic_favorite} from 'react-icons-kit/md/ic_favorite';
import {random} from 'react-icons-kit/fa/random'
export function LandingView({ onGetStarted, onLogin }) {
  return (
    <div className="landing-premium-wrapper">
      {/* Decorative Background Elements */}
      <div className="landing-bg-shape shape-1"></div>
      <div className="landing-bg-shape shape-2"></div>

      {/* Navbar overlay for Landing page */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <img className="logo" alt="logo" src={logo} />
          <span className="brand-name">SyncDine</span>
        </div>
        <div className="landing-nav-actions">
          <button className="landing-secondary-btn" onClick={onLogin}>Log In</button>
        </div>
      </nav>

      <main className="landing-main-content">
        <section className="landing-hero">
          <h1 className="hero-title">
            Stop Debating. <br />
            <span className="text-gradient">Start Dining.</span>
          </h1>
          <p className="hero-subtitle">
            Invite friends, swipe on nearby restaurants, and instantly find the perfect match.
            No more endless group chat debates.
          </p>
          <div className="hero-actions">
            <button className="landing-primary-btn" onClick={onGetStarted}>
              Sign Up
            </button>
          </div>
        </section>

        <section className="landing-features-grid">
          <div className="glass-card feature-card">
            <div className="feature-heading">
              <div className="feature-icon">
                <Icon icon={group} size={24} />
              </div>
              <h3>Create a Room</h3>
            </div>
            <p>Start a session and share the unique join code with your friends.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-heading">
              <div className="feature-icon">
                <Icon icon={random} size={24} />
              </div>
              <h3>Swipe</h3>
            </div>
            <p>Swipe right to crave, left to pass.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-heading">
              <div className="feature-icon">
               <Icon icon={ic_favorite} size={24} />
              </div>
              <h3>Match</h3>
            </div>
            <p>SyncDine instantly reveals the perfect dining spot you all agree on.</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} SyncDine. Say goodbye to dining debates.</p>
      </footer>
    </div>
  );
}
