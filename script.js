//Elements Selectors
let currentUnit = "metric";
let currentWeatherData = null;
// Units Dropdown
const unitBtn = document.querySelector(".unit_button");
const unitDropdown = document.querySelector(".units_dropdown");
const dropdownOptions = document.querySelectorAll(".dropdown_option");
const toggleSwitch = document.querySelector(".switch_units");

//to hide elements
const gridContainer = document.querySelector(".grid_container");
const attribution = document.querySelector(".attribution");



// Search Bar
const search = document.getElementById("searchInput");
const searchBtn = document.querySelector(".search_button");
const suggestionBox = document.querySelector(".search_suggestion");

//Error state elements
const errorState = document.querySelector(".error_state");
const retryButton = document.querySelector(".retry_button");

// object to hold weather icon
const weatherCodeToIcon = {
  0: "icon-sunny",
  1: "icon-partly-cloudy",
  2: "icon-partly-cloudy",
  3: "icon-overcast",
  45: "icon-fog",
  48: "icon-fog",
  51: "icon-drizzle",
  53: "icon-drizzle",
  55: "icon-drizzle",
  61: "icon-rain",
  63: "icon-rain",
  65: "icon-rain",
  71: "icon-snow",
  73: "icon-snow",
  75: "icon-snow",
  95: "icon-storm",
  96: "icon-storm",
  99: "icon-storm",
};

const getIconName = (code) => {
  if (!(code in weatherCodeToIcon)) {
    return "icon-sunny";
  }
  return weatherCodeToIcon[code];
};

//Functions

// Function to show error state
function showErrorState() {
  console.log("Showing error state");
  errorState.classList.remove("hidden");
  errorState.classList.add("visible");
}

function hideErrorState() {
  console.log("Hiding error state");
  errorState.classList.remove("visible");
  errorState.classList.add("hidden");
}

function handleRetry() {
  console.log("Retry clicked");
  hideErrorState();

  // If there was a previous search, retry it
  if (search.value.trim()) {
    handleSearchClick();
  } else {
    // If no search, just reload the current weather (Berlin)
    fetchCityWeather("Lagos");
  }
}

function showLoadingState() {
  suggestionBox.classList.add("visible");
  searchBtn.disabled = true;
  search.disabled = true;
  searchBtn.style.cursor = "not-allowed";
}

function hideLoadingState() {
  // suggestionBox.classList.remove("visible");
  searchBtn.disabled = false;
  searchBtn.style.cursor = "pointer";
  search.disabled = false;
  console.log("loading state: hidden");
}

function toggleUnitDropdown(e) {
  e.stopPropagation();
  console.log("Dropdown clicked");
  unitDropdown.classList.toggle("show");
}

function closeDropDownOnClickOutside(e) {
  if (
    unitDropdown.classList.contains("show") &&
    !unitBtn.contains(e.target) &&
    !unitDropdown.contains(e.target)
  ) {
    console.log("clicked outside the dropdown");
    unitDropdown.classList.remove("show");
  }
}

function handleOptionSelection(e) {
  const clickedButton = e.currentTarget;
  const section = clickedButton.closest(".dropdown_section");
  const currentActive = section.querySelector(".active_option");

  currentActive.classList.remove("active_option");
  currentActive.querySelector("span").remove();
  clickedButton.classList.add("active_option");

  const span = document.createElement("span");
  const img = document.createElement("img");
  img.src = "./assets/images/icon-checkmark.svg";
  img.alt = "checkmark icon";

  clickedButton.appendChild(span);
  span.appendChild(img);
}

function toggleUnitSystem(e) {
  e.stopPropagation();
  if (!currentWeatherData) {
    console.log("No weather data available");
    return;
  }

  if (toggleSwitch.textContent === "Switch to Imperial") {
    toggleSwitch.textContent = "Switch to Metric";
    currentUnit = "imperial";
    updateDropdownSelection("imperial");
  } else {
    toggleSwitch.textContent = "Switch to Imperial";
    currentUnit = "metric";
    updateDropdownSelection("metric");
  }

  updateWeatherUI(currentWeatherData);
  console.log("Current Unit System:", currentUnit);
}

async function handleSearchClick() {
  console.log(search.value);
 
  if (!search.value.trim()) {
    console.log("search input is empty");
    return;
  }
   suggestionBox.classList.add("visible");
    showLoadingState();
  
    try {
      const result = await fetchCityWeather(search.value);

      hideLoadingState();

      if (!result) {
        console.error("City not found");
        return;
      }
      console.log("this is handlesearchclick result", result);
      currentWeatherData = result;
      updateWeatherUI(result);
      console.log("City Weather Result:", result);
    } catch (error) {
      hideLoadingState();
      console.error("Error fetching city weather:", error);
      showErrorState();
    }
  }


//Geocoding API Call
async function getCoordinates(cityName) {
  try {
    console.log("Fetching coordinates for:", cityName);

    showLoadingState();

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=5`
    );

    if (!response.ok) {
      throw new Error("Geocoding Failed");
    }

    const data = await response.json();
    console.log("Geocoding data:", data);

    if (!data.results || data.results.length === 0) {
      throw new Error("No results found");
    }

    

    if (data.results.length > 1) {
      displayCitySuggestions(data.results);
      return { suggestions: data.results };
    } else {
      const { latitude, longitude, name, country } = data.results[0];
      console.log(
        `Coordinates for ${cityName}: Lat ${latitude}, Lon ${longitude}`
      );
      return { latitude, longitude, name, country };
    }
  } catch (error) {
    console.log("Geocoding error:", error);
    hideLoadingState();
    showErrorState();
    return null;
  }
}

//function to display city suggestions
function displayCitySuggestions(cities) {
  suggestionBox.innerHTML = "";

  cities.forEach((city) => {
    const cityItem = document.createElement("li");
    cityItem.classList.add("suggestion_item");
    cityItem.textContent = `${city.name}, ${city.country}`;
    cityItem.setAttribute("data-lat", city.latitude);
    cityItem.setAttribute("data-lon", city.longitude);
    cityItem.setAttribute("data-name", city.name);
    cityItem.setAttribute("data-country", city.country);
    suggestionBox.appendChild(cityItem);
    cityItem.addEventListener("click", async () => {
      const latitude = cityItem.getAttribute("data-lat");
      const longitude = cityItem.getAttribute("data-lon");
      const name = cityItem.getAttribute("data-name");
      const country = cityItem.getAttribute("data-country");

      const weather = await getWeatherData(latitude, longitude);
      const result = {
        cityInfo: { latitude, longitude, name, country },
        weather,
      };
      currentWeatherData = result;

      
      updateWeatherUI(result);
      suggestionBox.classList.remove("visible");
      hideLoadingState();
    });
  });
}

//weather Api to get city weather data
async function getWeatherData(lat, lon) {
  try {
    console.log("Getting weather for coordinates:", lat, lon);

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
    );

    if (!response.ok) throw new Error("Weather data fetch failed");

    const data = await response.json();
    console.log("Weather data:", data);
    return data;
  } catch (error) {
    console.error("Weather data error:", error);
    showErrorState();
    return null;
  }
}

async function fetchCityWeather(cityName) {
  try {
    console.log("Fetching weather for city:", cityName);

    const coords = await getCoordinates(cityName);

    if (coords && coords.suggestions) {
      return null;
    }

    const weatherData = await getWeatherData(coords.latitude, coords.longitude);

    if (!weatherData) {
      throw new Error("Failed to get weather data");
    }

    return { cityInfo: coords, weather: weatherData };
  } catch (error) {
    console.error("Failed to fetch city weather", error);
    showErrorState();
    return null;
  }
}

//update dropdown selections

function updateDropdownSelection(unit) {
  if (unit === "metric") {
    dropdownOptions[0].click(); //temperature
    dropdownOptions[2].click(); //wind speed
    dropdownOptions[4].click(); //precipitation
  } else if (unit === "imperial") {
    dropdownOptions[1].click();
    dropdownOptions[3].click();
    dropdownOptions[5].click();
  }
}

//function to convert celsius to fahrenheit
function convertTemperatureUnits(unit, value) {
  switch (unit) {
    case "metric":
      return value;
    case "imperial":
      return Math.round(value * 1.8 + 32);
    default:
      return value;
  }
}

//function to convert km/h to mph
function convertWindSpeedUnits(unit, value) {
  switch (unit) {
    case "metric":
      return value;
    case "imperial":
      return Math.round(value / 1.609);
    default:
      return value;
  }
}

//function to convert mm to inches
function convertPrecipitationUnits(unit, value) {
  switch (unit) {
    case "imperial":
      return Math.round(value / 25.4);
    case "metric":
      return value;
    default:
      return value;
  }
}

//function to get update hourly weather UI
function updateHourlyForecast(hourlyData, unit) {
  const hourlyContainer = document.querySelector(".hourly_container");
  hourlyContainer.innerHTML = ""; // Clear existing cards

  // Only show the next 8 hours
  for (let i = 0; i < 8; i++) {
    const time = new Date(hourlyData.time[i]);
    const temp = Math.round(hourlyData.temperature_2m[i]);
    const weatherCode = hourlyData.weather_code[i];
    const iconName = getIconName(weatherCode);

    const hourCard = document.createElement("div");
    hourCard.classList.add("hourly_cards");

    const displayTemp =
      unit === "metric"
        ? `${temp}°`
        : `${convertTemperatureUnits("imperial", temp)}°`;

    hourCard.innerHTML = `
      <div class="time_weather_group">
        <img src="./assets/images/${iconName}.webp" alt="${iconName} icon">
        <p class="time">${time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}</p>
      </div>
      <p class="degs" data-temp="${temp}">${displayTemp}</p>
    `;

    hourlyContainer.appendChild(hourCard);
  }
}

//function to get update daily weather UI
function updateDailyForecast(dailyData, unit) {
  const dailyContainer = document.querySelector(".forecast_cards");

  dailyContainer.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const date = new Date(dailyData.time[i]);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const maxTemp = Math.round(dailyData.temperature_2m_max[i]);
    const minTemp = Math.round(dailyData.temperature_2m_min[i]);
    const weatherCode = dailyData.weather_code[i];
    const iconName = getIconName(weatherCode);

    const dayCard = document.createElement("div");
    dayCard.classList.add("forecast__card");

    const displayMax =
      unit === "metric"
        ? `${maxTemp}°`
        : `${convertTemperatureUnits("imperial", maxTemp)}°`;
    const displayMin =
      unit === "metric"
        ? `${minTemp}°`
        : `${convertTemperatureUnits("imperial", minTemp)}°`;

    dayCard.innerHTML = `
      <p>${dayName}</p>
      <img src="./assets/images/${iconName}.webp" alt="${iconName} icon">
      <div class="degrees">
        <p data-temp="${maxTemp}">${displayMax}</p>
        <p data-temp="${minTemp}">${displayMin}</p>
      </div>
    `;

    dailyContainer.appendChild(dayCard);
  }
}

//function to update UI
function updateWeatherUI(weatherData) {
  console.log("Updating UI with:", weatherData);
  gridContainer.classList.remove('hidden');
attribution.classList.remove('hidden');
  const { cityInfo: city, weather } = weatherData;

  //weather details
  const currentWeather = weather.current;
  const dailyWeather = weather.daily;
  const hourlyWeather = weather.hourly;
  const temp = Math.round(currentWeather.temperature_2m);
  const feelsLike = Math.round(currentWeather.apparent_temperature);
  const humidity = currentWeather.relative_humidity_2m;
  const wind = Math.round(currentWeather.wind_speed_10m);
  const precipitation = currentWeather.precipitation;
  const weatherCode = currentWeather.weather_code;
  const img = document.querySelector(".hero_icon");

  const iconName = getIconName(weatherCode);
  console.log("icon name:", iconName);
  console.log("precip UI with:", precipitation);
  updateHourlyForecast(hourlyWeather, currentUnit);
  updateDailyForecast(dailyWeather, currentUnit);

  // Update city name and date
  const cityName = document.querySelector(".city");
  const date = document.querySelector(".date");
  const cityTemp = document.querySelector(".city_temp");
  const cityWind = document.querySelector(".js_wind");
  const cityHumidity = document.querySelector(".js_humidity");
  const cityFeelsLike = document.querySelector(".feels_like");
  const cityPrecip = document.querySelector(".js_precip");
  img.src = `./assets/images/${iconName}.webp`;
  img.alt = `weather icon representing ${iconName
    .replace("icon-", "")
    .replace("-", " ")}`;

  cityName.textContent = `${city.name}, ${city.country}`;
  date.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  cityTemp.textContent = `${temp}°`;
  cityTemp.setAttribute("data-temp", temp);
  cityWind.textContent = `${wind} km/h`;
  cityWind.setAttribute("data-wind", wind);
  cityHumidity.textContent = `${humidity}%`;
  cityHumidity.setAttribute("data-humid", humidity);
  cityFeelsLike.textContent = `${feelsLike}°`;
  cityFeelsLike.setAttribute("data-temp", feelsLike);
  cityPrecip.textContent = `${precipitation} mm`;
  cityPrecip.setAttribute("data-precip", precipitation);

  if (currentUnit === "imperial") {
    cityTemp.textContent = `${convertTemperatureUnits(
      "imperial",
      Number(cityTemp.dataset.temp)
    )}°`;
    cityWind.textContent = `${convertWindSpeedUnits(
      "imperial",
      Number(cityWind.dataset.wind)
    )} mph`;
    cityFeelsLike.textContent = `${convertTemperatureUnits(
      "imperial",
      Number(cityFeelsLike.dataset.temp)
    )}°`;
    cityPrecip.textContent = `${convertPrecipitationUnits(
      "imperial",
      Number(cityPrecip.dataset.precip)
    )} in`;
  } else if (currentUnit === "metric") {
    cityTemp.textContent = `${Number(cityTemp.dataset.temp)}°`;
    cityWind.textContent = `${Number(cityWind.dataset.wind)} km/h`;
    cityFeelsLike.textContent = `${Number(cityFeelsLike.dataset.temp)}°`;
    cityPrecip.textContent = `${Number(cityPrecip.dataset.precip)} mm`;
  }
}

// Event Listeners

unitBtn.addEventListener("click", toggleUnitDropdown);

document.addEventListener("click", closeDropDownOnClickOutside);

// handle dropdown option selection

dropdownOptions.forEach((option) => {
  option.addEventListener("click", handleOptionSelection);
});

// handle switch toggle between imperial and metic

toggleSwitch.addEventListener("click", toggleUnitSystem);

// Search bar functionality
search.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    handleSearchClick();
  }
});
searchBtn.addEventListener("click", handleSearchClick);
// Add retry button event listener
retryButton.addEventListener("click", handleRetry);


// Test function to simulate API error
function simulateApiError() {
  console.log('Simulating API error...');
  showErrorState();
}