import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import logoWithText from "../../assets/logowithtext.png";
import googleIcon from "../../assets/icons/google.svg";
import { register } from "../../services/auth";
import { googleLogin } from "../../services/googleAuth";
import "./SignUp.css";

export function SignUp() {
  const navigate = useNavigate();
  const welcomeLines = [
    ["SIGN UP", "NOW"],
    ["GET STARTED", "WITH AGAP"],
    ["CREATE YOUR", "ACCOUNT"],
  ];
  const [welcomeIndex, setWelcomeIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [backendError, setBackendError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

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

  // Check password strength in real-time
  useEffect(() => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    });
  }, [password]);

  const validatePassword = (pwd) => {
    const checks = {
      minLength: pwd.length >= 8,
      upperCase: /[A-Z]/.test(pwd),
      lowerCase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      specialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
    };
    
    return checks.minLength && checks.upperCase && checks.lowerCase && 
           checks.number && checks.specialChar;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    setBackendError("");
    
    const newErrors = { name: "", email: "", password: "", confirmPassword: "" };
    let hasError = false;

    // Validate name
    if (!name) {
      newErrors.name = "Full name is required";
      hasError = true;
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      hasError = true;
    }

    // Validate email
    if (!email) {
      newErrors.email = "Email is required";
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      hasError = true;
    }

    // Validate password with new requirements
    if (!password) {
      newErrors.password = "Password is required";
      hasError = true;
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character";
      hasError = true;
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      setLoading(true);
      
      try {
        const result = await register({
          name: name,
          email: email,
          password: password
        });
        
        console.log("Registration successful:", result);
        
        sessionStorage.setItem('pendingVerificationEmail', email);
        
        navigate("/verify-email", { 
          state: { email: email },
          replace: true 
        });
        
      } catch (err) {
        console.error("Registration error:", err);
        setBackendError(err.message || "Registration failed. Please try again.");
        setPassword("");
        setConfirmPassword("");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Google signup success:", credentialResponse);
    
    try {
      const result = await googleLogin(credentialResponse.credential);
      
      if (result.success) {
        console.log("Google signup successful:", result);
        navigate("/welcome");
      }
    } catch (error) {
      console.error("Google signup error:", error);
      setBackendError(error.message || "Google signup failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    console.log("Google signup failed");
    setBackendError("Google signup failed. Please try again.");
  };

  const passwordToggleIcon = (visible) =>
    visible ? (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 3L21 21M10.58 10.59A2 2 0 0 0 13.41 13.4M9.88 5.09A10.94 10.94 0 0 1 12 5C17 5 21.27 8.11 23 12C22.18 13.84 20.79 15.43 19 16.54M14.12 18.88A10.78 10.78 0 0 1 12 19C7 19 2.73 15.89 1 12C1.95 9.86 3.58 8.07 5.66 6.79" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M1 12C2.73 8.11 7 5 12 5S21.27 8.11 23 12C21.27 15.89 17 19 12 19S2.73 15.89 1 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );

  // Get password strength percentage
  const getStrengthPercentage = () => {
    const checks = Object.values(passwordStrength);
    const passed = checks.filter(check => check === true).length;
    return (passed / 5) * 100;
  };

  // Get password strength color
  const getStrengthColor = () => {
    const percentage = getStrengthPercentage();
    if (percentage <= 20) return "#dc2626";
    if (percentage <= 40) return "#f97316";
    if (percentage <= 60) return "#eab308";
    if (percentage <= 80) return "#84cc16";
    return "#22c55e";
  };

  // Get password strength text
  const getStrengthText = () => {
    const percentage = getStrengthPercentage();
    if (percentage <= 20) return "Very Weak";
    if (percentage <= 40) return "Weak";
    if (percentage <= 60) return "Fair";
    if (percentage <= 80) return "Good";
    return "Strong";
  };

  return (
    <div className="login-page signup-page">
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
          <h2>Sign Up</h2>

          <form onSubmit={handleSignup} noValidate autoComplete="off">
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
              <label htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                name="signup-name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: "" }));
                  setBackendError("");
                }}
              />
              {errors.name ? <p className="field-error">{errors.name}</p> : null}
            </div>

            <div className="field-wrap">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                name="signup-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: "" }));
                  setBackendError("");
                }}
              />
              {errors.email ? <p className="field-error">{errors.email}</p> : null}
            </div>

            <div className="field-wrap">
              <label htmlFor="signup-password">Password</label>
              <div className="password-input-wrap">
                <input
                  id="signup-password"
                  name="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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
                  {passwordToggleIcon(showPassword)}
                </button>
              </div>
              
              {/* Password Requirements */}
              {password && (
                <div className="password-requirements">
                  <div className="strength-bar-container">
                    <div 
                      className="strength-bar" 
                      style={{ 
                        width: `${getStrengthPercentage()}%`, 
                        backgroundColor: getStrengthColor(),
                        transition: "width 0.3s ease"
                      }}
                    />
                  </div>
                  <p className="strength-text" style={{ color: getStrengthColor() }}>
                    {getStrengthText()} Password
                  </p>
                  <ul className="requirements-list">
                    <li style={{ color: passwordStrength.hasMinLength ? "#22c55e" : "#dc2626" }}>
                      {passwordStrength.hasMinLength ? "✓" : "○"} At least 8 characters
                    </li>
                    <li style={{ color: passwordStrength.hasUpperCase ? "#22c55e" : "#dc2626" }}>
                      {passwordStrength.hasUpperCase ? "✓" : "○"} At least 1 uppercase letter
                    </li>
                    <li style={{ color: passwordStrength.hasLowerCase ? "#22c55e" : "#dc2626" }}>
                      {passwordStrength.hasLowerCase ? "✓" : "○"} At least 1 lowercase letter
                    </li>
                    <li style={{ color: passwordStrength.hasNumber ? "#22c55e" : "#dc2626" }}>
                      {passwordStrength.hasNumber ? "✓" : "○"} At least 1 number
                    </li>
                    <li style={{ color: passwordStrength.hasSpecialChar ? "#22c55e" : "#dc2626" }}>
                      {passwordStrength.hasSpecialChar ? "✓" : "○"} At least 1 special character (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              )}
              {errors.password ? <p className="field-error">{errors.password}</p> : null}
            </div>

            <div className="field-wrap">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <div className="password-input-wrap">
                <input
                  id="signup-confirm-password"
                  name="confirm-new-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    setBackendError("");
                  }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {passwordToggleIcon(showConfirmPassword)}
                </button>
              </div>
              {errors.confirmPassword ? <p className="field-error">{errors.confirmPassword}</p> : null}
            </div>

            <div className="or-divider">
              <span>Or with</span>
            </div>

            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                text="signup_with"
                shape="rectangular"
                width="100%"
                locale="en"
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <p className="login-signup-text">
              Already have an account? <Link to="/login">Login</Link>
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
