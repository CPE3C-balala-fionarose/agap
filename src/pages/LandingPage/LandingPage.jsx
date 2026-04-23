import { useState, useEffect } from "react";
import heroImage from "../../assets/hero-img.svg";
import logoImage from "../../assets/logo.png";
import { useLayoutEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import SiteFooter from "../../components/SiteFooter/SiteFooter";
import { isAuthenticated, getUser } from "../../services/auth"; // ADD THIS
import "./LandingPage.css";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ADD THIS
  const navigate = useNavigate();
  const location = useLocation();
  const scrollFromResult = location.state?.scrollToLandingContact === true;

  // ADD THIS: Check authentication on component mount
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleExploreMap = () => {
    // UPDATED: Use real authentication check
    if (isAuthenticated()) {
      navigate("/result");
    } else {
      navigate("/login");
    }
  };

  const handleProfile = () => {
    navigate("/welcome");
  };

  useLayoutEffect(() => {
    const hashContact = location.hash === "#contact";
    if (!hashContact && !scrollFromResult) return;

    const scroll = () =>
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });

    scroll();
    requestAnimationFrame(scroll);

    if (scrollFromResult) {
      navigate({ pathname: "/", hash: "contact" }, { replace: true, state: {} });
    }
  }, [location.hash, location.pathname, scrollFromResult, navigate]);

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-container landing-header-inner">
          <div className="landing-header-left">
            <div className="landing-logo">
              <div className="landing-logo-icon app-nav-logo-box">
                <img src={logoImage} alt="AGAP logo" className="landing-logo-image" />
              </div>
            </div>
            <nav className={`landing-nav ${mobileMenuOpen ? 'landing-nav--open' : ''}`}>
              <Link to="/" className="landing-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/about-us" className="landing-nav-link" onClick={() => setMobileMenuOpen(false)}>
                About Us
              </Link>
              <Link
                to="/#contact"
                className="landing-nav-link"
                onClick={() => {
                  setMobileMenuOpen(false);
                  requestAnimationFrame(() => {
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  });
                }}
              >
                Contact
              </Link>
              <div className="landing-nav-auth">
                {isLoggedIn ? (
                  <button
                    type="button"
                    className="landing-profile-btn landing-nav-auth-btn"
                    aria-label="Profile"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleProfile();
                    }}
                  >
                    <User size={20} aria-hidden />
                  </button>
                ) : (
                  <>
                    <button 
                      type="button" 
                      className="landing-login-btn landing-nav-auth-btn" 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/login");
                      }}
                    >
                      Login
                    </button>
                    <button 
                      type="button" 
                      className="landing-signup-btn landing-nav-auth-btn" 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/signup");
                      }}
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
          <div className="landing-header-right">
            <div className="landing-auth">
              {isLoggedIn ? (
                <button type="button" className="landing-profile-btn" aria-label="Profile" onClick={handleProfile}>
                  <User size={20} aria-hidden />
                </button>
              ) : (
                <>
                  <button type="button" className="landing-login-btn" onClick={() => navigate("/login")}>
                    Login
                  </button>
                  <button type="button" className="landing-signup-btn" onClick={() => navigate("/signup")}>
                    Sign up
                  </button>
                </>
              )}
            </div>
            <button 
              className="landing-mobile-menu-btn" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <div className="landing-hero-copy">
          <h1>
            <span>Stay ahead of floods.</span>
            <br />
            <span>Stay safe with </span>
            <span className="landing-highlight">AGAP</span>
            <span>.</span>
          </h1>
          <p>
            Get <span className="landing-highlight">real-time flood risk</span> updates and
            <br />
            <span className="landing-highlight">make smarter decisions</span> for your safety.
          </p>
          <div className="landing-hero-cta-wrap">
            <button type="button" className="landing-hero-cta" onClick={handleExploreMap}>
              Explore Map
            </button>
          </div>
        </div>

        <div className="landing-hero-image-wrap">
          <img src={heroImage} alt="AGAP - Flood Monitoring System" className="landing-hero-image" />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
