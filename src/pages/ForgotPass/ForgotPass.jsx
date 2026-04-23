import { useState } from "react";
import { Link } from "react-router-dom";
import "./ForgotPass.css";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setIsSubmitted(true);
    console.log("Password reset requested for:", email);
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <h2 className="forgot-password-title">Forgot Password</h2>

        {!isSubmitted ? (
          <>
            <p className="forgot-password-lead">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="forgot-password-field">
                <label htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className={error ? "forgot-password-input--error" : undefined}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
                {error ? <p className="forgot-password-error">{error}</p> : null}
              </div>

              <button type="submit" className="forgot-password-submit">
                Send Reset Link
              </button>

              <div>
                <Link to="/login" className="forgot-password-back">
                  Back to Login
                </Link>
              </div>
            </form>
          </>
        ) : (
          <div className="forgot-password-success">
            <div className="forgot-password-success-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>Check Your Email</h3>
            <p>
              {"We've sent a password reset link to"}
              <br />
              <span className="forgot-password-success-email">{email}</span>
            </p>
            <p className="forgot-password-success-hint">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button type="button" onClick={() => setIsSubmitted(false)}>
                try again
              </button>
            </p>
            <Link to="/login" className="forgot-password-submit">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
