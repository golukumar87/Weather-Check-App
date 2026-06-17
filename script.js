// ===== CONFIGURATION =====
class WeatherApp {
    constructor() {
        // Multiple APIs with fallback support
        this.apis = {
            openweathermap: {
                name: 'OpenWeatherMap',
                current: 'https://api.openweathermap.org/data/2.5/weather',
                forecast: 'https://api.openweathermap.org/data/2.5/forecast',
                // NOTE: Do NOT hardcode API keys for Vercel.
                // Put your key in Vercel Environment Variables as OPENWEATHER_API_KEY.
                // If not set, fallback to empty string to avoid leaking keys.
                key: (typeof process !== 'undefined' && process?.env?.OPENWEATHER_API_KEY) ? process.env.OPENWEATHER_API_KEY : ''

            }
        };

        this.currentAPI = 'openweathermap';

        // If running on Vercel (frontend-only), process.env may not exist.
        // Keep key empty so it won't leak. User must configure key in the right place.

        this.weatherData = null;
        this.isLoading = false;
        
        this.init();
    }
    
    // ===== INITIALIZATION =====
    init() {
        console.log("Weather App Initializing...");
        
        // Initialize event listeners first
        this.initEventListeners();
        
        // Initialize time updater
        this.initTimeUpdater();
        
        // DON'T auto-fetch on startup - let user enter city first
        // this.setDefaultCity();
        
        // Initialize UI with default data
        this.updateUIWithDefaults();
        
        console.log("Weather App Initialized!");
    }
    
    // ===== INITIALIZE UI WITH DEFAULTS =====
    updateUIWithDefaults() {
        // Set default placeholder values
        document.getElementById('cityName').innerHTML = 
            `<i class="fas fa-map-marker-alt"></i> <span>Enter City Name</span>`;
        document.getElementById('temperature').textContent = '--';
        document.getElementById('feelsLike').textContent = `Feels like --°C`;
        document.getElementById('tempRange').textContent = `--° / --°`;
        document.getElementById('description').textContent = 'Enter city name to get weather';
        document.getElementById('windSpeed').textContent = `-- km/h`;
        document.getElementById('humidity').textContent = `--%`;
        document.getElementById('visibility').textContent = `-- km`;
        
        // Set current time
        this.updateCurrentTime();
        
        // Create default forecast cards
        this.createDefaultForecast();
    }
    
    // ===== CREATE DEFAULT FORECAST CARDS =====
    createDefaultForecast() {
        const container = document.querySelector('.forecast-cards');
        container.innerHTML = '';
        
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        
        days.forEach(day => {
            const card = document.createElement('div');
            card.className = 'forecast-card glass';
            card.innerHTML = `
                <p class="day">${day}</p>
                <div class="icon-forecast">
                    <i class="fas fa-question-circle" style="font-size: 2.5rem; color: var(--primary);"></i>
                </div>
                <p class="temp">--°</p>
                <p class="condition">--</p>
            `;
            container.appendChild(card);
        });
    }
    
    // ===== WEATHER DATA FETCHING (SIMPLIFIED) =====
    async getWeather() {
        const city = document.getElementById('city').value.trim();
        
        if (!city) {
            this.showNotification('Please enter a city name', 'error');
            return;
        }
        
        // Don't allow multiple simultaneous requests
        if (this.isLoading) {
            this.showNotification('Already fetching weather data...', 'info');
            return;
        }
        
        this.isLoading = true;
        this.showLoading(true);
        
        try {
            console.log(`Fetching weather for: ${city}`);
            
            // Use mock data if API fails (for testing)
            const mockData = await this.getMockWeatherData(city);
            this.weatherData = mockData;
            
            // Try real API if mock data is used
            try {
                const realData = await this.fetchRealWeatherData(city);
                this.weatherData = realData;
                console.log("Real API data received!");
            } catch (apiError) {
                console.log("Using mock data due to API error:", apiError.message);
                // Continue with mock data
            }
            
            // Update UI with the data
            this.updateUI(this.weatherData);
            
            this.showNotification(`Weather data loaded for ${this.weatherData.city}`, 'success');
            
        } catch (error) {
            console.error('Error in getWeather:', error);
            this.showNotification('Failed to fetch weather data. Please try again.', 'error');
            
            // Show mock data on error
            const mockData = await this.getMockWeatherData(city);
            this.weatherData = mockData;
            this.updateUI(mockData);
            
        } finally {
            // ALWAYS hide loading
            this.isLoading = false;
            this.showLoading(false);
            console.log("Loading completed");
        }
    }
    
    // ===== MOCK WEATHER DATA (ALWAYS WORKS) =====
    async getMockWeatherData(city) {
        // Generate realistic mock data based on city name
        const cityHash = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        const conditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm', 'Mist'];
        const icons = ['01d', '02d', '03d', '04d', '09d', '10d', '11d', '13d', '50d'];
        
        const conditionIndex = cityHash % conditions.length;
        const condition = conditions[conditionIndex];
        const icon = icons[conditionIndex];
        
        // Generate temperatures based on city hash (for variety)
        const baseTemp = 20 + (cityHash % 20); // 20-40°C range
        const feelsLike = baseTemp + (cityHash % 5) - 2;
        const minTemp = baseTemp - 3 - (cityHash % 4);
        const maxTemp = baseTemp + 3 + (cityHash % 4);
        
        // Generate forecast data
        const forecast = [];
        const today = new Date();
        
        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const forecastCondition = conditions[(conditionIndex + i) % conditions.length];
            const forecastIcon = icons[(conditionIndex + i) % icons.length];
            const forecastTemp = baseTemp + (i * 2) - 4;
            
            forecast.push({
                date: date,
                temp: forecastTemp,
                icon: forecastIcon,
                condition: forecastCondition
            });
        }
        
        return {
            city: city.charAt(0).toUpperCase() + city.slice(1),
            country: 'Mock',
            temp: Math.round(baseTemp),
            feels_like: Math.round(feelsLike),
            temp_min: Math.round(minTemp),
            temp_max: Math.round(maxTemp),
            humidity: 40 + (cityHash % 40),
            pressure: 1013 + (cityHash % 10),
            wind_speed: 5 + (cityHash % 15),
            wind_deg: cityHash % 360,
            description: condition.toLowerCase(),
            icon: icon,
            condition: condition.toLowerCase(),
            sunrise: new Date(Date.now() - 4 * 60 * 60 * 1000),
            sunset: new Date(Date.now() + 4 * 60 * 60 * 1000),
            visibility: (10 + (cityHash % 10)).toFixed(1),
            forecast: forecast
        };
    }
    
    // ===== REAL WEATHER DATA FETCHING =====
    async fetchRealWeatherData(city) {
        const api = this.apis[this.currentAPI];
        
        // Try with different endpoints
        const urls = [
            `${api.current}?q=${city}&appid=${api.key}&units=metric`,
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api.key}&units=metric`
        ];
        
        let lastError = null;
        
        for (const url of urls) {
            try {
                console.log(`Trying URL: ${url}`);
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const current = await response.json();
                console.log("API Response received:", current);
                
                // Get forecast data if current is successful
                let forecastData = [];
                try {
                    const forecastUrl = `${api.forecast}?q=${city}&appid=${api.key}&units=metric`;
                    const forecastResponse = await fetch(forecastUrl);
                    
                    if (forecastResponse.ok) {
                        const forecast = await forecastResponse.json();
                        forecastData = forecast.list.slice(0, 5).map(item => ({
                            date: new Date(item.dt * 1000),
                            temp: Math.round(item.main.temp),
                            icon: item.weather[0].icon,
                            condition: item.weather[0].main
                        }));
                    }
                } catch (forecastError) {
                    console.log("Forecast API failed, using mock forecast");
                    // Use mock forecast if API fails
                }
                
                // Build-time fallback (optional). If OPENWEATHER_API_KEY is embedded into the bundle, it will work locally too.
                // If key is missing, UI will fallback to mock data.
                if (!api.key) {
                    throw new Error('Missing OPENWEATHER_API_KEY');
                }

                return {
                    city: current.name,

                    country: current.sys?.country || 'Unknown',
                    temp: Math.round(current.main.temp),
                    feels_like: Math.round(current.main.feels_like),
                    temp_min: Math.round(current.main.temp_min),
                    temp_max: Math.round(current.main.temp_max),
                    humidity: current.main.humidity,
                    pressure: current.main.pressure,
                    wind_speed: Math.round(current.wind.speed * 3.6),
                    wind_deg: current.wind.deg,
                    description: current.weather[0].description,
                    icon: current.weather[0].icon,
                    condition: current.weather[0].main.toLowerCase(),
                    sunrise: new Date(current.sys.sunrise * 1000),
                    sunset: new Date(current.sys.sunset * 1000),
                    visibility: current.visibility ? (current.visibility / 1000).toFixed(1) : '10',
                    forecast: forecastData.length > 0 ? forecastData : await this.generateMockForecast(current)
                };
                
            } catch (error) {
                lastError = error;
                console.log(`URL failed: ${url}`, error);
                continue;
            }
        }
        
        throw lastError || new Error('All API endpoints failed');
    }
    
    // ===== UI UPDATES =====
    updateUI(data) {
        // Update main info
        document.getElementById('cityName').innerHTML = 
            `<i class="fas fa-map-marker-alt"></i> <span>${data.city}, ${data.country}</span>`;
        document.getElementById('temperature').textContent = data.temp;
        document.getElementById('feelsLike').textContent = `Feels like ${data.feels_like}°C`;
        document.getElementById('tempRange').textContent = `${data.temp_min}° / ${data.temp_max}°`;
        document.getElementById('description').textContent = 
            data.description.charAt(0).toUpperCase() + data.description.slice(1);
        document.getElementById('windSpeed').textContent = `${data.wind_speed} km/h`;
        document.getElementById('humidity').textContent = `${data.humidity}%`;
        document.getElementById('visibility').textContent = `${data.visibility} km`;
        
        // Update 3D icon
        this.update3DIcon(data.condition);
        
        // Update forecast
        this.updateForecast(data.forecast);
        
        // Update AQI (mock)
        const aqi = 50 + Math.floor(Math.random() * 100);
        document.getElementById('aqiText').textContent = `AQI: ${aqi}`;
        document.getElementById('aqiFill').style.width = `${(aqi / 300) * 100}%`;
        
        // Update background based on weather
        this.updateBackground(data.condition);
        
        console.log("UI Updated successfully!");
    }
    
    update3DIcon(condition) {
        const icon3D = document.querySelector('.icon-3d');
        const colors = {
            clear: '#FFD700',
            clouds: '#B0B0B0',
            rain: '#4169E1',
            snow: '#87CEEB',
            thunderstorm: '#9400D3',
            mist: '#708090'
        };
        
        // Change icon color based on condition
        const color = colors[condition] || colors.clear;
        
        // Update particles
        const particles = icon3D.querySelectorAll('.icon-particle');
        particles.forEach(p => {
            p.style.background = color;
        });
    }
    
    updateForecast(forecastData) {
        const container = document.querySelector('.forecast-cards');
        container.innerHTML = '';
        
        forecastData.forEach(day => {
            const card = document.createElement('div');
            card.className = 'forecast-card glass';
            
            // Get day name
            const dayName = day.date.toLocaleDateString('en-US', { weekday: 'short' });
            
            card.innerHTML = `
                <p class="day">${dayName}</p>
                <div class="icon-forecast">
                    <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" 
                         alt="${day.condition}"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"64\" height=\"64\"><circle cx=\"32\" cy=\"32\" r=\"30\" fill=\"%2300f3ff\" opacity=\"0.3\"/></svg>'">
                </div>
                <p class="temp">${day.temp}°</p>
                <p class="condition">${day.condition}</p>
            `;
            
            container.appendChild(card);
        });
    }
    
    generateMockForecast(currentData) {
        const forecast = [];
        const today = new Date();
        const baseTemp = currentData.temp;
        const condition = currentData.condition;
        
        const conditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm'];
        const icons = ['01d', '02d', '03d', '04d', '09d', '10d', '11d', '13d'];
        
        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const conditionIndex = (i + conditions.indexOf(condition.charAt(0).toUpperCase() + condition.slice(1))) % conditions.length;
            
            forecast.push({
                date: date,
                temp: baseTemp + (i * 2) - 4,
                icon: icons[conditionIndex],
                condition: conditions[conditionIndex]
            });
        }
        
        return forecast;
    }
    
    updateBackground(condition) {
        const gradients = {
            clear: 'linear-gradient(135deg, #1a2980, #26d0ce)',
            clouds: 'linear-gradient(135deg, #636363, #a2ab58)',
            rain: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
            snow: 'linear-gradient(135deg, #83a4d4, #b6fbff)',
            thunderstorm: 'linear-gradient(135deg, #232526, #414345)',
            mist: 'linear-gradient(135deg, #606c88, #3f4c6b)'
        };
        
        document.body.style.background = gradients[condition] || gradients.clear;
    }
    
    // ===== UTILITY FUNCTIONS =====
    updateCurrentTime() {
        const updateTime = () => {
            const now = new Date();
            const options = { 
                hour12: true,
                hour: '2-digit',
                minute: '2-digit'
            };
            document.getElementById('currentTime').textContent = 
                now.toLocaleTimeString('en-US', options);
        };
        
        updateTime();
        setInterval(updateTime, 60000); // Update every minute
    }
    
    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showNotification('Geolocation not supported', 'error');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 10000,
                    maximumAge: 60000
                });
            });
            
            const { latitude, longitude } = position.coords;
            
            // Use reverse geocoding or show coordinates
            document.getElementById('city').value = `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;
            
            // Try to get city name
            try {
                const api = this.apis[this.currentAPI];
                const geoRes = await fetch(
                    `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api.key}`
                );
                
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.length > 0) {
                        document.getElementById('city').value = geoData[0].name;
                    }
                }
            } catch (geoError) {
                console.log("Reverse geocoding failed, using coordinates");
            }
            
            // Get weather for this location
            await this.getWeather();
            
        } catch (error) {
            console.error('Geolocation error:', error);
            this.showNotification('Unable to get your location. Please enter city manually.', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    // ===== LOADING MANAGEMENT =====
    showLoading(show) {
        // Remove existing loader if any
        const existingLoader = document.getElementById('loading');
        if (existingLoader) {
            existingLoader.remove();
        }
        
        if (show) {
            const loader = document.createElement('div');
            loader.id = 'loading';
            loader.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(10, 10, 26, 0.9);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    z-index: 9999;
                    color: var(--primary);
                    font-size: 1.2rem;
                ">
                    <div style="
                        width: 50px;
                        height: 50px;
                        border: 5px solid var(--primary);
                        border-top: 5px solid transparent;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 20px;
                    "></div>
                    <span>Scanning atmosphere...</span>
                </div>
            `;
            
            // Add CSS for spin animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(loader);
        }
    }
    
    showNotification(message, type) {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        const icon = type === 'error' ? 'exclamation-circle' : 
                    type === 'success' ? 'check-circle' : 'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <i class="fas fa-times" style="margin-left: auto; cursor: pointer;"></i>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#2ed573' : '#1e90ff'};
            color: white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        
        // Close button
        notification.querySelector('.fa-times').onclick = () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        };
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // ===== EVENT LISTENERS =====
    initEventListeners() {
        console.log("Initializing event listeners...");
        
        // Search button
        document.querySelector('.search-btn').addEventListener('click', () => {
            this.getWeather();
        });
        
        // Location button
        document.querySelector('.location-btn').addEventListener('click', () => {
            this.getCurrentLocation();
        });
        
        // Enter key in search input
        document.getElementById('city').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.getWeather();
            }
        });
        
        // Forecast slider buttons
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                document.querySelector('.forecast-cards').scrollBy({ left: -200, behavior: 'smooth' });
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                document.querySelector('.forecast-cards').scrollBy({ left: 200, behavior: 'smooth' });
            });
        }
        
        // API switch button
        const switchBtn = document.querySelector('.switch-api-btn');
        if (switchBtn) {
            switchBtn.addEventListener('click', () => {
                this.showNotification('API switching feature coming soon!', 'info');
            });
        }
        
        // Feature buttons
        document.querySelectorAll('.feature-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.feature-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const view = e.target.textContent.includes('3D') ? '3D' :
                            e.target.textContent.includes('Radar') ? 'Radar' :
                            e.target.textContent.includes('Theme') ? 'Theme' : 'Share';
                
                this.showNotification(`${view} view activated!`, 'info');
            });
        });
        
        console.log("Event listeners initialized!");
    }
}

// ===== GLOBAL FUNCTIONS =====
let weatherApp;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing app...");
    weatherApp = new WeatherApp();
});

// Global function for HTML onclick
function getWeather() {
    if (weatherApp) {
        weatherApp.getWeather();
    } else {
        console.error("Weather app not initialized!");
    }
}

function getCurrentLocation() {
    if (weatherApp) {
        weatherApp.getCurrentLocation();
    }
}

function switchAPI() {
    if (weatherApp) {
        weatherApp.showNotification('API switching feature in development!', 'info');
    }
}

function changeView(view) {
    if (weatherApp) {
        document.querySelectorAll('.feature-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        weatherApp.showNotification(`Switched to ${view} view`, 'info');
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    
    if (weatherApp) {
        weatherApp.showNotification(`${isLight ? 'Light' : 'Dark'} theme activated`, 'info');
    }
}

function shareWeather() {
    if (weatherApp && weatherApp.weatherData) {
        const data = weatherApp.weatherData;
        const text = `Weather in ${data.city}: ${data.temp}°C, ${data.description}`;
        
        if (navigator.share) {
            navigator.share({
                title: `Weather in ${data.city}`,
                text: text,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                if (weatherApp) {
                    weatherApp.showNotification('Weather data copied to clipboard!', 'success');
                }
            });
        }
    } else {
        if (weatherApp) {
            weatherApp.showNotification('No weather data to share', 'error');
        }
    }
}