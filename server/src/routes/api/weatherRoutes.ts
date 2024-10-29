import { Router, Request, Response } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

const router = Router();

// POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  const { cityName } = req.body;

  if (!cityName) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    // Get weather data from city name
    const weatherData = await WeatherService.getWeatherForCity(cityName);

    // Check if weatherData is valid
    if (!weatherData) {
      return res.status(404).json({ error: "Weather data not found for the specified city" });
    }

    // Save city to search history
    await HistoryService.addCity(cityName);

    return res.status(200).json(weatherData);
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ error: "Error fetching weather data" });
  }
});

// GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const history = await HistoryService.getCities();
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving search history" });
  }
});

// DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updatedHistory = await HistoryService.removeCity(id);
    res.status(200).json(updatedHistory);
  } catch (error) {
    res.status(500).json({ error: "Error deleting city from search history" });
  }
});

export default router;
