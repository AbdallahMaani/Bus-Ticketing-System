"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  Title,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import type { Trip } from "./types";
type CityOption = { value: string; label: string; };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7088";

export default function TicketForm({ 
  onResults, 
  onReset, 
  resetKey, 
  from, 
  setFrom, 
  to, 
  setTo 
}: { 
  onResults?: (trips: Trip[]) => void; 
  onReset?: () => void; 
  resetKey?: number; 
  from: string | null; 
  setFrom: (v: string | null) => void; 
  to: string | null; 
  setTo: (v: string | null) => void; 
}) {
  const [cities, setCities] = useState<any[]>([]);
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [noResults, setNoResults] = useState(false);
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/City`);
        if (!res.ok) return;
        const data = await res.json();
        setCities(data);
        setCityOptions(data.map((c: any) => ({ value: c.id, label: c.nameEn })));
      } catch (err) {
        console.error("Failed to load cities", err);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!from || !to) return;
      
      try {
        const params = new URLSearchParams();
        params.set("from", from);
        params.set("to", to);
        if (date) params.set("date", date);
        
        const res = await fetch(`${API_BASE_URL}/api/Trip/search?${params.toString()}`);
        if (!res.ok) {
          console.error("Trip search failed", res.status);
          if (onResults) onResults([]);
          setNoResults(true);
          return;
        }
        
        const data = await res.json();
        
        // Map backend TripDto -> UI Trip
        const mapped: Trip[] = data.map((t: any) => ({
          trip_id: t.tripId,
          route_id: t.routeId,
          bus_id: t.busId,
          departure_date: t.departureDate,
          departure_time: t.departureTime.slice(0, 5),
          available_seats: t.availableSeats,
          price_JOD: t.priceJod,
          status: t.status,
          origin_name: t.originName,
          destination_name: t.destinationName,
          bus_type: t.busType,
          features: (t.features ?? "").toString().split(",").map((s: string) => s.trim()).filter(Boolean),
          driver_name: t.driverName,
          rating: 0,
          
          // Origin Station Details
          origin_station_id: t.originStationId,
          origin_station_name: t.originStationName,
          origin_station_name_en: t.originStationNameEn,
          origin_street: t.originStationStreet,
          origin_lat: t.originStationLat,
          origin_lng: t.originStationLng,
          
          // Destination Station Details
          destination_station_id: t.destinationStationId,
          destination_station_name: t.destinationStationName,
          destination_station_name_en: t.destinationStationNameEn,
          destination_street: t.destinationStationStreet,
          destination_lat: t.destinationStationLat,
          destination_lng: t.destinationStationLng,
        }));
        
        setNoResults(mapped.length === 0);
        if (onResults) onResults(mapped);
      } catch (err) {
        console.error("Search error", err);
        if (onResults) onResults([]);
        setNoResults(true);
      }
    };
    performSearch();
  }, [from, to, date]);

  useEffect(() => {
    if (resetKey === undefined) return;
    setFrom(null);
    setTo(null);
    setNoResults(false);
    if (onReset) onReset();
  }, [resetKey]);

  return (
    <Paper 
      component="form" 
      p="1.5rem" 
      radius={20} 
      bg="white" 
      style={{ 
        position: "sticky", 
        top: "1rem", 
        height: "fit-content", 
        zIndex: 10 
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
          radius="md" 
        />
        
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          style={{ 
            padding: '10px', 
            borderRadius: 8, 
            border: '1px solid #ced4da',
            fontSize: '14px'
          }} 
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