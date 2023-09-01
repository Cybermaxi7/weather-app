import { useEffect, useState } from "react";
import Weather from "./Weather";

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function App() {
  const [location, setLocation] = useState(function () {
    const data = localStorage.getItem("location");
    return data ? data : "";
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayLocation, setDisplayLocation] = useState("");
  const [weather, setWeather] = useState({});

  useEffect(
    function () {
      async function fetchWeather() {
        if (location.length < 2) return;
        try {
          // 1) Getting location (geocoding)

          setIsLoading(true);
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
          );
          const geoData = await geoRes.json();
          console.log(geoData);

          if (!geoData.results) throw new Error("Location not found");

          const { latitude, longitude, timezone, name, country_code } =
            geoData.results.at(0);
          setDisplayLocation(`${name} ${convertToFlag(country_code)}`);

          // 2) Getting actual weather
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
          );
          const weatherData = await weatherRes.json();
          setWeather(weatherData.daily);
          // console.log(weather);
        } catch (err) {
          console.error(err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      fetchWeather();
      localStorage.setItem("location", location);
      return function () {
        setError("");
        setWeather({});
      };
    },
    [location]
  );

  return (
    <div className="app">
      <h1>Cybermaxi's Weather <span> App</span></h1>
      <Input location={location} setLocation={setLocation} />
      {/* <button onClick={fetchWeather}>Get Weather</button> */}
      {isLoading && <p className="loader">Loading...</p>}
      {<p>{error}</p>}
      {location && weather?.weathercode && displayLocation}
      {location && weather?.weathercode && (
        <Weather weather={weather} location={location} />
      )}
    </div>
  );
}

function Input({ location, setLocation }) {
  return (
    <input
      type="text"
      placeholder="Search  from location..."
      value={location}
      onChange={(e) => setLocation(e.target.value)}
    />
  );
}

export default App;
