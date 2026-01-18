/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Table, Paper, Text, Loader, Center, Group, Button } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { apiClientFetch } from "@/lib/apiClient";

type RouteDto = {
  routeId: string;
  fromStation?: string;
  toStation?: string;
  originId?: string;
  destinationId?: string;
  distanceKm?: number;
  distance?: number;
  durationHrs?: number;
};

export default function RoutesTable() {
  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityMap, setCityMap] = useState<Record<string, string>>({});

  const fetchCities = async () => {
    try {
      const res = await apiClientFetch("/api/City");
      if (res.ok) {
        const cities = await res.json();
        const map: Record<string, string> = {};
        if (Array.isArray(cities)) {
          cities.forEach((city: any) => {
            map[city.id] = city.nameEn || city.name || city.id;
          });
        }
        setCityMap(map);
      }
    } catch (err: any) {
      console.error("Failed to fetch cities:", err);
    }
  };

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await apiClientFetch("/api/Routes");
      if (!res.ok) throw new Error(`Failed to load routes (${res.status})`);
      const data = await res.json();
      setRoutes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      notifications.show({ title: "Routes", message: err.message || "Failed to load routes", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
    fetchRoutes();
  }, []);

  if (loading) {
    return (
      <Paper withBorder p="lg" radius="lg">
        <Center><Loader /></Center>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="lg" radius="lg">
      <Group justify="space-between" mb="lg">
        <Text fw={800} size="md">Routes ({routes.length})</Text>
        <Button size="md" variant="gradient" gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }} onClick={fetchRoutes} leftSection={<IconRefresh size={16} />} fw={600}>Refresh</Button>
      </Group>

      <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid rgba(6, 150, 217, 0.1)" }}>
        <Table verticalSpacing="lg" striped highlightOnHover fontSize="md">
          <Table.Thead style={{ background: "rgba(0, 113, 219, 0.12)" }}>
            <Table.Tr>
              <Table.Th ta="center" fw={700}>From (Origin)</Table.Th>
              <Table.Th ta="center" fw={700}>To (Destination)</Table.Th>
              <Table.Th ta="center" fw={700}>Distance (KM)</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {routes.map((r, idx) => (
              <Table.Tr key={r.routeId || idx}>
                <Table.Td ta="center" fw={600}>{cityMap[r.originId || ""] || r.fromStation || r.originId || "N/A"}</Table.Td>
                <Table.Td ta="center" fw={600}>{cityMap[r.destinationId || ""] || r.toStation || r.destinationId || "N/A"}</Table.Td>
                <Table.Td ta="center">{r.distanceKm || r.distance || 0}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </Paper>
  );
}