import React from 'react';
import './Header.css';

export default function Header({ userEmail }) {
  return (
    <header className="site-header">
      <div className="site-brand">
        <div>
          <div className="brand-title">Cosmetic Analyzer</div>
          <div className="brand-sub">Smart ingredient safety</div>
        </div>
      </div>

      <div className="logo-placeholder">CA</div>

      <div className="header-right">
        {userEmail && <div className="user-email">{userEmail}</div>}
      </div>
    </header>
  );
}