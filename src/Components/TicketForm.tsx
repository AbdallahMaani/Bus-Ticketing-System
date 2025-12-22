"use client";
import React, { useState, useEffect } from "react";
import {
  Select,
  Title,
  Paper,
  Stack,
  Text,
} from "@mantine/core";

export type Criteria = {
  from: string;
  to: string;
  date: string;
  sortBy: string;
  filters: string[];
};  

type CityOption = {
  value: string;
  label: string;
};

export type Route = {
  route_id: string;
  origin_id: string;
  destination_id: string;
  distance_km : number;
  duration_hrs: number;
};

type Bus = {
  bus_id: string;
  rating: number;
  features: string[];
  driver_name: string;
};

export type Areas = {
  id: string;
  city_id: string;
  name_en: string;
  station_name: string;
  street_en: string;
  lat?: number;
  lng?: number;
};

export type Trip = { 
  trip_id: string;
  route_id: string;
  bus_id: string;
  departure_date: string;
  departure_time: string;
  distance_km?: number; 
  duration_hrs?: number; 
  available_seats: number;
  price_JOD: number;
  origin_name?: string;
  destination_name?: string;
  features: string[];
  driver_name: string;
  rating?: number;
  area_name?: string;
  station_name?: string;
  origin_station?: string;
  origin_street?: string;
  destination_station?: string;
  destination_street?: string;
  origin_lat?: number;
  origin_lng?: number;
  destination_lat?: number;
  destination_lng?: number;
}; // types are in general used to define the shape of data objects and ensure type safety in TypeScript applications
// export type in general used to make types available for import in other files

export default function TicketForm({ onResults, onReset, resetKey, from, setFrom, to, setTo }: {onResults?: (trips: Trip[]) => void; onReset?: () => void; resetKey?: number; from: string | null; setFrom: (value: string | null) => void; to: string | null; setTo: (value: string | null) => void; }) 
{
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [areas, setAreas] = useState<Areas[]>([]);
  const [noResults, setNoResults] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/jordan_bus_data.json");

        if (!res.ok) {
          console.log("❌ No response from JSON file");
          return;
        }

        const data = await res.json(); 

        // Cities
        if (Array.isArray(data.cities)) { //Array is an object and .isArray is a method that checks if the provided value is an array. Here, it ensures that data.cities is indeed an array before proceeding to map over it.
          // Populate cityOptions from areas to allow selection of specific locations
          setCityOptions( // Map cities to CityOption format
            data.cities.map((city: { id: string; name_en: string }) => ({
              value: city.id, // Use city ID as the value
              label: city.name_en, // Use city name as the label
            }))
          );
        }

        if (Array.isArray(data.areas)) {
          setAreas(data.areas);
        }

        // Other data
        setRoutes(data.routes || []);
        setBuses(data.buses || []);
        setTrips(data.trips || []);
      } catch (err) {
        console.error("❌ Error loading JSON:", err);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    const performSearch = () => {
      if (!from || !to) return;

    
      const selectedFromCity = cityOptions.find(c => c.value === from);
      const selectedToCity = cityOptions.find(c => c.value === to);

      if (!selectedFromCity || !selectedToCity) {
        setNoResults(true);
        if (onResults) onResults([]); 
        return;
      }

      // Use the selected city IDs to match routes
      const fromCityId = from; // 'from' is now a prop
      const toCityId = to;     // 'to' is now a prop

      
      const matchedRoutes = routes.filter(
        (r) => r.origin_id === fromCityId && r.destination_id === toCityId
      );

      const filteredTrips = trips.filter((t) =>
        matchedRoutes.some((r) => r.route_id === t.route_id)
      );

     // static data for testing
      const enrichedTrips = filteredTrips.map((trip) => {
        const route = routes.find((r) => r.route_id === trip.route_id);
        if (!route) return trip; // Should not happen if filteredTrips are valid

        // Determine the default origin and destination areas based on the route's city IDs
        let tripOriginArea = areas.find(a => a.city_id === route.origin_id);
        const tripDestinationArea = areas.find(a => a.city_id === route.destination_id);

        // Apply specific overrides for R191 and R192 if the origin city is Amman
        if (route.origin_id === "LOC_AMN") {
          if (trip.route_id === "R191") {
           
            tripOriginArea = areas.find(a => a.id === "AREA_AMN_2") || tripOriginArea;
          } else if (trip.route_id === "R192") {
            tripOriginArea = areas.find(a => a.id === "AREA_AMN_3") || tripOriginArea;
          }
        }

        // If we still can't find areas (e.g., city has no defined areas), return original trip
        if (!tripOriginArea || !tripDestinationArea) return trip;

      

        const originLabel = selectedFromCity.label;
        const destinationLabel = selectedToCity.label;

        return {
          ...trip,
          origin_name: originLabel,
          destination_name: destinationLabel,
          rating: buses.find((b) => b.bus_id === trip.bus_id)?.rating || 0,
          features: buses.find((b) => b.bus_id === trip.bus_id)?.features || [],
          driver_name:
            buses.find((b) => b.bus_id === trip.bus_id)?.driver_name || "",
          origin_station: tripOriginArea.station_name,
          origin_street: tripOriginArea.street_en,
          origin_lat: tripOriginArea.lat,
          origin_lng: tripOriginArea.lng,
          distance_km: route.distance_km,
          duration_hrs: route.duration_hrs, 
          destination_station: tripDestinationArea.station_name,
          destination_street: tripDestinationArea.street_en,
          destination_lat: tripDestinationArea.lat,
          destination_lng: tripDestinationArea.lng,
        };
      });

      if (enrichedTrips.length === 0) {
        setNoResults(true);
      } else {
        setNoResults(false);
      }

      

      if (onResults) {
        onResults(enrichedTrips);
      }
    };

    performSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, areas, routes, trips, buses, cityOptions]);

  /* reset when parent requests it  the parent is page.tsx */
  useEffect(() => {
    if (resetKey === undefined) return;

    setFrom(null);
    setTo(null);
    setNoResults(false);
    // notify parent if needed
    if (onReset) onReset(); // 'onReset' is a prop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]); // we use resetKey as a simple counter that increments and trigger the useEffect when parent wants to reset

  
  const blackTextStyle = {
    label: { color: "black", fontWeight: 500 },
    input: { color: "black" },
  };

  return (
    <Paper
      component="form"
      p="1.5rem"
      radius={20}
      bg="white"
      style={{
        position: "sticky",
        top: "1rem",
        boxShadow: "0px 0px 40px 1px #00000026",
        height: "fit-content",
        zIndex: 10,
      }}
      >
      <Stack gap="md">
        <Title order={3} style={{ color: "#222" }} ta="center">
          Find your trip
        </Title>
        <Select
          label="From"
          placeholder="Pick origin"
          data={cityOptions}
          value={from}
          onChange={setFrom}
          searchable
          nothingFoundMessage="No city found"
          styles={blackTextStyle}
          radius="md"
        />
        <Select
          label="To"
          placeholder="Pick destination"
          data={cityOptions}
          value={to}
          onChange={setTo}
          searchable
          nothingFoundMessage="No city found"
          styles={blackTextStyle}
          radius="md"
        />
        {noResults && (
          <Text size="sm" c="red" ta="center" fw={500}>
            Sorry, no trips found matching your criteria.
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
