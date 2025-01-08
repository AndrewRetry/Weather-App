const APIKEY = "4b741c899bfe71d7a9ab357a3a9e7c3a"

const searchBtn = document.querySelector("#searchButton")
const searchBar = document.querySelector("#searchQuery")


// Add event listener directly without an unnecessary check
searchBtn.addEventListener("click", async function () {
    const userInput = searchBar.value;
    if (userInput) {
        const { cityName, countryCode } = parseInput(userInput); // Parse city and optional country code
        const locationArray = await getCoordinates(cityName, countryCode);
        if (locationArray) {
            const [lat, lon, name] = locationArray;

            const infoArray = await getWeatherInfo(lat, lon);
            const aqiIndex = await getAqiInfo(lat, lon);

            if (infoArray && aqiIndex !== undefined) {
                infoArray.push(name);
                infoArray.push(aqiIndex);
                updateContent(infoArray);
            }
        }
    } else {
        console.error("Please enter a city name.");
    }
});

// Function to parse user input
function parseInput(input) {
    const parts = input.split(",");
    const cityName = parts[0].trim(); // Extract city name
    const countryCode = parts[1]?.trim().toUpperCase() || null; // Extract optional country code
    return { cityName, countryCode };
}

async function getCoordinates(cityName, countryCode = null) {
    // return array [lat, lon, name]
    const locatorURL = countryCode
    ? `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)},${countryCode}&limit=1&appid=${APIKEY}`
    : `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${APIKEY}`;
    try {
        const response = await fetch(locatorURL)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        if (!data || data.length === 0) {
            alert("No data found for the city, please check the city name or country code!");
            return null;
        }

        const latValue = data[0].lat;
        const lonValue = data[0].lon;
        const officialName = data[0].name;
        return [latValue, lonValue, officialName];
    } catch (error) {
        alert("Error fetching coordinates:", error);
        return null;
    }
}

async function getWeatherInfo (lat, lon) {
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKEY}&units=metric`

    try {
        const response = await fetch(weatherURL)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        if (!data || !data.weather || data.weather.length === 0) {
            alert("No weather data found for the given location.");
            return null;
        }

        const weatherType = data.weather[0].description;
        const weatherIcon = data.weather[0].icon;
        
        const tempCurrent = data["main"]["temp"]
        const tempFeels = data["main"]["feels_like"]
        const humidityValue = data["main"]["humidity"]

        const countryName = data["sys"]["country"]

        return [weatherType, weatherIcon, tempCurrent, tempFeels, humidityValue, countryName]

    } catch (error) {
        alert("Error fetching weather info:", error);
    }
    
}

async function getAqiInfo (lat, lon) {
    const aqiURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${APIKEY}`

    try {
        const response = await fetch(aqiURL)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        if (!data || !data.list || data.list.length === 0) {
            alert("No AQI data found for the given location.");
            return null;
        }

        return data.list[0].main.aqi; // aqiIndex

    } catch (error) {
        alert(`Error fetching AQI info: ${error.message}`);
        return null;
    }
    
}

const weatherDescriptions = {
    "01d": { icon: "01d.png", description: "Clear sky", flavorText: "Bright and Beautiful" },
    "01n": { icon: "01n.png", description: "Clear sky", flavorText: "Bright and Beautiful" },
    "02d": { icon: "02d.png", description: "Few clouds", flavorText: "Partly Sunny Bliss" },
    "02n": { icon: "02n.png", description: "Few clouds", flavorText: "Partly Sunny Bliss" },
    "03d": { icon: "03d.png", description: "Scattered clouds", flavorText: "Cloudy Wanderers" },
    "03n": { icon: "03n.png", description: "Scattered clouds", flavorText: "Cloudy Wanderers" },
    "04d": { icon: "04d.png", description: "Broken clouds", flavorText: "Fragmented Overcast" },
    "04n": { icon: "04n.png", description: "Broken clouds", flavorText: "Fragmented Overcast" },
    "09d": { icon: "09d.png", description: "Shower rain", flavorText: "Light Rain Showers" },
    "09n": { icon: "09n.png", description: "Shower rain", flavorText: "Light Rain Showers" },
    "10d": { icon: "10d.png", description: "Rain", flavorText: "Gentle Rainfall" },
    "10n": { icon: "10n.png", description: "Rain", flavorText: "Gentle Rainfall" },
    "11d": { icon: "11d.png", description: "Thunderstorm", flavorText: "Stormy Energy" },
    "11n": { icon: "11n.png", description: "Thunderstorm", flavorText: "Stormy Energy" },
    "13d": { icon: "13d.png", description: "Snow", flavorText: "Winter Wonderland" },
    "13n": { icon: "13n.png", description: "Snow", flavorText: "Winter Wonderland" },
    "50d": { icon: "50d.png", description: "Mist", flavorText: "Shrouded in Mystery" },
    "50n": { icon: "50n.png", description: "Mist", flavorText: "Shrouded in Mystery" },
};

const aqiDescriptions = {
    "1": { 
        level: "Good", 
        description: "Air quality is excellent.", 
        color: "#00e400" // Green
    },
    "2": { 
        level: "Fair", 
        description: "Air quality is acceptable.", 
        color: "#ffff00" // Yellow
    },
    "3": { 
        level: "Moderate", 
        description: "Sensitive groups should take care.", 
        color: "#ff7e00" // Orange
    },
    "4": { 
        level: "Poor", 
        description: "May affect health, reduce exposure.", 
        color: "#ff0000" // Red
    },
    "5": { 
        level: "Very Poor", 
        description: "Serious health effects, stay indoors.", 
        color: "#99004c" // Deep Red
    }
};
function updateContent (infoArray) {
    //[weatherType, weatherIcon, tempCurrent, tempFeels, humidityValue, countryName, officialName, AQI]
    let temperatureDisplay = document.querySelector("#temperatureDisplay") //28°C
    let temperatureFeelDisplay = document.querySelector("#temperatureFeelDisplay") //Feels like 30°C

    let weatherType = document.querySelector("#weatherDisplay") //Few Clouds
    let weatherIcon = document.querySelector("#weatherIcon") //02d
    let weatherDescription = document.querySelector("#weatherDescription") //Partly Sunny Bliss

    let humidityDisplay = document.querySelector("#humidityDisplay") //45%

    let countryName = document.querySelector("#country") //ID
    let officialName = document.querySelector("#city") //London

    let aqiIndex = document.querySelector("#aqiDisplay") //1
    let aqiDescription = document.querySelector("#aqiDescription") //Good

    if (!weatherDescriptions[infoArray[1]]) {
        console.error("Weather description not found.");
        return;
    }
    // Assign Text
    weatherType.textContent = weatherDescriptions[infoArray[1]]["description"]
    weatherIcon.src = `resources/weatherIcon/${infoArray[1]}.png`
    weatherDescription.textContent = weatherDescriptions[infoArray[1]]["flavorText"]

    temperatureDisplay.textContent = `${infoArray[2]}°C`
    temperatureFeelDisplay.textContent = `Feels like ${infoArray[3]}°C`

    humidityDisplay.textContent = `${infoArray[4]}%`

    aqiIndex.textContent = infoArray[7]
    aqiDescription.textContent = aqiDescriptions[infoArray[7]]["description"]
    aqiIndex.style.color = aqiDescriptions[infoArray[7]]["color"]

    countryName.textContent = iso3166ToCountry[infoArray[5]]
    officialName.textContent = infoArray[6]

    animateCards();
}

// styling animation

function animateCards() {
    const cards = document.querySelectorAll(".cards");
    cards.forEach(card => {
        card.classList.remove("animate");
        void card.offsetWidth; // Trigger reflow to restart animation
        card.classList.add("animate");
    });
}

document.body.style.opacity = 0;
document.body.style.transition = "opacity 1s";

window.onload = () => {
    document.body.style.opacity = 1;
};