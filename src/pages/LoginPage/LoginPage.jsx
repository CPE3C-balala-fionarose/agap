import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import logoWithText from "../../assets/logowithtext.png";
import { login } from "../../services/auth";
import { googleLogin } from "../../services/googleAuth";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const welcomeLines = [
    ["HELLO,", "WELCOME!"],
    ["STAY SAFE,", "STAY READY!"],
    ["MONITOR,", "RESPOND FAST!"],
  ];
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [welcomeIndex, setWelcomeIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedEmail, setFailedEmail] = useState(""); // Track email that failed

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setWelcomeIndex((prev) => (prev + 1) % welcomeLines.length);
        setIsFading(false);
      }, 700);
    }, 6200);

    return () => clearInterval(interval);
  }, [welcomeLines.length]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    setBackendError("");
    
    const nextErrors = { email: "", password: "" };
    let hasError = false;

    if (!email) {
      nextErrors.email = "Email is required";
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = "Please enter a valid email address";
      hasError = true;
    }

    if (!password) {
      nextErrors.password = "Password is required";
      hasError = true;
    }

    setErrors(nextErrors);

    if (!hasError) {
      setLoading(true);
      
      try {
        const result = await login(email, password);
        console.log("Login successful:", result);
        
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }
        
        navigate("/welcome");
      } catch (err) {
        console.error("Login error:", err);
        
        if (err.requiresVerification) {
          navigate("/verify-email", { state: { email: email } });
        } else {
          setBackendError(err.message || "Login failed. Please check your credentials.");
          
          // Check if the error is about email (user not found) or password
          const errorMessage = err.message?.toLowerCase() || "";
          
          if (errorMessage.includes("user not found") || 
              errorMessage.includes("invalid credentials") ||
              errorMessage.includes("email")) {
            // Email is wrong - clear both email and password
            setEmail("");
            setPassword("");
            setFailedEmail(email); // Store failed email for reference
          } else {
            // Password is wrong - clear only password
            setPassword("");
          }
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Google login success:", credentialResponse);
    
    try {
      const result = await googleLogin(credentialResponse.credential);
      
      if (result.success) {
        console.log("Google login successful:", result);
        navigate("/welcome");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setBackendError(error.message || "Google login failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    console.log("Google login failed");
    setBackendError("Google login failed. Please try again.");
  };

  return (
    <div className="login-page">
      <section className="login-left-panel">
        <img src={logoWithText} alt="AGAP logo" className="login-left-logo" />
        <h1 className="login-left-title">
          <span className={`login-left-title-text ${isFading ? "is-fading" : ""}`}>
            {welcomeLines[welcomeIndex][0]}
            <br />
            {welcomeLines[welcomeIndex][1]}
          </span>
        </h1>
      </section>

      <section className="login-right-panel">
        <div className="login-card">
          <h2>Login</h2>
          <form onSubmit={handleLogin} noValidate>
            {backendError && (
              <div className="field-error" style={{ 
                marginBottom: "16px", 
                padding: "10px", 
                background: "#fee2e2", 
                borderRadius: "6px",
                textAlign: "center"
              }}>
                {backendError}
              </div>
            )}
            
            <div className="field-wrap">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: "" }));
                  setBackendError("");
                  setFailedEmail(""); // Clear failed email tracking
                }}
              />
              {errors.email ? <p className="field-error">{errors.email}</p> : null}
            </div>

            <div className="field-wrap">
              <label htmlFor="login-password">Password</label>
              <div className="password-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: "" }));
                    setBackendError("");
                  }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 3L21 21M10.58 10.59A2 2 0 0 0 13.41 13.4M9.88 5.09A10.94 10.94 0 0 1 12 5C17 5 21.27 8.11 23 12C22.18 13.84 20.79 15.43 19 16.54M14.12 18.88A10.78 10.78 0 0 1 12 19C7 19 2.73 15.89 1 12C1.95 9.86 3.58 8.07 5.66 6.79" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12C2.73 8.11 7 5 12 5S21.27 8.11 23 12C21.27 15.89 17 19 12 19S2.73 15.89 1 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password ? <p className="field-error">{errors.password}</p> : null}
            </div>

            <div className="login-meta-row">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password">Forget Password?</Link>
            </div>

            <div className="or-divider">
              <span>Or with</span>
            </div>

            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                text="signin_with"
                shape="rectangular"
                width="100%"
                locale="en"
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="login-signup-text">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
            <p className="login-signup-text">
              Back to <Link to="/">Home</Link>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
