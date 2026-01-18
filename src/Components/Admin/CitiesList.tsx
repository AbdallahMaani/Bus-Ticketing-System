/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Table, Paper, Text, Loader, Center, Group, Button } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { apiClientFetch } from "@/lib/apiClient";

type CityDto = {
  id: string;
  nameEn?: string;
  name?: string;
  nameAr?: string;
};

export default function CitiesTable() {
  const [cities, setCities] = useState<CityDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await apiClientFetch("/api/City");
      if (!res.ok) throw new Error(`Failed to load cities (${res.status})`);
      const data = await res.json();
      setCities(Array.isArray(data) ? data : []);
    } catch (err: any) {
      notifications.show({ title: "Cities", message: err.message || "Failed to load cities", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
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
        <Text fw={800} size="xl">Cities ({cities.length})</Text>
        <Button size="md" variant="gradient" gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }} onClick={fetchCities} leftSection={<IconRefresh size={16} />} fw={600}>Refresh</Button>
      </Group>

      <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid rgba(6, 150, 217, 0.1)" }}>
        <Table verticalSpacing="lg" striped highlightOnHover fontSize="md">
          <Table.Thead style={{ background: "rgba(0, 113, 219, 0.12)" }}>
            <Table.Tr>
              <Table.Th ta="center" fw={700}>City ID</Table.Th>
              <Table.Th ta="center" fw={700}>English Name</Table.Th>
              <Table.Th ta="center" fw={700}>Arabic Name (Original)</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {cities.map((c, idx) => (
              <Table.Tr key={c.id || idx}>
                <Table.Td ta="center" fw={600} c="dimmed">{c.id}</Table.Td>
                <Table.Td ta="center" fw={600}>{c.nameEn || c.name || "-"}</Table.Td>
                <Table.Td ta="center">{c.nameAr || c.name || "-"}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </Paper>
  );
}