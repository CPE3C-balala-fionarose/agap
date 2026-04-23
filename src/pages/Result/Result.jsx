import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getWeatherAndFloodData } from '../../utils/weatherUtils';
import {
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Sun,
  Cloud,
  CloudRain,
} from 'lucide-react';
import GoogleMapView from '../../components/Googlemapview/GoogleMapView.jsx';
import logoImage from '../../assets/logo.png';
import './Result.css';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIG9wYWNpdHk9Ii4zIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjMuNyI+PHJlY3QgeD0iMTYiIHk9IjE2IiB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHJ4PSI2Ii8+PHBhdGggZD0ibTE2IDU4IDE2LTE4IDMyIDMyIi8+PGNpcmNsZSBjeD0iNTMiIGN5PSIzNSIgcj0iNyIvPjwvc3ZnPgoKCg==';

function ImageWithFallback(props) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  const { src, alt, style, className, ...rest } = props;

  return didError ? (
    <div className={`result-imgfb ${className ?? ''}`} style={style}>
      <div className="result-imgfb__inner">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  );
}




function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLoggedIn = localStorage.getItem('agapIsLoggedIn') === 'true';
  const profileRoute = isLoggedIn ? '/profile' : '/login';
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="result-header about-nav text-white shadow-md sticky top-0 z-50">
      <div className="about-nav__inner app-nav-inner">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="app-nav-logo-box shrink-0 flex items-center justify-center overflow-hidden rounded-full bg-[#2B5F8E] p-1.5"
            onClick={closeMenu}
          >
            <ImageWithFallback src={logoImage} alt="AGAP logo" className="result-header__logo h-full w-full object-contain" />
          </Link>
          <div className="hidden lg:grid app-nav-brand text-white">
            <p>AUTOMATED GEOSPATIAL</p>
            <p>ALERT PLATFORM</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-10">
          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className="app-nav-link text-white">
              Home
            </Link>
            <Link to="/about-us" className="app-nav-link text-white">
              About Us
            </Link>
            <Link to="/" state={{ scrollToLandingContact: true }} className="app-nav-link text-white">
              Contact
            </Link>
          </div>
          <Link to={profileRoute} className="app-profile-link app-profile-link--on-dark p-2 md:p-3" aria-label="Profile">
            <User size={20} aria-hidden />
          </Link>
          <button type="button" className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-[#234d73] border-t border-white/20">
          <div className="px-4 py-3 space-y-3">
            <Link
              to="/"
              className="app-nav-link block w-full text-left py-2 text-white"
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              to="/about-us"
              className="app-nav-link block w-full text-left py-2 text-white"
              onClick={closeMenu}
            >
              About Us
            </Link>
            <Link
              to="/"
              state={{ scrollToLandingContact: true }}
              className="app-nav-link block w-full text-left py-2 text-white"
              onClick={closeMenu}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function SearchBar({ value, onChange, onSearch }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="result-search">
      <div className="result-search__row">
        <Search aria-hidden />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search location..."
          className="result-search__input"
        />
        <button type="submit" className="result-search__submit">
          Search
        </button>
      </div>
    </form>
  );
}

function FloodHazardLevel({ level }) {
  const levels = [
    { id: 'low', label: 'LOW CHANCE OF FLOOD' },
    { id: 'medium', label: 'MEDIUM CHANCE OF FLOOD' },
    { id: 'high', label: 'HIGH CHANCE OF FLOOD' },
  ];

  return (
    <div className="result-hazard">
      {levels.map((lvl) => {
        const isActive = level === lvl.id;
        return (
          <div
            key={lvl.id}
            className={`result-hazard__row result-hazard__row--${lvl.id}${isActive ? ' is-active' : ''}`}
          >
            <div className="result-hazard__swatch" aria-label={`${lvl.id} warning symbol`}>
              <span
                className={`result-warning-triangle result-warning-triangle--${lvl.id}`}
                aria-hidden
              >
                <span className="result-warning-triangle__mark">!</span>
              </span>
            </div>
            <span>{lvl.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function FloodForecast({ data, loading, error }) {
  const floodLevelMeta = {
    low: { label: 'Low', value: 1, colorVar: '--result-hazard-low' },
    medium: { label: 'Medium', value: 2, colorVar: '--result-hazard-medium' },
    high: { label: 'High', value: 3, colorVar: '--result-hazard-high' },
  };

  if (loading) {
    return (
      <div className="result-placeholder">
        <div className="result-placeholder__row">
          <div className="result-placeholder__block result-placeholder__block--lg" />
          <div className="result-placeholder__block result-placeholder__block--tall" />
        </div>
        <p className="result-placeholder__message">Loading flood forecast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-placeholder">
        <p className="result-placeholder__message" style={{ color: '#dc143c' }}>
          Error loading flood forecast: {error}
        </p>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="result-placeholder">
        <p className="result-placeholder__message">No flood forecast data available for this location.</p>
        <div className="result-placeholder__row">
          <div className="result-placeholder__block result-placeholder__block--sm" />
          <div className="result-placeholder__block result-placeholder__block--sm" />
          <div className="result-placeholder__block result-placeholder__block--sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="result-weather-chart">
      <div className="result-weather-chart__plot">
        <div className="result-weather-chart__y-axis">
          <span>High</span>
          <span>Medium</span>
          <span>Low</span>
        </div>

        <div className="result-weather-chart__bars">
          {data.map((item) => {
            const levelMeta = floodLevelMeta[item.level] ?? floodLevelMeta.low;
            const barHeight = `${(levelMeta.value / 3) * 100}%`;

            return (
              <div key={`${item.date}-${item.level}`} className="result-weather-chart__col">
                <div className="result-weather-chart__bar-wrap">
                  <div
                    className="result-weather-chart__bar"
                    style={{ height: barHeight, backgroundColor: `var(${levelMeta.colorVar})` }}
                    title={`${item.date} - ${levelMeta.label}`}
                    aria-label={`${item.date} flood forecast ${levelMeta.label}`}
                  >
                    <span
                      className={`result-warning-triangle result-warning-triangle--${item.level}`}
                      aria-hidden
                    >
                      <span className="result-warning-triangle__mark">!</span>
                    </span>
                  </div>
                </div>
                <span className="result-weather-chart__date">{item.date}</span>
                {item.rainfall && (
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                    {item.rainfall}mm
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="result-weather-chart__legend">
        <span className="result-weather-chart__legend-item result-weather-chart__legend-item--low">
          Low
        </span>
        <span className="result-weather-chart__legend-item result-weather-chart__legend-item--medium">
          Medium
        </span>
        <span className="result-weather-chart__legend-item result-weather-chart__legend-item--high">
          High
        </span>
      </div>
    </div>
  );
}

function WeatherForecast({ data, loading, error }) {
  const getWeatherIcon = (weatherMain, iconCode, description) => {
    if (iconCode) {
      return (
        <img
          src={`https://openweathermap.org/img/w/${iconCode}.png`}
          alt={description || weatherMain}
          className="result-weather__icon"
          title={description || weatherMain}
        />
      );
    }

    const condition = (weatherMain + ' ' + (description || '')).toLowerCase();

    if (condition.includes('clear')) {
      return <Sun className="result-weather__icon result-weather__icon--sun" aria-hidden />;
    }
    if (condition.includes('few clouds') || condition.includes('scattered clouds')) {
      return <Cloud className="result-weather__icon result-weather__icon--cloud" aria-hidden />;
    }
    if (condition.includes('broken clouds') || condition.includes('overcast')) {
      return <Cloud className="result-weather__icon result-weather__icon--cloud" style={{ opacity: 0.8 }} aria-hidden />;
    }
    if (condition.includes('light rain') || condition.includes('moderate rain') || 
        condition.includes('heavy rain') || condition.includes('rain') || condition.includes('drizzle')) {
      return <CloudRain className="result-weather__icon result-weather__icon--rain" aria-hidden />;
    }
    if (condition.includes('thunderstorm')) {
      return <CloudRain className="result-weather__icon result-weather__icon--rain" style={{ color: '#fbbf24' }} aria-hidden />;
    }

    return <Sun className="result-weather__icon result-weather__icon--sun" aria-hidden />;
  };

  if (loading) {
    return (
      <div className="result-placeholder">
        <p className="result-weather__empty">Loading weather forecast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-placeholder">
        <p className="result-weather__empty" style={{ color: '#dc143c' }}>
          Error loading weather forecast: {error}
        </p>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="result-placeholder">
        <p className="result-weather__empty">No weather forecast available for this location.</p>
      </div>
    );
  }

  return (
    <div className="result-weather">
      {data.map((weather, index) => (
        <div key={index} className="result-weather__card">
          <div className="result-weather__date">
            <strong>{weather.date}</strong>
          </div>
          <div className="result-weather__meta">
            <div style={{ textAlign: 'right' }}>
              <div>{weather.temp}°C</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' }}>
                {weather.description || weather.condition}
              </div>
            </div>
            {getWeatherIcon(weather.condition, weather.icon, weather.description)}
          </div>
        </div>
      ))}
    </div>
  );
}

// Replace the entire MapView function with this:
function MapView({ latitude, longitude, locationName, floodRiskLevel }) {
  return (
    <div className="result-map">
      <GoogleMapView 
        latitude={latitude}
        longitude={longitude}
        locationName={locationName}
        floodRiskLevel={floodRiskLevel}
      />
    </div>
  );
}

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

export default function Result() {
  const location = useLocation();
  const welcomeSearchHandledKey = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFloodHazardOpen, setShowFloodHazardOpen] = useState(true);
  const [showFloodForecast, setShowFloodForecast] = useState(false);
  const [showWeatherForecast, setShowWeatherForecast] = useState(false);

  const [floodLevel, setFloodLevel] = useState(null);
  const [weatherData, setWeatherData] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  const [floodForecastData, setFloodForecastData] = useState([]);
  const [floodForecastLoading, setFloodForecastLoading] = useState(false);
  const [floodForecastError, setFloodForecastError] = useState(null);

  const [coordinates, setCoordinates] = useState(null);

  const toggleFloodHazard = () => {
    setShowFloodForecast(false);
    setShowWeatherForecast(false);
    setShowFloodHazardOpen((prev) => !prev);
  };

  const toggleFloodForecast = () => {
    setShowFloodHazardOpen(false);
    setShowWeatherForecast(false);
    setShowFloodForecast((prev) => !prev);
  };

  const toggleWeatherForecast = () => {
    setShowFloodHazardOpen(false);
    setShowFloodForecast(false);
    setShowWeatherForecast((prev) => !prev);
  };

  const fetchWeatherAndFloodData = useCallback(async (lat, lon) => {
    setWeatherLoading(true);
    setWeatherError(null);
    setFloodForecastLoading(true);
    setFloodForecastError(null);

    try {
      const data = await getWeatherAndFloodData(lat, lon, USE_MOCK_DATA);
      
      setWeatherData(data.weather);
      setFloodForecastData(data.floodHistory); // The API returns forecast data
      setFloodLevel(data.floodRisk);
      
      if (data.isMock) {
        console.log('Using mock weather data (development mode)');
      } else {
        console.log('Using live weather data from OpenWeatherMap');
      }
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherError(error.message);
      setFloodForecastError(error.message);
      
      // Fallback to mock data if real API fails
      console.log('Falling back to mock data...');
      try {
        const mockData = await getWeatherAndFloodData(lat, lon, true);
        setWeatherData(mockData.weather);
        setFloodForecastData(mockData.floodHistory);
        setFloodLevel(mockData.floodRisk);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setWeatherLoading(false);
      setFloodForecastLoading(false);
    }
  }, []);

  const performSearch = useCallback(async (rawQuery) => {
    const q = String(rawQuery ?? '').trim();
    if (!q) return;

    setSearchQuery(q);
    setShowFloodHazardOpen(true);
    setShowFloodForecast(false);
    setShowWeatherForecast(false);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=ph&format=json&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const coords = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        };
        setCoordinates(coords);
        await fetchWeatherAndFloodData(coords.latitude, coords.longitude);
      } else {
        setCoordinates(null);
        setFloodLevel(null);
        alert('Location not found in the Philippines. Please try a different search term.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setCoordinates(null);
      setFloodLevel(null);
      alert('Error searching for location. Please try again.');
    }
  }, [fetchWeatherAndFloodData]);

  useEffect(() => {
    const q = location.state?.welcomeSearchQuery;
    if (!q || !String(q).trim()) return;
    if (welcomeSearchHandledKey.current === location.key) return;
    welcomeSearchHandledKey.current = location.key;
    void performSearch(String(q).trim());
  }, [location.key, location.state, performSearch]);

  const handleSearch = async () => {
    await performSearch(searchQuery);
  };

  return (
    <div className="result-page">
      <Header />

      <div className="result-page__body">
        <aside className="result-sidebar">
          <div className="result-sidebar__inner">
            <SearchBar value={searchQuery} onChange={setSearchQuery} onSearch={handleSearch} />

            <section className="result-section">
              <button
                type="button"
                className="result-section__toggle"
                onClick={toggleFloodHazard}
              >
                <span>FLOOD HAZARD LEVEL</span>
                {showFloodHazardOpen ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
              </button>
              {showFloodHazardOpen ? <FloodHazardLevel level={floodLevel} /> : null}
            </section>

            <section className="result-section">
              <button
                type="button"
                className="result-section__toggle"
                onClick={toggleFloodForecast}
              >
                <span>FLOOD FORECAST</span>
                {showFloodForecast ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
              </button>
              {showFloodForecast && (
                <FloodForecast
                  data={floodForecastData}
                  loading={floodForecastLoading}
                  error={floodForecastError}
                />
              )}
            </section>

            <section className="result-section">
              <button
                type="button"
                className="result-section__toggle"
                onClick={toggleWeatherForecast}
              >
                <span>WEATHER FORECAST</span>
                {showWeatherForecast ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
              </button>
              {showWeatherForecast && (
                <WeatherForecast
                  data={weatherData}
                  loading={weatherLoading}
                  error={weatherError}
                />
              )}
            </section>
          </div>
        </aside>

        <main className="result-main">
          <MapView
            latitude={coordinates?.latitude}
            longitude={coordinates?.longitude}
            locationName={searchQuery}
            floodRiskLevel={floodLevel}
          />
        </main>
      </div>
    </div>
  );
}


