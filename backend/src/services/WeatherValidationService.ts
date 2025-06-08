export class WeatherValidationService {
  static validateWeatherData(data: {
    temperature: number;
    rainfall: number;
    humidity: number;
    windSpeed?: number;
  }): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    let isValid = true;

    // Validation de la température (climat sénégalais)
    if (data.temperature < 15 || data.temperature > 50) {
      warnings.push(`Température inhabituelle: ${data.temperature}°C`);
    }

    // Validation de l'humidité
    if (data.humidity < 0 || data.humidity > 100) {
      warnings.push(`Humidité invalide: ${data.humidity}%`);
      isValid = false;
    }

    // Validation des précipitations
    if (data.rainfall < 0 || data.rainfall > 500) {
      warnings.push(`Précipitations inhabituelles: ${data.rainfall}mm`);
    }

    // Validation de la vitesse du vent
    if (data.windSpeed && (data.windSpeed < 0 || data.windSpeed > 200)) {
      warnings.push(`Vitesse du vent inhabituelle: ${data.windSpeed}km/h`);
    }

    return { isValid, warnings };
  }

  static getWeatherAdvice(data: {
    temperature: number;
    rainfall: number;
    humidity: number;
  }): string[] {
    const advice: string[] = [];

    // Conseils basés sur la température
    if (data.temperature > 35) {
      advice.push("Température élevée : Prévoir irrigation supplémentaire");
    }
    if (data.temperature < 20) {
      advice.push("Température basse : Surveiller la croissance des plants");
    }

    // Conseils basés sur l'humidité
    if (data.humidity > 80) {
      advice.push("Humidité élevée : Risque de maladies fongiques");
    }
    if (data.humidity < 40) {
      advice.push("Air sec : Augmenter l'irrigation");
    }

    // Conseils basés sur les précipitations
    if (data.rainfall > 100) {
      advice.push("Fortes précipitations : Vérifier le drainage des parcelles");
    }
    if (data.rainfall === 0 && data.temperature > 30) {
      advice.push("Conditions sèches et chaudes : Irrigation recommandée");
    }

    return advice;
  }
}
