import React, { useState, useRef, useEffect } from 'react';
import { Users, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

export default function AuthPage({ onLogin, onSignup }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const emailRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Focus appropriate input when switching modes
    if (mode === 'signup' && nameRef.current) {
      nameRef.current.focus();
    } else if (mode === 'login' && emailRef.current) {
      emailRef.current.focus();
    }
  }, [mode]);

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setFullName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Small delay for feel
    await new Promise(r => setTimeout(r, 400));

    let result;
    if (mode === 'signup') {
      result = onSignup(fullName, email, password);
    } else {
      result = onLogin(email, password);
    }

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
    }
    // If success, the parent will unmount this component
  };

  return (
    <div className="auth-page">
      {/* Animated background */}
      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb-1"></div>
        <div className="auth-bg-orb auth-bg-orb-2"></div>
        <div className="auth-bg-orb auth-bg-orb-3"></div>
        <div className="auth-bg-grid"></div>
      </div>

      <div className={`auth-container ${mounted ? 'auth-mounted' : ''}`}>
        {/* Left side - branding panel (hidden on mobile) */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-brand-logo">
              <div className="auth-brand-icon">
                <Users strokeWidth={2.5} />
              </div>
              <span className="auth-brand-name">NEXUS.</span>
            </div>
            
            <h2 className="auth-brand-headline">
              Your Outreach<br />Command Center
            </h2>
            <p className="auth-brand-sub">
              Manage leads, track conversations, and close deals — all from one powerful dashboard.
            </p>

            <div className="auth-features">
              {[
                { icon: Zap, label: 'Lightning-fast lead tracking' },
                { icon: Shield, label: 'Secure local data storage' },
                { icon: Sparkles, label: 'Smart pipeline management' },
              ].map((feat, i) => (
                <div key={i} className="auth-feature-item" style={{ animationDelay: `${0.6 + i * 0.15}s` }}>
                  <div className="auth-feature-icon">
                    <feat.icon size={16} />
                  </div>
                  <span>{feat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-brand-footer">
            <span>© 2026 NEXUS CRM</span>
          </div>
        </div>

        {/* Right side - form panel */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            {/* Mobile logo */}
            <div className="auth-mobile-logo">
              <div className="auth-brand-icon-sm">
                <Users strokeWidth={2.5} size={20} />
              </div>
              <span>NEXUS.</span>
            </div>

            <div className="auth-form-header">
              <h1 className="auth-form-title">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="auth-form-subtitle">
                {mode === 'login' 
                  ? 'Sign in to access your CRM dashboard' 
                  : 'Start managing your leads in seconds'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="auth-error">
                  <div className="auth-error-dot"></div>
                  {error}
                </div>
              )}

              {mode === 'signup' && (
                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-name">Full Name</label>
                  <div className="auth-input-wrap">
                    <User className="auth-input-icon" size={18} />
                    <input
                      ref={nameRef}
                      id="auth-name"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="auth-input"
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-email">Email Address</label>
                <div className="auth-input-wrap">
                  <Mail className="auth-input-icon" size={18} />
                  <input
                    ref={emailRef}
                    id="auth-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-password">Password</label>
                <div className="auth-input-wrap">
                  <Lock className="auth-input-icon" size={18} />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input auth-input-password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-eye-btn"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="auth-spinner"></div>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-switch">
              <span className="auth-switch-text">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              </span>
              <button onClick={switchMode} className="auth-switch-btn" type="button">
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
