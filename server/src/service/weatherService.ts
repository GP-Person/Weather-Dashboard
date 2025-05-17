import dotenv from 'dotenv';
dotenv.config();

// Define your types/interfaces at the top
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Weather {
  city: string;
  date: string;
  tempF: number;
  icon: string;
  iconDescription: string;
  humidity: number;
  windSpeed: number;
}

class WeatherService {
  private baseURL: string;
  private apiKey: string;
  private cityName: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
    this.cityName = '';
  }

  private async fetchLocationData(query: string): Promise<any> {
    const locationURL = `${this.baseURL}/geo/1.0/direct?q=${query}&appid=${this.apiKey}`;
    const response = await fetch(locationURL);
    return response.json();
  }

  private destructureLocationData(locationData: any): Coordinates {
    return {
      latitude: locationData[0]?.lat,
      longitude: locationData[0]?.lon,
    };
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}&units=imperial`;
  }

  private async buildForecastQuery(coordinates: Coordinates): Promise<any> {
    const response = await fetch(`${this.baseURL}/data/2.5/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}&units=metric`);
    return response.json();  // Parse the response here
  }

  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const weatherURL = this.buildWeatherQuery(coordinates);
    const response = await fetch(weatherURL);
    return response.json();
  }

  private parseCurrentWeather(response: any): Weather {
    return {
      city: this.cityName,
      date: new Date(response.dt * 1000).toLocaleString(),
      tempF: response.main.temp,
      icon: response.weather[0].icon,
      iconDescription: response.weather[0].description,
      humidity: response.main.humidity,
      windSpeed: response.wind.speed,
    };
  }

  private buildForecastArray(weatherData: any[]): Weather[] {
    return weatherData.map((data) => ({
      city: this.cityName,
      date: new Date(data.dt * 1000).toLocaleString(),
      tempF: data.main.temp,
      icon: data.weather[0].icon,
      iconDescription: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
    }));
  }

  async getWeatherForCity(city: string): Promise<Weather[]> {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    const fiveDayForecast = await this.buildForecastQuery(coordinates);
    const forecastArray = this.buildForecastArray(fiveDayForecast.list); // Ensure to access `list` here
    return [this.parseCurrentWeather(weatherData), ...forecastArray]; // Correctly return forecastArray elements
  }
}

export default new WeatherService();
