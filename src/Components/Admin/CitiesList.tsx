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
      <Paper withBorder p="md">
        <Center><Loader /></Center>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" mb="sm">
        <Text fw={700}>Cities ({cities.length})</Text>
        <Button size="xs" variant="outline" onClick={fetchCities} leftSection={<IconRefresh size={16} />}>Refresh</Button>
      </Group>

      <div style={{ overflowX: "auto" }}>
        <Table verticalSpacing="sm" striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Name</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {cities.map((c, idx) => (
              <Table.Tr key={c.id || idx}>
                <Table.Td>{c.id}</Table.Td>
                <Table.Td>{c.nameEn || c.name}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </Paper>
  );
}
