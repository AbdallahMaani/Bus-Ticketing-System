"use client";

import React, { useState } from "react";
import {
  Select,
  TextInput,
  Checkbox,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  ActionIcon,
  Title,
} from "@mantine/core";
import type { Trip } from "./TicketForm";


export default function AdvancedFilters({onResults,onClose,onReset,currentTrips,onClearMapRoutes}: {onResults?: (trips: Trip[]) => void;  onClose?: () => void;  onReset?: () => void;  currentTrips: Trip[];  onClearMapRoutes?: () => void; })
{
  const [date, setDate] = useState("");
  const [sortBy, setSortBy] = useState<string | null>("departure");
  const [filters, setFilters] = useState<string[]>([]);
  const [noResults, setNoResults] = useState(false);

  /* ===== Helpers ===== */
  const toggleFilter = (name: string) => {
    setFilters((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
    setNoResults(false);

    // Start with current trips
    let filteredTrips = currentTrips.slice();

    // 1️ Filter by date
    if (date) {
      filteredTrips = filteredTrips.filter((t) => t.departure_date === date);
    }

    // 2️Filter by bus features
    filteredTrips = filteredTrips.filter((trip) => {
      return filters.every((f) => trip.features.includes(f));
    });

    // Sorting
    if (sortBy === "price") {
      filteredTrips.sort((a, b) => a.price_JOD - b.price_JOD);
    } else if (sortBy === "rating") {
      filteredTrips.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "available") {
      filteredTrips.sort((a, b) => b.available_seats - a.available_seats);
    }

    // Already enriched
    const enrichedTrips = filteredTrips;

    if (enrichedTrips.length === 0) {
      setNoResults(true);
    }

    if (onResults) {
      onResults(enrichedTrips);
    }
  };

  const handleReset = () => {
    // if parent provided a centralized reset handler, use it
    if (onReset) {
      onReset();
    }

    // Clear map routes and markers
    if (onClearMapRoutes) {
      onClearMapRoutes();
    }

    setDate("");
    setSortBy("departure");
    setFilters([]);
    setNoResults(false);

    // Only restore current trips if we didn't trigger a global reset
    if (onResults && !onReset) {
      onResults(currentTrips);
    }
  };

  const blackTextStyle = {
    label: { color: "black", fontWeight: 500 },
    input: { color: "black" },
  };

  return (
    <Paper
      component="form"
      p="1.5rem"
      radius={20}
      bg="rgba(240, 240, 240, 0.45)" // Hardcoded light background with transparency
      shadow="xl"
      style={{ backdropFilter: "blur(20px)" }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={4} c="black">Advanced Filters</Title>
          {onClose && (
            <ActionIcon variant="subtle" color="gray" onClick={onClose}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </ActionIcon>
          )}
        </Group>

        <TextInput
          type="date"
          label="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          styles={blackTextStyle}
          radius="md"
        />

        <Select
          label="Sort By"
          data={[
            { value: "departure", label: "Departure Time" },
            { value: "price", label: "Price (Low to High)" },
            { value: "rating", label: "Rating (High to Low)" },
            { value: "available", label: "Available Seats" },
          ]}
          value={sortBy}
          onChange={setSortBy}
          styles={blackTextStyle}
          radius="md"
        />

        <Group gap="xs">
          {["A/C", "WiFi", "WC", "USB Charge", "TV", "Reclining Seats"].map(
            (f) => (
              <Checkbox
                key={f}
                label={f}
                checked={filters.includes(f)}
                onChange={() => toggleFilter(f)}
                styles={{ label: { color: "black" } }}
              />
            )
          )}
        </Group>

        {noResults && (
          <Text size="sm" c="red" ta="center" fw={500}>
            Sorry, no trips found matching your criteria.
          </Text>
        )}

        <Group mt="sm" grow>
          <Button type="submit" radius="md" color="blue" onClick={handleSubmit}>
            Apply Filters
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={handleReset}
            radius="md"
            color="blue"
          >
            Reset
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}