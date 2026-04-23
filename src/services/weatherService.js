import api from './api';

// Fetch weather and flood data for a location
export const getWeatherAndFloodData = async (location) => {
  try {
    const response = await api.get(`/weather/flood-data?location=${encodeURIComponent(location)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weather and flood data:', error);
    throw error;
  }
};

// Fetch weather forecast
export const getWeatherForecast = async (lat, lon) => {
  try {
    const response = await api.get(`/weather/forecast?lat=${lat}&lon=${lon}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};

// Fetch flood risk data
export const getFloodRisk = async (lat, lon) => {
  try {
    const response = await api.get(`/flood/risk?lat=${lat}&lon=${lon}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching flood risk:', error);
    throw error;
  }
};