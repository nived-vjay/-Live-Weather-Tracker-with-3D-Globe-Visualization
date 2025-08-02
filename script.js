let Globe, scene, camera, renderer;

function initGlobeBackground() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    camera.position.z = 250;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    Globe = new ThreeGlobe()
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png');

    scene.add(Globe);

    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    Globe.rotation.y += 0.001;
    renderer.render(scene, camera);
}

async function pointToCity(lat, lon, cityName) {
    Globe.pointOfView({ lat, lng: lon, altitude: 1.5 }, 2000);
    Globe.labelsData([{ lat, lng: lon, text: cityName }])
        .labelSize(1.5)
        .labelDotRadius(0.4)
        .labelColor(() => 'rgba(255, 255, 255, 0.9)');
}

initGlobeBackground();

const API_KEY = '9bdd6cd06551554c58bdab498331b686';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const temp = document.getElementById('temp');
const weatherIcon = document.getElementById('weather-icon');
const weatherDescription = document.getElementById('weather-description');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const pressure = document.getElementById('pressure');
const errorMessage = document.getElementById('error-message');

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    } else {
        showError('Please enter a city name');
    }
});

locationBtn.addEventListener('click', getWeatherByLocation);

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherByCity(city);
        } else {
            showError('Please enter a city name');
        }
    }
});

function getWeatherByCity(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            hideError();
        })
        .catch(error => {
            showError(error.message);
        });
}

function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Weather data not available for your location');
                        }
                        return response.json();
                    })
                    .then(data => {
                        displayWeather(data);
                        hideError();
                    })
                    .catch(error => {
                        showError(error.message);
                    });
            },
            error => {
                showError('Geolocation is not supported or permission denied');
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
}

function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;

    const now = new Date();
    currentDate.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    temp.textContent = Math.round(data.main.temp);
    weatherDescription.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${data.wind.speed.toFixed(1)} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;

    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].main;

    pointToCity(data.coord.lat, data.coord.lon, data.name);
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function updateLiveTime() {
    const liveTime = document.getElementById('live-time');
    const now = new Date();
    liveTime.textContent = now.toLocaleTimeString('en-US', { hour12: false });
}

setInterval(updateLiveTime, 1000);
updateLiveTime();
getWeatherByCity('Bangalore'); 
