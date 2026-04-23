import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { verifyEmail, resendVerificationCode } from "../../services/auth";
import logoWithText from '../../assets/logowithtext.png';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Get email from location state
  const email = location.state?.email;
  
  console.log("VerifyEmail component rendered, email from state:", email);

  // If no email, try to get from localStorage or redirect
  useEffect(() => {
    if (!email) {
      // Check if email is stored in sessionStorage
      const storedEmail = sessionStorage.getItem('pendingVerificationEmail');
      if (storedEmail) {
        console.log("Found email in sessionStorage:", storedEmail);
        // You could redirect back with the email
        navigate("/verify-email", { state: { email: storedEmail }, replace: true });
      } else {
        console.log("No email found, redirecting to signup");
        navigate("/signup");
      }
    } else {
      // Store email in sessionStorage for persistence
      sessionStorage.setItem('pendingVerificationEmail', email);
    }
  }, [email, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      setLoading(false);
      return;
    }

    if (!email) {
      setError("Email not found. Please go back and sign up again.");
      setLoading(false);
      return;
    }

    try {
      console.log("Verifying email:", email, "with code:", verificationCode);
      const result = await verifyEmail(email, verificationCode);
      console.log("Verification result:", result);
      
      setSuccess("Email verified successfully! Redirecting to login...");
      
      // Clear stored email
      sessionStorage.removeItem('pendingVerificationEmail');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    if (!email) {
      setError("Email not found. Please go back and sign up again.");
      return;
    }
    
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      console.log("Resending code to:", email);
      const result = await resendVerificationCode(email);
      console.log("Resend result:", result);
      setSuccess("New verification code sent! Check your email.");
      setResendCooldown(60);
    } catch (err) {
      console.error("Resend error:", err);
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show error if no email
  if (!email && !sessionStorage.getItem('pendingVerificationEmail')) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Verification Error</h2>
        <p>No email address found. Please sign up again.</p>
        <Link to="/signup">Go to Sign Up</Link>
      </div>
    );
  }

  const displayEmail = email || sessionStorage.getItem('pendingVerificationEmail');

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e5fa1 0%, #2d6cae 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px 32px',
        maxWidth: '450px',
        width: '100%',
        textAlign: 'center'
      }}>
        <img src={logoWithText} alt="AGAP logo" style={{ width: '80px', marginBottom: '24px' }} />
        <h1 style={{ color: '#1e293b', fontSize: '28px', marginBottom: '12px' }}>Verify Your Email</h1>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>
          We sent a verification code to <strong>{displayEmail}</strong>
        </p>
        
        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Verification Code
            </label>
            <input
              type="text"
              maxLength="6"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value.replace(/\D/g, ''));
                setError("");
              }}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '20px',
                textAlign: 'center',
                letterSpacing: '8px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none'
              }}
              autoFocus
            />
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{ background: '#d1fae5', color: '#059669', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#2d6cae',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

          <div style={{ margin: '20px 0' }}>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0}
              style={{
                background: 'none',
                border: 'none',
                color: '#2d6cae',
                cursor: 'pointer',
                fontSize: '14px',
                opacity: resendCooldown > 0 ? 0.6 : 1
              }}
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Resend verification code"}
            </button>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link to="/signup" style={{ color: '#64748b', textDecoration: 'none' }}>Use different email</Link>
            <span>•</span>
            <Link to="/login" style={{ color: '#64748b', textDecoration: 'none' }}>Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
