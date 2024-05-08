import { useEffect, useState } from "react"; // Importing necessary hooks from React
import Search from "../components/Search"; // Importing the Search component
import RestCountries from "../components/RestCountries"; // Importing the RestCountries component

function Weather() {
    const [search, setSearch] = useState(''); // State to manage the search query
    const [loading, setLoading] = useState(false); // State to manage loading status
    const [weatherData, setWeatherData] = useState(null); // State to store weather data
    const [forecastData, setForecastData] = useState(null); // State to store forecast data
    const [error, setError] = useState(null); // State to manage error
    const [unit, setUnit] = useState('metric'); // State to manage temperature unit, default to Celsius

    async function fetchWeatherData(param) {
        setLoading(true); // Set loading to true when fetching data
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${param}&units=${unit}&appid=075335bc4fb43ae67a55693444276c56`); // Fetch weather data
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message); // Throw error if response is not ok
            }

            setWeatherData(data); // Set weather data

            const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${param}&units=${unit}&appid=075335bc4fb43ae67a55693444276c56`); // Fetch forecast data
            const forecastData = await forecastResponse.json();

            if (!forecastResponse.ok) {
                throw new Error(forecastData.message); // Throw error if forecast response is not ok
            }

            setForecastData(forecastData); // Set forecast data
            setError(null); // Clear any previous errors
        } catch (error) {
            setError(error.message); // Set error message
            setWeatherData(null); // Clear weather data
            setForecastData(null); // Clear forecast data
        } finally {
            setLoading(false); // Set loading to false after fetching data
        }
    }

    async function handleSearch() {
        fetchWeatherData(search); // Function to handle search
    }

    function convertTemperature(temp) {
        if (unit === 'metric') {
            return temp; // Convert temperature to desired unit (Celsius or Fahrenheit)
        } else {
            return (temp * 9 / 5) + 32;
        }
    }

    function getWeatherIconUrl(iconCode) {
        return `https://openweathermap.org/img/wn/${iconCode}.png`; // Function to get weather icon URL
    }

    useEffect(() => {
        if (search.trim() !== '') {
            fetchWeatherData(search); // Fetch weather data when search query changes
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unit}&appid=075335bc4fb43ae67a55693444276c56`);
                            const data = await response.json();

                            if (!response.ok) {
                                throw new Error(data.message);
                            }

                            setWeatherData(data);

                            const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${unit}&appid=075335bc4fb43ae67a55693444276c56`);
                            const forecastData = await forecastResponse.json();

                            if (!forecastResponse.ok) {
                                throw new Error(forecastData.message);
                            }

                            setForecastData(forecastData);
                            setError(null);
                        } catch (error) {
                            setError(error.message);
                            setWeatherData(null);
                            setForecastData(null);
                        } finally {
                            setLoading(false);
                        }
                    },
                    (error) => {
                        setError('Error fetching current location');
                        setLoading(false);
                    }
                );
            } else {
                setError('Geolocation is not supported by this browser');
                setLoading(false);
            }
        }
    }, [search, unit]); // Run effect when search query or unit changes

    return (
        <div>
            <Search
                search={search}
                setSearch={setSearch}
                handleSearch={handleSearch}
            />
            {loading ? <div className="loading">Loading...</div> :
                error ? <div className="error">{error}</div> :
                    weatherData &&
                    <div>
                        <div className="city-name">
                            <h2>{weatherData.name}, <span>{weatherData.sys.country}</span></h2>
                        </div>
                        <div className="date">
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="temp">{convertTemperature(weatherData.main.temp)}°</div>
                        <div className="temperarure-unit-selector">
                            <label className="celsius">
                                <input
                                    type="radio"
                                    name="unit"
                                    value="metric"
                                    checked={unit === 'metric'}
                                    onChange={() => setUnit('metric')}
                                />
                                Celsius
                            </label>
                            <label className="fahrenheit">
                                <input
                                    type="radio"
                                    name="unit"
                                    value="imperial"
                                    checked={unit === 'imperial'}
                                    onChange={() => setUnit('imperial')}
                                />
                                Fahrenheit
                            </label>

                        </div>
                        <img src={getWeatherIconUrl(weatherData.weather[0].icon)} alt="Weather Icon" />
                        <p className="description">
                            {weatherData.weather[0].description}
                        </p>
                        <div className="weather-info">
                            <div className="column">
                                <div>
                                    <p className="wind">{weatherData.wind.speed} m/s</p>
                                    <p>Wind Speed</p>
                                </div>
                            </div>
                            <div className="column">
                                <div>
                                    <p className="humidity">{weatherData.main.humidity}%</p>
                                    <p>Humidity</p>
                                </div>
                            </div>
                        </div>
                    </div>
            }
            {forecastData && (
                <div className="forecast">
                    <h3>Forecast</h3>
                    <div className="forecast-items">
                        {forecastData.list.map((item, index) => (
                            <div key={index} className="forecast-item">
                                <div>{new Date(item.dt * 1000).toLocaleDateString()}</div>
                                <div>Temperature: {convertTemperature(item.main.temp)}°</div>
                                <img src={getWeatherIconUrl(item.weather[0].icon)} alt="Weather Icon" />
                                <div>{item.weather[0].description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Weather; // Exporting the Weather component as default