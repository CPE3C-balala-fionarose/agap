import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, X } from 'lucide-react';
import logoImage from '../../assets/logo.png';
import heroImage from '../../assets/hero-img.svg';
import SiteFooter from '../../components/SiteFooter/SiteFooter';
import leanaImage from '../../assets/team/leana.png';
import abigailImage from '../../assets/team/abigail.png';
import alleahImage from '../../assets/team/alleah.png';
import fionaImage from '../../assets/team/fiona.png';
import ryzaImage from '../../assets/team/ryza.png';
import './AboutUs.css';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

function ImageWithFallback(props) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  const { src, alt, style, className, ...rest } = props;

  if (didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
        </div>
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  );
}

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('agapIsLoggedIn') === 'true';
  const profileRoute = isLoggedIn ? '/profile' : '/login';
  const closeMenu = () => setIsMenuOpen(false);
  const handleExploreMap = () => {
    closeMenu();
    navigate(isLoggedIn ? '/result' : '/login');
  };

  return (
    <nav className="about-nav bg-[#2B5F8E] text-white shadow-md sticky top-0 z-50">
      <div className="about-nav__inner app-nav-inner">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="app-nav-logo-box shrink-0 flex items-center justify-center overflow-hidden rounded-full bg-[#2B5F8E] p-1.5"
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
            <Link to="/" className="app-nav-link text-white px-3 py-2">
              Home
            </Link>
            <Link to="/about-us#about" className="app-nav-link text-white px-3 py-2">
              About Us
            </Link>
            <button type="button" className="app-nav-link text-white px-3 py-2" onClick={handleExploreMap}>
              Explore Map
            </button>
            <Link to="/about-us#contact" className="app-nav-link text-white px-3 py-2">
              Contact
            </Link>
          </div>
          <Link to={profileRoute} className="app-profile-link app-profile-link--on-dark p-2 md:p-3" aria-label="Profile">
            <User size={20} className="md:scale-110" />
          </Link>
          <button
            type="button"
            className="md:hidden p-2.5"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
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
              to="/about-us#about"
              className="app-nav-link block w-full text-left py-3 px-4 text-white rounded-lg hover:bg-white/10 transition-colors"
              onClick={closeMenu}
            >
              About Us
            </Link>
            <button
              type="button"
              className="app-nav-link block w-full text-left py-3 px-4 text-white rounded-lg hover:bg-white/10 transition-colors"
              onClick={handleExploreMap}
            >
              Explore Map
            </button>
            <Link
              to="/about-us#contact"
              className="app-nav-link block w-full text-left py-3 px-4 text-white rounded-lg hover:bg-white/10 transition-colors"
              onClick={closeMenu}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  return (
    <section id="home" className="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] overflow-hidden">
      <div className="absolute inset-0">
        <ImageWithFallback
          src={heroImage}
          alt="Topographic map of Philippines"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      <div className="relative h-full flex items-center justify-center px-4">
        <div className="text-center text-white flex flex-col items-center gap-4 sm:gap-5 md:gap-6">
          <img
            src={logoImage}
            alt="AGAP logo"
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain drop-shadow-[0_4px_28px_rgba(0,0,0,0.5)]"
            width={128}
            height={128}
          />
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide drop-shadow-md">About Us</h1>
        </div>
      </div>
    </section>
  );
}

function AboutContent() {
  return (
    <section id="about" className="py-12 sm:py-16 md:py-20 bg-[#F5F5F5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="space-y-6 text-gray-800">
          <p className="leading-relaxed text-sm sm:text-base">
            AGAP (Automated Geospatial Alert Platform) is a web-based tool that was
            developed for communities and government agencies. These institutions can
            significantly improve operations with help of geospatial technology.
            We provide real-time monitoring of changes in land use, forests, and
            vegetation with our alerts, location-based mapping, and risk analysis; thus
            allows users to respond swiftly to environment shifts and help enhance
            decision-making and operations.
          </p>

          <p className="leading-relaxed text-sm sm:text-base">
            Our platform integrates with satellite data and geographic Information
            systems, and data visualization to original unify widespread data. Besides,
            AGAP supports organizations in risk assessment and resource management.
          </p>

          <p className="leading-relaxed text-sm sm:text-base">
            We decided to make and were prompted community by empowering
            governments and organizations to use geo-technology in their operations,
            enabling immediate responses and informed decisions.
          </p>
        </div>
      </div>
    </section>
  );
}

function TeamMembers() {
  // Alphabetical by first name; each image matches the person from your uploads.
  const teamMembers = [
    { id: 1, name: 'Abigail B. Nicolas', image: abigailImage },
    { id: 2, name: 'Alleah Joy M. Balbin', image: alleahImage },
    { id: 3, name: 'Fiona Rose A. Balala', image: fionaImage },
    { id: 4, name: 'Leana Rose S. Santos', image: leanaImage },
    { id: 5, name: 'Ryza Gwen P. Villafranca', image: ryzaImage }
  ];

  const handleMeetOurTeam = () => {
    // This button will work when team page is connected
    console.log('Navigate to team page');
  };

  return (
    <section id="team" className="py-16 md:py-20 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <button
            onClick={handleMeetOurTeam}
            className="bg-[#2B5F8E] text-white text-sm tracking-wider px-10 py-3 rounded-full hover:bg-[#234d73] transition-colors mb-6 inline-block"
          >
            MEET OUR
          </button>
          <h2 className="text-4xl md:text-5xl text-[#0c2d48] tracking-wide">
            Team Members
          </h2>
        </div>

        {/* Team Grid */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {teamMembers.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow w-full max-w-xs"
              >
                <div className="aspect-square overflow-hidden p-4">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className={`w-full h-full rounded-lg ${member.imageClassName ?? 'object-cover'}`}
                  />
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-[#0c2d48] text-sm sm:text-base font-semibold tracking-wide leading-snug">
                    {member.name}
                  </h3>
                  <p className="text-[#1E73BE] text-xs tracking-wider mt-1">MEMBER {member.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl">
            {teamMembers.slice(3, 5).map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow w-full max-w-xs mx-auto"
              >
                <div className="aspect-square overflow-hidden p-4">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className={`w-full h-full rounded-lg ${member.imageClassName ?? 'object-cover'}`}
                  />
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-[#0c2d48] text-sm sm:text-base font-semibold tracking-wide leading-snug">
                    {member.name}
                  </h3>
                  <p className="text-[#1E73BE] text-xs tracking-wider mt-1">MEMBER {member.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AboutUs() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [location.hash]);

  return (
    <div className="about-us-page min-h-screen bg-[#F5F5F5]">
      <Navigation />
      <HeroSection />
      <AboutContent />
      <TeamMembers />
      <SiteFooter />
    </div>
  );
}
