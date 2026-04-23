import { Plus, Minus, Compass, Map, User, EyeOff, Eye, Menu, X, Edit2, Save, XCircle } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUser, isAuthenticated, logout, getCurrentUser, updateUserDetails } from "../../services/auth";
import backgroundImage from "../../assets/profile-bg.svg";
import heroBackgroundImage from "../../assets/philippines-map-bg.svg";
import logoImage from "../../assets/logo.png";
import "./profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  // Check authentication and load user data
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    loadUserData();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      const localUser = getUser();
      if (localUser) {
        setUserData(localUser);
        setEditName(localUser.name || "");
        setEditEmail(localUser.email || "");
      }
      
      const response = await getCurrentUser();
      if (response.success) {
        setUserData(response.data);
        setEditName(response.data.name || "");
        setEditEmail(response.data.email || "");
        localStorage.setItem("user", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setMessage({ type: "error", text: "Failed to load user data" });
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 960);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Determine which background to use
  const currentBackground = isSmallScreen ? heroBackgroundImage : backgroundImage;

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  // Handle Name Update
  const handleUpdateName = async () => {
    if (!editName.trim()) {
      setMessage({ type: "error", text: "Name cannot be empty" });
      return;
    }

    setLoading(true);
    try {
      const response = await updateUserDetails({ name: editName });
      if (response.success) {
        setUserData(prev => ({ ...prev, name: editName }));
        localStorage.setItem("user", JSON.stringify({ ...userData, name: editName }));
        setMessage({ type: "success", text: "Name updated successfully!" });
        setIsEditingName(false);
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to update name" });
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Update
  const handleUpdateEmail = async () => {
    if (!editEmail.trim()) {
      setMessage({ type: "error", text: "Email cannot be empty" });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(editEmail)) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    setLoading(true);
    try {
      const response = await updateUserDetails({ email: editEmail });
      if (response.success) {
        setUserData(prev => ({ ...prev, email: editEmail }));
        localStorage.setItem("user", JSON.stringify({ ...userData, email: editEmail }));
        setMessage({ type: "success", text: "Email updated successfully! Please login again." });
        setIsEditingEmail(false);
        setTimeout(() => {
          logout();
        }, 2000);
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to update email" });
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      setMessage({ type: "error", text: "Please fill in all password fields" });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters" });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      const response = await updateUserDetails({ 
        currentPassword, 
        newPassword 
      });
      if (response.success) {
        setMessage({ type: "success", text: "Password updated successfully!" });
        setIsEditingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to update password" });
    } finally {
      setLoading(false);
    }
  };

  const cancelNameEdit = () => {
    setIsEditingName(false);
    setEditName(userData?.name || "");
    setMessage({ type: "", text: "" });
  };

  const cancelEmailEdit = () => {
    setIsEditingEmail(false);
    setEditEmail(userData?.email || "");
    setMessage({ type: "", text: "" });
  };

  const cancelPasswordEdit = () => {
    setIsEditingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage({ type: "", text: "" });
  };

  const userEmail = userData?.email || 'user@example.com';
  const userName = userData?.name || 'User';

  return (
    <div className="profile-page">
      <div className="profile-bg" style={{ backgroundImage: `url(${currentBackground})` }} />

      <header className="about-nav bg-[#2565a8] text-white sticky top-0 z-50 shadow-md">
        <div className="about-nav__inner app-nav-inner">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="app-nav-logo-box shrink-0 flex items-center justify-center overflow-hidden rounded-full bg-[#2565a8] p-1.5"
              onClick={closeMenu}
            >
              <img src={logoImage} alt="AGAP" className="w-full h-full object-contain" width={56} height={56} />
            </Link>
            <div className="hidden lg:grid app-nav-brand text-white">
              <p>AUTOMATED GEOSPATIAL</p>
              <p>ALERT PLATFORM</p>
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-12">
            <div className="hidden md:flex items-center gap-8 lg:gap-12">
              <NavLink to="/" end className={({ isActive }) => `app-nav-link text-white px-3 py-2 profile-top-link${isActive ? " profile-top-link--active" : ""}`}>
                Home
              </NavLink>
              <NavLink to="/about-us" className={({ isActive }) => `app-nav-link text-white px-3 py-2 profile-top-link${isActive ? " profile-top-link--active" : ""}`}>
                About Us
              </NavLink>
              <NavLink to="/result" className={({ isActive }) => `app-nav-link text-white px-3 py-2 profile-top-link${isActive ? " profile-top-link--active" : ""}`}>
                Explore Map
              </NavLink>
              <Link to="/" state={{ scrollToLandingContact: true }} className="app-nav-link text-white px-3 py-2">
                Contact
              </Link>
            </div>
            <NavLink to="/profile" className={({ isActive }) => `app-profile-link app-profile-link--on-dark p-2 md:p-3${isActive ? " app-profile-link--active" : ""}`} aria-label="Go to profile">
              <User size={20} className="md:scale-110" />
            </NavLink>
            <button type="button" className="md:hidden p-2.5" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-[#234d73] border-t border-white/20">
            <div className="px-6 py-4 space-y-2">
              <NavLink to="/" end className={({ isActive }) => `app-nav-link block w-full text-left py-3 px-4 text-white rounded-lg hover:bg-white/10 transition-colors profile-top-link${isActive ? " profile-top-link--active" : ""}`} onClick={closeMenu}>
                Home
              </NavLink>
              <NavLink to="/about-us" className={({ isActive }) => `app-nav-link block w-full text-left py-3 px-4 text-white rounded-lg hover:bg-white/10 transition-colors profile-top-link${isActive ? " profile-top-link--active" : ""}`} onClick={closeMenu}>
                About Us
              </NavLink>
              <NavLink to="/result" className={({ isActive }) => `app-nav-link block w-full text-left py-3 px-4 text-white rounded-lg hover:bg-white/10 transition-colors profile-top-link${isActive ? " profile-top-link--active" : ""}`} onClick={closeMenu}>
                Explore Map
              </NavLink>
              <Link to="/" state={{ scrollToLandingContact: true }} className="app-nav-link block w-full text-left py-3 px-4 text-white rounded-lg hover:bg-white/10 transition-colors" onClick={closeMenu}>
                Contact
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="profile-main">
        <div className="profile-main__inner">
          <section className="profile-map" aria-label="Map">
            <div className="profile-map__controls">
              <button type="button" className="profile-map__btn" aria-label="Zoom in">
                <Plus className="profile-map__icon-lg" strokeWidth={3} aria-hidden="true" />
              </button>
              <button type="button" className="profile-map__btn" aria-label="Zoom out">
                <Minus className="profile-map__icon-lg" strokeWidth={3} aria-hidden="true" />
              </button>
              <button type="button" className="profile-map__btn profile-map__btn--outlined" aria-label="Compass">
                <Compass className="profile-map__icon-sm" aria-hidden="true" />
              </button>
              <button type="button" className="profile-map__btn" aria-label="Map layers">
                <Map className="profile-map__icon-sm" aria-hidden="true" />
              </button>
            </div>
          </section>

          <aside className="profile-panel" aria-label="Account settings">
            <div className="profile-panel__inner">
              <h2 className="profile-panel__greeting">Hi, {userName}!</h2>
              <h1 className="profile-panel__title">Account Settings</h1>

              {message.text && (
                <div className={`message-box message-${message.type}`} style={{
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  backgroundColor: message.type === "success" ? "#d1fae5" : "#fee2e2",
                  color: message.type === "success" ? "#059669" : "#dc2626",
                  textAlign: "center"
                }}>
                  {message.text}
                </div>
              )}

              <div className="profile-form">
                {/* Name Field - Editable */}
                <div className="profile-field">
                  <div className="profile-field__row">
                    <label className="profile-field__label" htmlFor="profile-name">Name</label>
                    {!isEditingName ? (
                      <button type="button" className="profile-field__action" onClick={() => setIsEditingName(true)}>
                        <Edit2 size={16} style={{ marginRight: "4px" }} /> Edit
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button type="button" className="profile-field__action" onClick={handleUpdateName} disabled={loading} style={{ color: "#059669" }}>
                          <Save size={16} style={{ marginRight: "4px" }} /> Save
                        </button>
                        <button type="button" className="profile-field__action" onClick={cancelNameEdit} style={{ color: "#dc2626" }}>
                          <XCircle size={16} style={{ marginRight: "4px" }} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {!isEditingName ? (
                    <input
                      id="profile-name"
                      type="text"
                      className="profile-field__input"
                      value={userName}
                      readOnly
                    />
                  ) : (
                    <input
                      id="profile-name"
                      type="text"
                      className="profile-field__input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter your name"
                      autoFocus
                    />
                  )}
                </div>

                {/* Email Field - Editable */}
                <div className="profile-field">
                  <div className="profile-field__row">
                    <label className="profile-field__label" htmlFor="profile-email">Email</label>
                    {!isEditingEmail ? (
                      <button type="button" className="profile-field__action" onClick={() => setIsEditingEmail(true)}>
                        <Edit2 size={16} style={{ marginRight: "4px" }} /> Edit
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button type="button" className="profile-field__action" onClick={handleUpdateEmail} disabled={loading} style={{ color: "#059669" }}>
                          <Save size={16} style={{ marginRight: "4px" }} /> Save
                        </button>
                        <button type="button" className="profile-field__action" onClick={cancelEmailEdit} style={{ color: "#dc2626" }}>
                          <XCircle size={16} style={{ marginRight: "4px" }} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {!isEditingEmail ? (
                    <input
                      id="profile-email"
                      type="email"
                      className="profile-field__input"
                      value={userEmail}
                      readOnly
                    />
                  ) : (
                    <input
                      id="profile-email"
                      type="email"
                      className="profile-field__input"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Enter your email"
                      autoFocus
                    />
                  )}
                </div>

                {/* Password Field - Hidden by default */}
                <div className="profile-field">
                  <div className="profile-field__row">
                    <label className="profile-field__label" htmlFor="profile-password">Password</label>
                    {!isEditingPassword ? (
                      <button type="button" className="profile-field__action" onClick={() => setIsEditingPassword(true)}>
                        <Edit2 size={16} style={{ marginRight: "4px" }} /> Change
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button type="button" className="profile-field__action" onClick={handleUpdatePassword} disabled={loading} style={{ color: "#059669" }}>
                          <Save size={16} style={{ marginRight: "4px" }} /> Save
                        </button>
                        <button type="button" className="profile-field__action" onClick={cancelPasswordEdit} style={{ color: "#dc2626" }}>
                          <XCircle size={16} style={{ marginRight: "4px" }} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {!isEditingPassword ? (
                    <div className="profile-field__passwordWrap">
                      <input
                        id="profile-password"
                        type={showPassword ? "text" : "password"}
                        className="profile-field__input profile-field__input--password"
                        value="········"
                        readOnly
                      />
                      <button 
                        type="button" 
                        className="profile-field__eye" 
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div className="profile-field__passwordWrap">
                        <input
                          type="password"
                          className="profile-field__input profile-field__input--password"
                          placeholder="Current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                      <div className="profile-field__passwordWrap">
                        <input
                          type="password"
                          className="profile-field__input profile-field__input--password"
                          placeholder="New password (min 6 characters)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="profile-field__passwordWrap">
                        <input
                          type="password"
                          className="profile-field__input profile-field__input--password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-logout">
                <button type="button" onClick={handleLogout} className="profile-logout__link">
                  Log Out
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}