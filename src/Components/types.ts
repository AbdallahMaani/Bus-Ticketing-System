export type Trip = {
  trip_id: string;
  route_id: string;
  bus_id: string;
  departure_date: string;
  departure_time: string;
  available_seats: number;
  price_JOD: number;
  status: string;
  origin_name: string;
  destination_name: string;
  bus_type: string;
  features: string[];
  driver_name: string;
  rating?: number;
  
  // Origin Station Details
  origin_station_id: string;
  origin_station_name: string;
  origin_station_name_en: string;
  origin_street: string;
  origin_lat?: number;
  origin_lng?: number;
  
  // Destination Station Details
  destination_station_id: string;
  destination_station_name: string;
  destination_station_name_en: string;
  destination_street: string;
  destination_lat?: number;
  destination_lng?: number;
};

export type Areas = {
  id: string;
  name_en: string;
  city_id: string;
  lat: number;
  lng: number;
  station_name: string;
  street_en: string;
};

export type City = {
  id: string;
  nameEn: string;
  busStations: Areas[];
};