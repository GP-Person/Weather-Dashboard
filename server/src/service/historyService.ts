import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const historyFilePath = path.join(__dirname, '../searchHistory.json');

class City {
  constructor(public id: number, public name: string) {}
}

class HistoryService {
  // Method to read from the searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      const data = await fs.promises.readFile(historyFilePath, 'utf-8');
      const cities = JSON.parse(data);
      return cities.map((city: any) => new City(city.id, city.name)); // Map to City objects
    } catch (error) {
      return []; // Return an empty array if there's an error
    }
  }

  // Method to write the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    try {
      await fs.promises.writeFile(historyFilePath, JSON.stringify(cities, null, 2));
    } catch (error) {
      throw new Error('Error writing to search history file');
    }
  }

  // Method to get cities from the search history
  async getCities(): Promise<City[]> {
    return await this.read();
  }

  // Method to add a city to the search history
  async addCity(cityName: string): Promise<void> {
    const cities = await this.getCities();
    const cityExists = cities.some(city => city.name === cityName);

    // Add city only if it doesn't exist
    if (!cityExists) {
      const newCity = new City(Date.now(), cityName); // Generate a unique ID
      cities.push(newCity);
      await this.write(cities);
    }
  }

  // BONUS: Method to remove a city from the search history
  async removeCity(id: string): Promise<void> {
    const cities = await this.getCities();
    const updatedCities = cities.filter(city => city.id.toString() !== id);
    await this.write(updatedCities);
  }
}

export default new HistoryService();