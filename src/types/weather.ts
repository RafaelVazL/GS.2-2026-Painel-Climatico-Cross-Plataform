export type Place = {
  id: number;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
};

export type ForecastHour = {
  endTime: number;
  probability: number | null;
  precipitation: number | null;
};

export type Forecast = {
  placeId: number;
  timezone: string;
  consultedAt: number;
  hours: ForecastHour[];
};

export type Preferences = {
  place: Place;
  threshold: number;
};
