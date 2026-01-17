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
    fetchRoutes();
  }, []);

  if (loading) {
    return (
      <Paper withBorder p="md">
        <Center><Loader /></Center>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" mb="sm">
        <Text fw={700}>Routes ({routes.length})</Text>
        <Button size="xs" variant="outline" onClick={fetchRoutes} leftSection={<IconRefresh size={16} />}>Refresh</Button>
      </Group>

      <div style={{ overflowX: "auto" }}>
        <Table verticalSpacing="sm" striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>From</Table.Th>
              <Table.Th>To</Table.Th>
              <Table.Th>Distance (km)</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {routes.map((r, idx) => (
              <Table.Tr key={r.routeId || idx}>
                <Table.Td>{r.fromStation || r.originId}</Table.Td>
                <Table.Td>{r.toStation || r.destinationId}</Table.Td>
                <Table.Td>{r.distanceKm || r.distance || 0}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </Paper>
  );
}
