import { useEffect, useState } from "react";
import { MapPin, Search, Menu, User, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoImage from "../../assets/logo.png";
import SiteFooter from "../../components/SiteFooter/SiteFooter";
import { isAuthenticated, getUser, logout } from "../../services/auth";
import "./Welcome.css";

const NOMINATIM_HEADERS = {
  Accept: "application/json",
  "Accept-Language": "en",
};

async function searchPhilippinesLocation(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&countrycodes=ph&format=json&limit=1`;
  const response = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!response.ok) throw new Error("Geocoding request failed");
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export default function Welcome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [locationQuery, setLocationQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState(""); // ADD THIS for user greeting
  
  // REPLACE the old isLoggedIn check with this:
  const isLoggedIn = isAuthenticated();
  const profileRoute = isLoggedIn ? "/profile" : "/login";

  const closeMenu = () => setIsMenuOpen(false);

  // ADD THIS: Load user data on component mount
  useEffect(() => {
    if (isLoggedIn) {
      const user = getUser();
      if (user) {
        setUserName(user.name || user.email?.split('@')[0] || "User");
        console.log("Welcome back,", user.name || user.email);
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (location.hash !== "#contact") return;
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      requestAnimationFrame(() => {
        contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.pathname, location.hash]);

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    setSearchError("");
    const trimmed = locationQuery.trim();
    if (!trimmed) {
      setSearchError("Invalid location. Try another place.");
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPhilippinesLocation(trimmed);
      if (!results.length) {
        setSearchError("Invalid location. Try another place.");
        return;
      }
      navigate("/result", { state: { welcomeSearchQuery: trimmed } });
    } catch {
      setSearchError("Invalid location. Try another place.");
    } finally {
      setIsSearching(false);
    }
  };

  // ADD THIS: Handle logout
  const handleLogout = () => {
    logout(); // This will redirect to login page
  };

  return (
    <div className="welcome-page">
      <header className="welcome-header">
        <div className="welcome-header-inner app-nav-inner">
          <div className="flex items-center gap-3">
            <div className="welcome-brand-logo app-nav-logo-box">
              <img src={logoImage} alt="AGAP logo" className="welcome-brand-logo-img" />
            </div>
            <div className="welcome-brand-text app-nav-brand welcome-brand-text--light">
              <p>AUTOMATED GEOSPATIAL</p>
              <p>ALERT PLATFORM</p>
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-12">
            <div className="hidden md:flex items-center gap-8 lg:gap-12">
              <Link to="/" className="app-nav-link welcome-nav__link text-white px-3 py-2">
                Home
              </Link>
              <Link to="/about-us" className="app-nav-link welcome-nav__link text-white px-3 py-2">
                About Us
              </Link>
              <Link to="/welcome#contact" className="app-nav-link welcome-nav__link text-white px-3 py-2">
                Contact
              </Link>
            </div>
            
            {/* OPTIONAL: Show user name next to profile icon */}
            {isLoggedIn && userName && (
              <span className="hidden md:inline-block text-white text-sm">
                Hi, {userName}
              </span>
            )}
            
            <Link to={profileRoute} className="app-profile-link app-profile-link--on-dark p-2 md:p-3" aria-label="Profile">
              <User size={20} className="md:scale-110" />
            </Link>
            
            {/* OPTIONAL: Add logout button for logged in users */}
            {isLoggedIn && (
              <button 
                onClick={handleLogout}
                className="hidden md:block text-white text-sm bg-red-600/20 hover:bg-red-600/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                Logout
              </button>
            )}
            
            <button type="button" className="md:hidden p-2.5" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-[#234d73] border-t border-white/20">
            <div className="px-6 py-4 space-y-2">
              <Link
                to="/"
                className="app-nav-link block w-full text-left py-3 px-4 text-white rounded-lg hover:bg-white/10 transition-colors"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link
                to="/about-us"
                className="app-nav-link block w-full text-left py-3 px-4 text-white rounded-lg hover:bg-white/10 transition-colors"
                onClick={closeMenu}
              >
                About Us
              </Link>
              <Link
                to="/welcome#contact"
                className="app-nav-link block w-full text-left py-3 px-4 text-white rounded-lg hover:bg-white/10 transition-colors"
                onClick={closeMenu}
              >
                Contact
              </Link>
              {isLoggedIn && (
                <button
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  className="block w-full text-left py-3 px-4 text-white rounded-lg hover:bg-red-600/30 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="welcome-main">
        <section className="welcome-search-card">
          <h1>Find Your Location</h1>
          <p>Get real-time flood risk updates based on your location.</p>

          <form className="welcome-search-row" onSubmit={handleSearchSubmit}>
            <MapPin size={18} className="welcome-input-icon-left" aria-hidden />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                if (searchError) setSearchError("");
              }}
              placeholder="Search Location"
              aria-label="Search location"
              aria-invalid={Boolean(searchError)}
              aria-describedby={searchError ? "welcome-search-error" : undefined}
              disabled={isSearching}
            />
            <button type="submit" aria-label="Search location" disabled={isSearching}>
              <Search size={18} />
            </button>
          </form>
          {searchError ? (
            <p id="welcome-search-error" className="welcome-search-error" role="alert">
              {searchError}
            </p>
          ) : null}
        </section>
      </main>

      <div className="welcome-spacer" />

      <SiteFooter />
    </div>
  );
}
