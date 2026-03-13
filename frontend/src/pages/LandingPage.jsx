import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>BankingApp</h1>
        <div className="landing-header-actions">
          <Link to="/login" className="btn-secondary">Login</Link>
          <Link to="/register" className="btn-primary">Register</Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-content">
          <h2>Secure Ledger-Based Banking System</h2>
          <p>
            Manage accounts and transfer money with confidence using reliable
            ledger-based accounting, idempotent transactions, and clear
            financial history.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn-primary">Login</Link>
            <Link to="/register" className="btn-secondary">Register</Link>
          </div>
        </div>

        <div className="hero-illustration" aria-hidden="true">
          <div className="hero-card">
            <span className="hero-icon">🔒</span>
            <h3>Secure Transfers</h3>
            <p>Protected authentication and verified account movements.</p>
          </div>
          <div className="hero-card">
            <span className="hero-icon">📘</span>
            <h3>Ledger Accuracy</h3>
            <p>Every transaction is traceable with complete history.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;