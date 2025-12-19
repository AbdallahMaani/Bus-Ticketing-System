"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  Button,
  Group,
  Title,
  Paper,
  Stack,
  Text,
} from "@mantine/core";

/*  TYPES  */

type Criteria = {
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

type Route = {
  route_id: string;
  origin_id: string;
  destination_id: string;
};

type Bus = {
  bus_id: string;
  rating: number;
  features: string[];
  driver_name: string;
};

type Areas = {
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
};

/*  Component  */

export default function TicketForm({
  onSearch,
  onResults,
  onReset,
  resetKey,
}: {
  onSearch?: (criteria: Criteria) => void;
  onResults?: (trips: Trip[]) => void;
  onReset?: () => void;
  resetKey?: number;
}) {
  /*  States  */
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [areas, setAreas] = useState<Areas[]>([]);

  const [from, setFrom] = useState<string | null>("");
  const [to, setTo] = useState<string | null>("");
  const [noResults, setNoResults] = useState(false);

  /*  Fetch JSON  */
  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const res = await fetch("/jordan_bus_data.json");

        if (!res.ok) {
          console.log("❌ No response from JSON file");
          return;
        }

        const data = await res.json();
        console.log("✅ JSON loaded successfully:", data);

        // Cities
        if (Array.isArray(data.cities)) {
          setCityOptions(
            data.cities.map((city: any) => ({
              value: city.id,
              label: city.name_en,
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

    fetchBusData();
  }, []);

  /* perform a search when both from and to are selected */
  useEffect(() => {
    const performSearch = () => {
      if (!from || !to) return;

      // 1️⃣ Match routes
      const matchedRoutes = routes.filter(
        (r) => r.origin_id === from && r.destination_id === to
      );

      // 2️⃣ Filter trips by route
      let filteredTrips = trips.filter((t) =>
        matchedRoutes.some((r) => r.route_id === t.route_id)
      );

      // Enrich trips with city names
      const enrichedTrips = filteredTrips.map((trip) => {
        const route = routes.find((r) => r.route_id === trip.route_id);
        const origin = cityOptions.find((c) => c.value === route?.origin_id)
          ?.label;
        const destination = cityOptions.find(
          (c) => c.value === route?.destination_id
        )?.label;

        const originArea = areas.find((a) => a.city_id === route?.origin_id);
        const destArea = areas.find((a) => a.city_id === route?.destination_id);

        return {
          ...trip,
          origin_name: origin,
          destination_name: destination,
          rating: buses.find((b) => b.bus_id === trip.bus_id)?.rating || 0,
          features: buses.find((b) => b.bus_id === trip.bus_id)?.features || [],
          driver_name:
            buses.find((b) => b.bus_id === trip.bus_id)?.driver_name || "",
          origin_station: originArea?.station_name,
          origin_street: originArea?.street_en,
          origin_lat: originArea?.lat,
          origin_lng: originArea?.lng,
          destination_station: destArea?.station_name,
          destination_street: destArea?.street_en,
          destination_lat: destArea?.lat,
          destination_lng: destArea?.lng,
        };
      });

      if (enrichedTrips.length === 0) {
        setNoResults(true);
      } else {
        setNoResults(false);
      }

      if (onSearch) {
        onSearch({
          from: from || "",
          to: to || "",
          date: "",
          sortBy: "departure",
          filters: [],
        });
      }

      if (onResults) {
        onResults(enrichedTrips);
      }
    };

    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  /* reset when parent requests it */
  useEffect(() => {
    if (resetKey === undefined) return;
    // clear local state
    setFrom(null);
    setTo(null);
    setNoResults(false);
    // notify parent if needed
    if (onReset) onReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  /* ===== Styles ===== */
  const blackTextStyle = {
    label: { color: "black", fontWeight: 500 },
    input: { color: "black" },
  };

  /*  JSX  */

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
